# backend/app/api/review.py

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends # <-- Add Depends
from ..core import rag_pipeline
from ..core.security import verify_token # <-- Import our new security function
from typing import Dict, Any

router = APIRouter()

@router.post(
    "/review",
    response_model=Dict[str, Any],
    # --- ADD THIS LINE TO PROTECT THE ENDPOINT ---
    dependencies=[Depends(verify_token)]
)
async def review_cv(
    cv_file: UploadFile = File(..., description="The candidate's CV in PDF format."),
    job_description: str = Form(..., description="The job description to compare against.")
):
    """
    Receives a CV and a job description, processes them using the RAG pipeline,
    and returns a structured JSON analysis.
    """
    if cv_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    try:
        cv_content = await cv_file.read()
        result = rag_pipeline.process_cv_and_review(cv_content, job_description)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate a review.")
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")