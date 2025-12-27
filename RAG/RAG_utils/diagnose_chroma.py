from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

def diagnose_chroma_db(persist_dir="./chroma_db"):

    try:
        os.environ['TRANSFORMERS_CACHE'] = './RAG/models_cache'
        os.environ['HF_HOME'] = './RAG/models_cache'
        
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

        print("1")

        vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings
        )
        print("2")
        
        collection = vectorstore._collection
        
        total_docs = collection.count()
        
        print(f"ChromaDB Diagnostic Report")
        print(f"=" * 50)
        print(f"Database Location: {persist_dir}")
        print(f"Total Documents: {total_docs}")
        print(f"=" * 50)
        
        if total_docs > 0:
            print(f"\nSample Documents (first 3):")
            results = collection.get(limit=3)
            
            for i, (doc_id, document, metadata) in enumerate(zip(
                results['ids'],
                results['documents'],
                results['metadatas']
            ), 1):
                print(f"\n--- Document {i} ---")
                print(f"ID: {doc_id}")
                print(f"Content Preview: {document[:200]}...")
                print(f"Metadata: {metadata}")
        else:
            print("\nNo documents found in the database.")
            
    except Exception as e:
        print(f"Error diagnosing ChromaDB: {str(e)}")

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    persist_dir = script_dir.parent / "chroma_db"
    diagnose_chroma_db(persist_dir=str(persist_dir))