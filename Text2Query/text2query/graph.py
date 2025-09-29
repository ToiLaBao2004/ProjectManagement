from langgraph.graph import StateGraph,START,END
from text2query.nodes import (translate_node, retrieve_node, generate_query_node,
                   validate_query_node, execute_query_node,handle_error_node
                   ,result_node,rewrite_prompt_node,error_node)
from text2query.state import State, print_state
from configs.settings import settings
from helper import store_history_chat
from langgraph.checkpoint.memory import MemorySaver
import uuid,json
from text2query.services import services
from configs.paths import DATA_DIR
class Text2QueryPipeline:
    def __init__(self):
        self.graph=StateGraph(State)
        self.state=None
        self.memory=MemorySaver()
        self.graph.add_node("translate_node",translate_node)
        self.graph.add_node("retrieve_node",retrieve_node)
        self.graph.add_node("generate_query_node",generate_query_node)
        self.graph.add_node("validate_query_node",validate_query_node)
        self.graph.add_node("execute_query_node",execute_query_node)
        self.graph.add_node("handle_error_node",handle_error_node)
        self.graph.add_node("result_node",result_node)
        self.graph.add_node("rewrite_prompt_node",rewrite_prompt_node)
        self.graph.add_node("error_node",error_node)
        self.build_graph()
        
        self.app=self.graph.compile(checkpointer=self.memory)
    
    def check_user_retry_and_direct_node(self,state):
        if state.is_again:  
            if state.user_retry_count >= settings.max_user_retry:
                return "stop"
            else:
                return "yes"
        else:
            return "no"
    
    def check_llm_retry_and_error(self,state):
        if state.llm_retry_count >= settings.max_llm_retry:
            return "stop"
        else:
            if state.is_error:
                return "error"
            else:
                return "ok"
    
    def build_graph(self):
        
        self.graph.add_conditional_edges(START,self.check_user_retry_and_direct_node,
                                         {
                                             "yes":"rewrite_prompt_node",
                                             "no": "translate_node",
                                             "stop": "error_node"
                                         })
        self.graph.add_edge("rewrite_prompt_node","translate_node")
        self.graph.add_edge("translate_node","retrieve_node")
        self.graph.add_edge("retrieve_node","generate_query_node")
        self.graph.add_edge("generate_query_node","validate_query_node")

        self.graph.add_conditional_edges("validate_query_node",
                                         self.check_llm_retry_and_error,
                                         {
                                             "error": "handle_error_node",
                                             "ok": "execute_query_node",
                                             "stop": "error_node"
                                         })

        self.graph.add_conditional_edges("execute_query_node",
                                         self.check_llm_retry_and_error,
                                         {
                                             "error": "handle_error_node",
                                             "ok": "result_node",
                                             "stop": "error_node"
                                         })
        self.graph.add_edge("handle_error_node","validate_query_node")
        
        self.graph.add_edge("result_node",END)
        
        self.app=self.graph.compile(checkpointer=self.memory)

    def start_query(self, prompt):
        session_id=str(uuid.uuid4())
        self.state = State(prompt=prompt,session_id=session_id)
        self.config = {
                "configurable": {"thread_id": session_id},
                "recursion_limit": 50
            }
        
        state_dict=self.app.invoke(self.state,config=self.config)
        self.state=State.model_validate(state_dict)
        print(type(self.state))
        return self.state.result
    
    def confirm(self):
        try:
            guideline = {
                "chunk_type": "syntax_guideline",
                "collection_name": self.state.query.get("collection"),
                "prompt": self.state.translated,  
                "query": self.state.query,                
                "metadata": {
                    "languages": "en"
                }
            }
            data_path=DATA_DIR/"syntax_guideline.json"
            if data_path.exists():
                with open(data_path,"r",encoding="utf-8") as f:
                    data=json.load(f)
                if not isinstance(data,list):
                    data= []
            else:
                data=[]
            
            data.append(guideline)
            with open(data_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
            store_history_chat.clear_chat(services.redis,self.state.session_id)
            return [{"success": "Đã xác nhận kết quả truy vấn"}]
            
        except Exception as e:
            return [{"exception":f"Không thể lưu syntax ra file: {e}"}] 
            
    def reject(self, new_prompt):
        self.state.prompt=new_prompt
        self.state.is_again=True
        state_dict=self.app.invoke(self.state,config=self.config)
        self.state=State.model_validate(state_dict)
        return self.state.result
    
