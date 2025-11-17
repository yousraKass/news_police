from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import pandas as pd
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import os
from pathlib import Path
import shutil

def index_new_documents(csv_path, persist_dir="./RAG/chroma_db", append=True):
    df = pd.read_csv(csv_path)
    docs = []
    content_col = "content"
    
    for _, row in df.iterrows():
        metadata = row.drop(content_col).to_dict()
        page_content = row[content_col]
        docs.append(Document(page_content=page_content, metadata=metadata))
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )
    
    if append and os.path.exists(persist_dir):
        vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings
        )
        print(f"Adding {len(splits)} new document chunks to existing collection")
        vectorstore.add_documents(splits)
    else:
        if os.path.exists(persist_dir):
            print(f"Deleting existing vectorstore")
            shutil.rmtree(persist_dir)
        print("Creating new vectorstore...")
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            persist_directory=persist_dir
        )
    
    return vectorstore

def get_vectorstore_size(persist_dir="./chroma_db"):
    """Get the total number of documents in the vectorstore."""
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )
    vectorstore = Chroma(
        persist_directory=persist_dir,
        embedding_function=embeddings
    )
    collection = vectorstore._collection
    return collection.count()

#if __name__ == "__main__":

#    script_dir = Path(__file__).parent
#    data_path = script_dir.parent / "data" / "7days_transcripts_2025-11-01.csv"
#    index_new_documents(str(data_path), append=True)


#    total_docs = get_vectorstore_size("./RAG/chroma_db")
#    print(f"Total documents in vectorstore: {total_docs}")