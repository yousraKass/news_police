from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

def retrieve_documents(query: str, k: int = 4, threshold: float = 0.35):
    """
    Retrieve top-k documents and filter by cosine similarity threshold.

    Returns only documents whose similarity score >= threshold.
    """
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
    vectorstore = PineconeVectorStore(index_name="news-police", embedding=embeddings)

    # Use similarity_search_with_score to get (Document, score) pairs
    results = vectorstore.similarity_search_with_score(query, k=k)

    # For cosine similarity, scores are typically in [-1, 1]; higher is more similar
    filtered_docs = [doc for doc, score in results if score is not None and score >= threshold]
    return filtered_docs

# if __name__ == "__main__":
#     queries = ["اشكون سرق متحف اللوفر", "أخبار الرياضة"]
    
#     for query in queries:
#         print(f"\nQuery: '{query}'")
#         for i, doc in enumerate(retrieve_documents(query, k=2), 1):
#             print(f"{i}. {doc.page_content[:100]}...")