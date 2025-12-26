from fastapi import APIRouter
from RAG_utils.online_retrieve import retrieve_documents

router = APIRouter()

@router.get("/retrieve")
async def retrieve(query: str, k: int = 4):
    docs = retrieve_documents(query, k=k)
    return {
        "query": query,
        "results": [
            {
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            for doc in docs
        ]
    }
