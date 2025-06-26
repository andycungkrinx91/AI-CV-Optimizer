from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import review

# Create FastAPI app instance
app = FastAPI(
    title="CV Reviewer AI API",
    description="An API for reviewing CVs against job descriptions using RAG and Google Gemini.",
    version="1.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "[http://127.0.0.1:3000](http://127.0.0.1:3000)"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(review.router, prefix="/api", tags=["CV Review"])

@app.get("/", tags=["Root"])
async def read_root():
    """A simple root endpoint to check if the API is running."""
    return {"message": "Welcome to the CV Reviewer AI API!"}