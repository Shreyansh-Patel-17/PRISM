from question_generator.gemini_api import generate_questions_for_skills

def generate_questions(skills: list[str]):
    """
    Generate interview questions for a list of skills.

    This function is:
    - Safe for Railway free tier
    - Defensive against bad input
    - Gemini-token efficient
    """

    if not skills or not isinstance(skills, list):
        return []

    # Sanitize input (important for Gemini + cost control)
    clean_skills = [
        str(skill).strip()
        for skill in skills
        if isinstance(skill, str) and skill.strip()
    ]

    # Hard safety limit (VERY important for free tier)
    clean_skills = clean_skills[:10]

    if not clean_skills:
        return []

    return generate_questions_for_skills(clean_skills)
