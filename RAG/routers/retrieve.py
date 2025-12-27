from fastapi import APIRouter
from RAG_utils.online_retrieve import retrieve_documents

router = APIRouter()

@router.get("/retrieve")
async def retrieve(query: str, k: int = 4, threshold: float = 0.35):
    """Retrieve similar documents with optional similarity threshold filtering."""
    docs = retrieve_documents(query, k=k, threshold=threshold)
    response = {
        "query": query,
        "results": [
            {
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            for doc in docs
        ]
    }

    if not docs:
        response["message"] = "No relevant documents found for the given query."

    return response
