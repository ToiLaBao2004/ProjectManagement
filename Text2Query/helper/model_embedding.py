from sentence_transformers import SentenceTransformer
import torch
from pymongo import MongoClient 
from langchain_mongodb import MongoDBAtlasVectorSearch
from configs.settings import settings
from configs.paths import MODEL_DIR

class GemmEmbedding():
    def __init__(self):
        self.device="cuda" if torch.cuda.is_available() else "cpu"
        self.model=SentenceTransformer(str(MODEL_DIR/settings.model_registry["embedder"]),
                                       device=self.device)
        
    def embedding(self,data):
        embedding=self.model.encode(data, convert_to_numpy=True,device=self.device)
        return embedding
    
    def embed_query(self,text):
        embedding=self.model.encode([text],convert_to_numpy=True,device=self.device)
        return embedding[0].tolist()
    
    def embed_documets(self,texts):
        embeddings=self.model.encode(texts,convert_to_numpy=True,device=self.device)
        return embeddings.tolist()

class VectorSearch:
    def __init__(self):
        self.client=MongoClient(settings.atlas_connection_string)
        self.db=self.client[settings.atlas_db_rag]
        self.collection=self.db[settings.atlas_collection_rag]
        self.embedder=GemmEmbedding()
        self.index_name=settings.index_name    
    
        self.vector_store=MongoDBAtlasVectorSearch(
            collection=self.collection,
            embedding=self.embedder,
            index_name=self.index_name
        )
     
    def search_with_score(self, prompt, top_k=5):
        return self.vector_store.similarity_search_with_score(prompt, k=top_k)
        