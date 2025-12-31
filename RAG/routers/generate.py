"""
Generate Router - API endpoints for RAG generation
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from generate import get_rag_generator

router = APIRouter()


class GenerateRequest(BaseModel):
    query: str
    k: Optional[int] = 4
    threshold: Optional[float] = 0.35


@router.post("/generate")
async def generate_answer(request: GenerateRequest):
    """
    Generate an answer using RAG (Retrieval-Augmented Generation).
    
    Combines:
    - Fake news classification
    - Document retrieval
    - LLM generation with context
    
    Args:
        query: The question to answer
        k: Number of documents to retrieve (default: 4)
        threshold: Similarity threshold for document filtering (default: 0.35)
    
    Returns:
        Dictionary containing the generated answer, classification, and retrieved documents
    """
    generator = get_rag_generator()
    
    result = generator.generate(
        query=request.query,
        k=request.k,
        threshold=request.threshold
    )
    
    return result


@router.get("/generate")
async def generate_answer_get(
    query: str,
    k: int = 4,
    threshold: float = 0.35
):
    """
    Generate an answer using RAG (GET method).
    
    Query Parameters:
        query: The question to answer
        k: Number of documents to retrieve (default: 4)
        threshold: Similarity threshold for document filtering (default: 0.35)
    
    Returns:
        Dictionary containing the generated answer, classification, and retrieved documents
    """
    generator = get_rag_generator()
    
    result = generator.generate(
        query=query,
        k=k,
        threshold=threshold
    )
    
    return result
