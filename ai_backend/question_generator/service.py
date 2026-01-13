from question_generator.gemini_api import generate_questions_for_skills

def generate_questions(skills: list[str]):
    if not skills:
        return []

    return generate_questions_for_skills(skills)
