from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    gemini_ai_api_key :str = Field(...,env="GEMINI_AI_API_KEY")
    open_ai_api_key: str= Field(...,env="OPEN_AI_API_KEY")
    atlas_connection_string: str =Field(..., env="ATLAS_CONNECTION_STRING")
    atlas_db_name: str = Field (..., env="ATLAS_DB_NAME")
    atlas_db_rag: str = Field (..., env="ATLAS_DB_RAG")
    atlas_collection_rag: str = Field (..., env="ATLAS_COLLECTION_RAG")
    index_name: str = Field (..., env="INDEX_NAME")
    model_registry: dict = Field (...,env="MODEL_REGISTRY")
    max_llm_retry: int =Field(5, env="MAX_LLM_RETRY")
    max_user_retry: int= Field(5, env="MAX_USER_RETRY")
    redis_host: str= Field(...,env="REDIS_HOST")
    redis_port: int= Field(6379,env="REDIS_PORT")
    redis_username: str=Field(...,env="default")
    redis_password: str=Field(...,env="REDIS_PASSWORD")
    class Config:
        env_file=".env"
        env_file_encoding="utf-8"    

settings=Settings()