from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Question(BaseModel):
    question: str

@router.post("/ask")
async def ask_question(q: Question):
    print(f"Question received: {q.question}")
    return {
        "response": f"ai response to: {q.question}",
        "timestamp": "2025-12-06T00:00:00.000Z"
    }