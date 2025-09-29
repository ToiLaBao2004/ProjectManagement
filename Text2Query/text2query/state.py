from pydantic import BaseModel
from typing import List, Dict,Any
from helper.convert_objectId import convert_objectid
import json

class State(BaseModel):
    session_id: str=""
    prompt: str = ""
    translated: str = ""
    context: List[Dict[str, Any]] = []
    raw_query: str = ""
    cleaned_raw_query: str=""
    query: Dict = {}
    error: Dict[str, List[Dict[str, Any]]] = {}
    is_error: bool= False
    llm_retry_count: int = 0
    user_retry_count: int =0
    result: list[dict] = []
    is_again: bool = False
def print_state(state: State):
    print("session_id:",state.session_id)
    print("prompt:", state.prompt)
    print("translated:", state.translated)
    print("context:", json.dumps(state.context, ensure_ascii=False, indent=2))
    print("cleaned_raw_query:", state.cleaned_raw_query)
    print("query:", json.dumps(convert_objectid(state.query), ensure_ascii=False, indent=2))
    print("error:", json.dumps(state.error, ensure_ascii=False, indent=2) if state.error else None)
    print("is_error:",state.is_error)
    print("llm_retry_count:",state.llm_retry_count)
    print("result:", json.dumps(convert_objectid(state.result), ensure_ascii=False, indent=2))
    print("is_again:",state.is_again)