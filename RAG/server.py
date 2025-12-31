from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import get_response, retrieve, decision, generate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(get_response.router, prefix="/ai", tags=["ai"])
app.include_router(retrieve.router, prefix="/ai", tags=["ai"])
app.include_router(decision.router, prefix="/ai", tags=["ai"])
app.include_router(generate.router, prefix="/ai", tags=["ai"])

@app.get("/")
def health_check():
    return {
        "message": "AI API is running!",
        "status": "healthy",
        "routes": ["/ai/ask", "/ai/retrieve", "/ai/analyze", "/ai/generate"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)