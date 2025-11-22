from index import index_new_documents, get_vectorstore_size
import os
from datetime import datetime

def process_daily_news():
    # Path relative to the RAG folder
    script_dir = os.path.dirname(os.path.abspath(__file__))  # RAG_utils folder
    project_root = os.path.abspath(os.path.join(script_dir, ".."))  # go up to RAG
    data_path = os.path.join(project_root, "daily_data", "daily_data.csv")
    
    if not os.path.exists(data_path):
        print(f"[{datetime.now()}] ERROR: No daily data file found at {data_path}")
        return
    
    try:
        print(f"[{datetime.now()}] Processing daily news data")
        index_new_documents(str(data_path), append=True)
        
        total_docs = get_vectorstore_size("./RAG/chroma_db")
        print(f"[{datetime.now()}] Total documents in vectorstore: {total_docs}")
        
        os.remove(data_path)
        print(f"[{datetime.now()}] Successfully deleted {data_path}")
        
    except Exception as e:
        print(f"[{datetime.now()}] ERROR: Failed to process daily news - {str(e)}")
