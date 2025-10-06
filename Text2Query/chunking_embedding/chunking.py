from langchain_community.document_transformers.openai_functions import create_metadata_tagger
from langchain_openai import ChatOpenAI
from pymongo import MongoClient
from langchain.schema import Document
import datetime
import json
import torch

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from helper.model_embedding import GemmEmbedding
from configs.settings import settings
from configs.paths import DATA_DIR

class Chunking:
    def __init__(self):
        self.client=MongoClient(settings.atlas_connection_string)
        self.db=self.client[settings.atlas_db_rag]
        self.embedding_collection= self.db[settings.atlas_collection_rag]

        self.schema = {
            "type": "object",
            "properties": {
                "_id": {"type": "string", "title": "MongoDB ObjectId"},
                "collection_name": {"type": "string"},
                "chunk_type": {
                    "type": "string",
                    "enum": ["schema", "sub-schema", "description", "field", "syntax_guideline"]
                },
                "text": {"type": "string"},
                "source": {"type": "string"},
                "metadata": {
                    "type": "object",
                    "properties": {
                        "languages": {"type": "string", "enum": ["vi", "en"]},
                        "created_at": {"type": "string", "format": "date-time"}
                    }
                }
            },
            "required": ["collection_name", "chunk_type", "text", "metadata", "source"]
        }


        self.llm = ChatOpenAI(api_key=settings.open_ai_api_key, temperature=0, model=settings.model_registry["openai"])

        self.document_transformer = create_metadata_tagger(metadata_schema=self.schema, llm=self.llm)
        self.embedder=GemmEmbedding()
        
    
    def chunking(self):
        for file_path in DATA_DIR.iterdir():
            file_name=file_path.name
            if self.embedding_collection.find_one({"source": file_name}):
                print(f"File {file_name} has been exists in collection, skip.")
                continue

            with open(file_path, "r", encoding="utf-8") as f:
                objects=json.load(f)

            docs = []
            for obj in objects:
                docs.append(
                    Document(
                        page_content=json.dumps(obj, ensure_ascii=False, indent=2),
                        metadata={"source": file_name}
                    )
                )
                
            tagged_docs = self.document_transformer.transform_documents(docs)

            for chunk in tagged_docs:
                raw_doc = {
                    "collection_name": chunk.metadata.get("collection_name", "default_collection"),
                    "chunk_type": chunk.metadata.get("chunk_type", "schema"),
                    "text": chunk.page_content,
                    "source": file_name,
                    "metadata": {
                        "languages": chunk.metadata.get("languages", ["en"]),
                        "created_at": chunk.metadata.get("created_at", datetime.datetime.now())
                    }
                }

                content_embedding = f"""
                Collection: {raw_doc['collection_name']}
                Type: {raw_doc['chunk_type']}
                Language: {raw_doc['metadata']['languages']}
                Text: {raw_doc['text']}
                """
                
                embedding_vector = self.embedder.embedding(content_embedding).tolist()

                raw_doc["embedding"] = embedding_vector

                chunk_id = self.embedding_collection.insert_one(raw_doc).inserted_id
                print(f"Inserted chunk {chunk_id} from {file_name}, embedding_dim={len(embedding_vector)}")
                
                torch.cuda.empty_cache()

def main():
    chunker=Chunking()
    chunker.chunking()
        
if __name__  == "__main__":
    main()