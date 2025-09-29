from text2query.graph import Text2QueryPipeline
from fastapi import FastAPI,HTTPException
from dto.request.text_to_query_request import Text2QueryRequest
from dto.request.confirm_request import ConfirmRequest
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()
pipeline=Text2QueryPipeline()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/text2query")
async def text_to_query(request: Text2QueryRequest):
    result=pipeline.start_query(request.prompt)
    return result

@app.post("/confirm_query")
async def confirm_query(request: ConfirmRequest):
    if request.is_confirm:
        return pipeline.confirm()
    else:
        if not request.new_prompt or not request.new_prompt.strip():
            raise HTTPException(status_code=400, detail="New prompt must not be blank")
        return pipeline.reject(request.new_prompt.strip())