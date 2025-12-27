from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from dotenv import load_dotenv
from pathlib import Path
import pandas as pd
import os

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

def index_new_documents(csv_path):
    df = pd.read_csv(csv_path)
    docs = [Document(page_content=row["content"], metadata=row.drop("content").to_dict()) 
            for _, row in df.iterrows()]
    
    splits = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200).split_documents(docs)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
    
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = "news-police"
    
    # Delete existing index if it exists with wrong dimension
    if index_name in pc.list_indexes().names():
        print(f"Deleting existing index '{index_name}'...")
        pc.delete_index(index_name)
    
    # Create new index with correct dimension
    print(f"Creating index '{index_name}' with dimension 768...")
    pc.create_index(name=index_name, dimension=768, metric="cosine",
                   spec=ServerlessSpec(cloud="aws", region="us-east-1"))
    
    return PineconeVectorStore.from_documents(splits, embeddings, index_name=index_name)

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    data_path = script_dir.parent / "daily_data" / "daily_data.csv"
    
    print(f"API Key: {'Found' if os.getenv('PINECONE_API_KEY') else 'Missing'}")
    
    if data_path.exists():
        print(f"Indexing {len(pd.read_csv(data_path))} articles...")
        index_new_documents(str(data_path))
        print("✓ Done!")
    else:
        print(f"✗ CSV not found: {data_path}")