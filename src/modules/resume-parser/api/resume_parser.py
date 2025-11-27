

# 📄 Import libraries
from PyPDF2 import PdfReader
from google.colab import files
import re
import spacy

# 📤 Upload resume PDF
uploaded = files.upload()
resume_file = list(uploaded.keys())[0]

# 📄 Extract text from PDF
def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

resume_text = extract_text_from_pdf(resume_file)
print("✅ Resume Text Extracted\n")
print(resume_text[:500])  # Preview
# 🧠 Load NLP model
nlp = spacy.load("en_core_web_sm")

# 🎓 Extract Education Section
def extract_education(text):
    edu_keywords = ["Education", "Bachelor", "School", "University", "CGPA", "Percentage"]
    lines = text.split('\n')
    edu_section = [line for line in lines if any(kw in line for kw in edu_keywords)]
    return edu_section

education_info = extract_education(resume_text)
print("\n🎓 Education Info:")
for line in education_info:
    print("-", line)

# 💼 Extract Experience Section
def extract_experience(text):
    exp_keywords = ["Experience", "Intern", "Work", "Company", "Position", "Role", "Team", "Research", "Development"]
    lines = text.split('\n')
    exp_section = [line for line in lines if any(kw in line for kw in exp_keywords)]
    return exp_section

experience_info = extract_experience(resume_text)
print("\n💼 Experience Info:")
for line in experience_info:
    print("-", line)

# 🧪 Extract Projects Section
def extract_projects(text):
    proj_keywords = ["Project", "Developed", "Built", "Created", "Implemented", "Designed", "Engineered"]
    lines = text.split('\n')
    proj_section = [line for line in lines if any(kw in line for kw in proj_keywords)]
    return proj_section

project_info = extract_projects(resume_text)
print("\n🧪 Project Info:")
for line in project_info:
    print("-", line)

# 🧠 Score Projects Based on Complexity
def score_project(projects):
    score = 0
    for proj in projects:
        if any(kw in proj.lower() for kw in ["deep learning", "machine learning", "AI", "NLP", "analytics", "streamlit", "deployment", "automation"]):
            score += 10
        elif any(kw in proj.lower() for kw in ["website", "calculator", "basic", "static", "simple", "mini"]):
            score += 3
        else:
            score += 5
    return score

# 🧠 Score Experience Based on Depth
def score_experience(experiences):
    score = 0
    for exp in experiences:
        if any(kw in exp.lower() for kw in ["research", "intern", "industry", "development", "team", "collaboration", "lead"]):
            score += 8
        elif any(kw in exp.lower() for kw in ["minor", "short", "basic", "training", "intro"]):
            score += 3
        else:
            score += 5
    return score
