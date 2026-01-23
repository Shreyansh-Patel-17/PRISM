from PyPDF2 import PdfReader
import spacy
import re

# -------------------------
# Load NLP model safely
# -------------------------
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    raise RuntimeError(
        "spaCy model 'en_core_web_sm' not found. "
        "Ensure it is installed in requirements.txt"
    )

TECHNICAL_SKILLS = [
    "Python", "Java", "C++", "C", "R", "SQL", "MySQL",
    "TensorFlow", "PyTorch", "Machine Learning",
    "Deep Learning", "Artificial Intelligence", "NLP",
    "Data Science", "Cloud Computing", "AWS", "Azure",
    "Git", "Node.js", "React", "HTML", "CSS", "JavaScript",
    "DBMS", "OOP", "Data Structures", "Algorithms",
    "Computer Networks"
]

# Precompile regex patterns (FAST)
SKILL_PATTERNS = {
    skill: re.compile(rf"\b{re.escape(skill.lower())}\b")
    for skill in TECHNICAL_SKILLS
}


# -------------------------
# PDF text extraction
# -------------------------
def extract_text(file_path: str) -> str:
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception:
        # Never crash backend
        return ""


# -------------------------
# Skill extraction
# -------------------------
def extract_skills(text: str):
    if not text:
        return []

    text_lower = text.lower()
    found = []

    for skill, pattern in SKILL_PATTERNS.items():
        if pattern.search(text_lower):
            found.append(skill)

    return sorted(found)
