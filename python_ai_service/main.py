from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

from nlp_service import get_medical_context, load_model, BIOBERT_MODEL_NAME

app = FastAPI(
    title="MediGuide AI - BioBERT Service",
    description="Biomedical NLP helper for the Node backend. It only ranks report text; it does not write answers.",
    version="1.1.0",
)


class QuestionRequest(BaseModel):
    question: str
    report_context: str  # full extracted text of the report


@app.on_event("startup")
def warm_up():
    # Load BioBERT when the service starts so the first question is not slow.
    load_model()


@app.get("/")
def health_check():
    # The model is loaded at startup (see warm_up above).
    return {"status": "online", "model": BIOBERT_MODEL_NAME}


@app.post("/api/ask_question")
def ask_question(request: QuestionRequest):
    """Find the report lines most relevant to the question (BioBERT similarity)."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question is empty")
    try:
        result = get_medical_context(request.question, request.report_context)
    except Exception as error:  # surface model/torch problems clearly to Node's logs
        print(f"[NLP] Failed: {error}")
        raise HTTPException(status_code=500, detail=f"BioBERT processing failed: {error}")

    return {
        "success": True,
        "relevant_context": result["context"],
        "matched_terms": result["matched_terms"],
        "method": result["method"],
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000)
