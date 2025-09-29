from pydantic import BaseModel
class Text2QueryRequest(BaseModel):
    prompt: str    