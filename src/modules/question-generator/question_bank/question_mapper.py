
from gemini_api import generate_questions_for_skills

def get_questions_for_skills(skills):
    """
    Batch wrapper: returns a flat list of:
    [{"skill": skill, "text": question_text, "keywords": [...]}, ...]
    """
    return generate_questions_for_skills(skills)