from fastapi import FastAPI, UploadFile, File, HTTPException
import tempfile

from resume_parser.parser import extract_text, extract_skills
from question_generator.service import generate_questions
from response_evaluator.evaluator import evaluate

app = FastAPI(title="PRISM AI Backend")


# -------------------------
# Health check
# -------------------------
@app.get("/health")
def health():
    return {"status": "running"}


# -------------------------
# Resume parsing
# -------------------------
@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read file safely
    pdf_bytes = await file.read()

    if len(pdf_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")

    with tempfile.NamedTemporaryFile(delete=True, suffix=".pdf") as tmp:
        tmp.write(pdf_bytes)
        tmp.flush()

        text = extract_text(tmp.name)
        skills = extract_skills(text)

    return {"skills": skills}


# -------------------------
# Question generation
# -------------------------
@app.post("/generate-questions")
def generate_questions_api(payload: dict):
    skills = payload.get("skills")

    if not isinstance(skills, list) or not skills:
        raise HTTPException(status_code=400, detail="skills must be a non-empty list")

    return generate_questions(skills)


# -------------------------
# Response evaluation
# -------------------------
@app.post("/evaluate-response")
def evaluate_response_api(payload: dict):
    return evaluate(payload)
