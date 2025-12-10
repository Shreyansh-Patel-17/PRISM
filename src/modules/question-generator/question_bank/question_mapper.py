# from generator import load_static_questions
# from gemini_api import generate_questions

# def get_questions_for_skills(skills):
#     static_bank = load_static_questions()
#     all_questions = []

#     for skill in skills:
#         static = static_bank.get(skill, [])
#         dynamic = generate_questions(skill)
#         combined = [{"skill": skill, "text": q} for q in static + dynamic]
#         all_questions.extend(combined)

#     return all_questions


# from generator import load_static_questions
# from gemini_api import generate_questions_and_keywords

# def get_questions_for_skills(skills):
#     static_bank = load_static_questions()
#     all_questions = []

#     for skill in skills:
#         static = static_bank.get(skill, [])
#         static_formatted = [{"question": q, "keywords": []} for q in static]

#         dynamic = generate_questions_and_keywords(skill)

#         combined = static_formatted + dynamic

#         for item in combined:
#             all_questions.append({
#                 "skill": skill,
#                 "text": item["question"],
#                 "keywords": item["keywords"]
#             })

#     return all_questions


from gemini_api import generate_questions_for_skills

def get_questions_for_skills(skills):
    """
    Batch wrapper: returns a flat list of:
    [{"skill": skill, "text": question_text, "keywords": [...]}, ...]
    """
    return generate_questions_for_skills(skills)