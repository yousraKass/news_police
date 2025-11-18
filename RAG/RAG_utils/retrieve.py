from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from dotenv import load_dotenv

load_dotenv()

def load_vectorstore(persist_dir="./RAG/chroma_db"):
    """Load existing vectorstore from disk."""
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )
    vectorstore = Chroma(
        persist_directory=persist_dir,
        embedding_function=embeddings
    )
    return vectorstore

def retrieve_documents(query: str, k: int = 4, persist_dir="./RAG/chroma_db"):
    vectorstore = load_vectorstore(persist_dir)
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    docs = retriever.invoke(query)
    return docs

# if __name__ == "__main__":
#     results = retrieve_documents("اشكون سرق متحف اللوفر", k=1)
    
#     print(f"Found {len(results)} document(s):")
#     for i, doc in enumerate(results, 1):
#         print(f"\n--- Document {i} ---")
#         print(f"Content: {doc.page_content[:200]}...")
#         print(f"Metadata: {doc.metadata}")