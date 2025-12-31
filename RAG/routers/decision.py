"""
Decision Router - API endpoints for combined retrieval and classification
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from decision import get_decision_engine

router = APIRouter()


class DecisionRequest(BaseModel):
    query: str
    k: Optional[int] = 4
    threshold: Optional[float] = 0.35
    return_all_scores: Optional[bool] = True


@router.post("/analyze")
async def analyze_query(request: DecisionRequest):
    """
    Analyze a query by retrieving relevant documents and classifying the text.
    
    Args:
        query: The text to analyze
        k: Number of documents to retrieve (default: 4)
        threshold: Similarity threshold for document filtering (default: 0.35)
        return_all_scores: Return probabilities for all classes (default: True)
    
    Returns:
        Dictionary containing classification results and retrieved documents
    """
    engine = get_decision_engine()
    
    result = engine.analyze(
        query=request.query,
        k=request.k,
        threshold=request.threshold,
        return_all_scores=request.return_all_scores
    )
    
    return result


@router.get("/analyze")
async def analyze_query_get(
    query: str, 
    k: int = 4, 
    threshold: float = 0.35,
    return_all_scores: bool = True
):
    """
    Analyze a query by retrieving relevant documents and classifying the text (GET method).
    
    Query Parameters:
        query: The text to analyze
        k: Number of documents to retrieve (default: 4)
        threshold: Similarity threshold for document filtering (default: 0.35)
        return_all_scores: Return probabilities for all classes (default: True)
    
    Returns:
        Dictionary containing classification results and retrieved documents
    """
    engine = get_decision_engine()
    
    result = engine.analyze(
        query=query,
        k=k,
        threshold=threshold,
        return_all_scores=return_all_scores
    )
    
    return result
