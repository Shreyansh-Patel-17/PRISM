import sys
from PyPDF2 import PdfReader
import spacy
import re
import json

# 📄 Extract text from PDF
def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        print(json.dumps({"error": f"Failed to extract text from PDF: {str(e)}"}))
        sys.exit(1)

# Get file path from command line argument
if len(sys.argv) < 2:
    print(json.dumps({"error": "No file path provided"}))
    sys.exit(1)

resume_file = sys.argv[1]
resume_text = extract_text_from_pdf(resume_file)

# 🧠 Load NLP model
nlp = spacy.load("en_core_web_sm")

# 📚 Skill dictionaries
technical_skills = [
    "Python", "Java", "C++", "C", "R", "SQL", "MySQL", "TensorFlow", "PyTorch",
    "Machine Learning", "Deep Learning", "Artificial Intelligence", "NLP",
    "Data Science", "Data Analysis", "Data Visualization", "Cloud Computing",
    "AWS", "Azure", "Git", "Node.js", "React", "HTML", "CSS", "JavaScript",
    "DBMS", "OOP", "Data Structures", "Algorithms", "Computer Networks"
]

soft_skills = [
    "Communication", "Leadership", "Teamwork", "Time Management",
    "Public Speaking", "Problem Solving", "Adaptability", "Collaboration"
]

other_skills = [
    "Cybersecurity", "Project Management", "MIS", "Institutional Automation",
    "Event Coordination", "Technical Writing", "Teaching", "Presentation",
    "Organizational Skills", "Research", "Documentation"
]

# 🛠 Skill extractor
def extract_categorized_skills(text):
    doc = nlp(text)
    found = {
        "Technical Skills": set(),
        "Soft Skills": set(),
        "Other Skills": set()
    }

    for token in doc:
        word = token.text.lower()
        for skill in technical_skills:
            if skill.lower() == word or skill.lower() in word:
                found["Technical Skills"].add(skill)
        for skill in soft_skills:
            if skill.lower() == word or skill.lower() in word:
                found["Soft Skills"].add(skill)
        for skill in other_skills:
            if skill.lower() == word or skill.lower() in word:
                found["Other Skills"].add(skill)

    return {k: sorted(list(v)) for k, v in found.items()}

# 📊 Extracted Skills
categorized_skills = extract_categorized_skills(resume_text)

print(json.dumps(categorized_skills))
