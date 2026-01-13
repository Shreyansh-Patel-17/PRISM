from PyPDF2 import PdfReader
import spacy

# Load NLP model ONCE
nlp = spacy.load("en_core_web_sm")

TECHNICAL_SKILLS = [
    "Python", "Java", "C++", "C", "R", "SQL", "MySQL",
    "TensorFlow", "PyTorch", "Machine Learning",
    "Deep Learning", "Artificial Intelligence", "NLP",
    "Data Science", "Cloud Computing", "AWS", "Azure",
    "Git", "Node.js", "React", "HTML", "CSS", "JavaScript",
    "DBMS", "OOP", "Data Structures", "Algorithms",
    "Computer Networks"
]

# ---------- FUNCTIONS EXPECTED BY app.py ----------

def extract_text(file_path: str):
    """
    Extract raw text from a PDF file path
    """
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text() + "\n"
    return text


def extract_skills(text: str):
    """
    Extract technical skills from resume text
    """
    doc = nlp(text)
    found = set()

    for token in doc:
        word = token.text.lower()
        for skill in TECHNICAL_SKILLS:
            if skill.lower() in word:
                found.add(skill)

    return sorted(list(found))
