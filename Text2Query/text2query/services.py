from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from helper.model_embedding import VectorSearch
from configs.settings import settings
from pymongo import MongoClient 
from redis import Redis
from helper.translate_model import Translator
class Services:
    def __init__(self):
        self.llm=ChatGoogleGenerativeAI(model=settings.model_registry["gemini"],
                            api_key=settings.gemini_ai_api_key,
                            temperature=0,
                            timeout=60)
        
        self.vector_search=VectorSearch()
        self.translator=Translator()
        self.client=MongoClient(settings.atlas_connection_string)
        self.db=self.client[settings.atlas_db_name]
        
        self.redis=Redis(host=settings.redis_host,port=settings.redis_port,
                         decode_responses=True,db=0,username=settings.redis_username,password=settings.redis_password)
services=Services()
        