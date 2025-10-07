from text2query.services import services
from pymongo.errors import PyMongoError
from configs.constant import EXAMPLE_QUERY_JSON
from helper import clean_raw_query,store_history_chat
from text2query.state import print_state
import json
from helper import debug_state
 
def translate_node(state):
    state.translated=services.translator.translate(state.prompt)
    print(state.translated)
    return state

def retrieve_node(state):
    docs=services.vector_search.search_with_score(state.translated)
    for doc, score in docs:
        state.context.append({
            "content":doc.page_content,
            "score":score
        })
    return state


def generate_query_node(state):
        prompt = f"""
        You are an assistant that generates MongoDB queries. 
        The MongoDB database stores data for a project management system. 
        The context below describes the schema of the collections and their fields.

        Context (schema description): {state.context}

        User question: {state.translated}

        Task:
        - Generate a valid MongoDB query in JSON format to answer the user’s question.  
        - The query must match the schema from the context.  
        - The JSON MUST contain:
            1. "collection": the collection name.
            2. "aggregate": a list of aggregation stages (list of dicts, not a string).  
        - Do not include "db." or "collection.aggregate()" in the output.  
        - Do not explain or add extra text, only return the JSON query.
        Example of query format:
        {EXAMPLE_QUERY_JSON}
        """
        response=services.llm.invoke(prompt)
        state.raw_query=response.content
        return state

def validate_query_node(state):
    
    errors={}
    try:
        state.cleaned_raw_query=clean_raw_query.clean_query(state.raw_query)
        
        query=json.loads(state.cleaned_raw_query)
        
    except json.JSONDecodeError as e:
        state.query={}
    
        state.error.setdefault(state.cleaned_raw_query, []).append({
            "message": f"Invalid JSON format: {e}"
        })
        state.is_error=True
        return state
        
    if not isinstance(query,dict):
        errors["query_type"] = "Query must be a JSON object (dict)."
    
    if "collection" not in query or not query.get("collection"):
        errors["collection"] = "Missing or empty 'collection' field."
        
    if "aggregate" not in query:
        errors["aggregate"] = "Missing 'aggregate' field."
    elif not isinstance(query["aggregate"],list):
        errors["aggregate_type"] = "'aggregate' must be a list of stages (list of dicts)."
    else:
        for idx,stage in enumerate(query["aggregate"]):
            if not isinstance(stage,dict):
                errors[f"aggregate_stage_{idx}"] = f"Stage {idx} in 'aggregate' is not a dict."
    
    if errors:
        state.query={}
        for field, msg in errors.items():
            state.error.setdefault(state.cleaned_raw_query, []).append({
                "field": field,
                "message": msg
            })
        state.is_error=True
    else:
        state.query=query
    return state

def execute_query_node(state):
    try:
        query=state.query
        collection_name=query.get("collection")
        collection=services.db[collection_name]
        
        pipeline=query["aggregate"]
        result=list(collection.aggregate(pipeline))
        
        state.result=debug_state.convert_objectid(result)
        return state
    
    except PyMongoError as e:
        state.error.setdefault(state.cleaned_raw_query,[]).append({"mongodb_error": {
            "message": str(e)
        }}) 
        state.is_error=True
        state.result=[]
        return state
    
    except Exception as e:

        state.error.setdefault(state.cleaned_raw_query, []).append({"unexpected_error": str(e)})
        state.is_error=True
        state.result=[]
        return state
        
def handle_error_node(state):
    print(len(state.error))
    if state.error:
        fix_prompt = f"""
            Prompt: {state.translated}
            Error: {state.error}
            Context: {state.context}

            Task:
            - Based on the Prompt, the Error, and the Context, fix the MongoDB query.
            - The output MUST be valid JSON with:
                1. "collection": the collection name.
                2. "aggregate": a list of aggregation stages (list of dicts, not a string).
            - Do not include "db." or "collection.aggregate()" in the output.
            - Do not explain or add extra text, only return the JSON query.
            Example of correct query format:
            {EXAMPLE_QUERY_JSON}
            """
        
        response=services.llm.invoke(fix_prompt)
        state.raw_query=response.content
    state.is_error=False
    state.llm_retry_count+=1
     
    return state
    
def result_node(state):
    if not state.result:
        state.result = [{"NOT FOUND": "No document found"}]
    
    
    store_history_chat.add_chat(services.redis,
                                        state.session_id,
                                        state.prompt,
                                        state.cleaned_raw_query)
    
    print_state(state)
    return state

def rewrite_prompt_node(state):
    history_chat=store_history_chat.get_chat(services.redis,state.session_id)
    rewrite_prompt = f"""
        You are a helpful assistant that rewrites user queries.

        ### Context
        Conversation history:
        {json.dumps(history_chat, ensure_ascii=False, indent=2)}

        Latest user input:
        "{state.prompt}"

        ### Task
        - Merge the conversation history with the latest user input.
        - Rewrite the user’s intent into ONE single, clear, and concise prompt.
        - Remove irrelevant or redundant phrases unrelated to the actual query, such as "What I mean is", "Not that, but", etc.
        - The output MUST be in strict JSON format:

        {{
            "prompt": "rewritten prompt here"
        }}
        """
    response=services.llm.invoke(rewrite_prompt)
    raw_prompt=clean_raw_query.clean_query(response.content)
    print(raw_prompt)
    json_prompt=json.loads(raw_prompt)
    state.prompt=json_prompt.get("prompt")
    return state

def error_node(state):
    state.result = [{"Error": "Pipeline đã đạt mức giới hạn thử lại, hãy mô tả rõ ràng hơn"}]
    return state
