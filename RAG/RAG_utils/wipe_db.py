from pinecone import Pinecone
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

def wipe_database():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = "news-police"
    
    if index_name in pc.list_indexes().names():
        index = pc.Index(index_name)
        index.delete(delete_all=True)
        print(f"✓ All records deleted from '{index_name}'")
    else:
        print(f"✗ Index '{index_name}' not found")

if __name__ == "__main__":
    wipe_database()
