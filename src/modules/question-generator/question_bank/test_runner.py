# from question_mapper import get_questions_for_skills

# # Simulated parsed skills from resume
# skills = ["Python", "SQL", "Communication"]

# questions = get_questions_for_skills(skills)

# print("\nGenerated Questions:\n")
# for i, q in enumerate(questions, 1):
#     print(f"{i}. [{q['skill']}] {q['text']}")



# from question_mapper import get_questions_for_skills

# skills = ["DBMS", "SQL", "Communication","Machine Learning"]

# questions = get_questions_for_skills(skills)

# print("\nGenerated Questions:\n")
# for i, q in enumerate(questions, 1):
#     print(f"{i}. [{q['skill']}] {q['text']}")

from question_mapper import get_questions_for_skills

skills = ["Cybersecurity"]

questions = get_questions_for_skills(skills)

for i, q in enumerate(questions, 1):
    print(f"{i}. [{q['skill']}] {q['text']}")
    print(f"   ➝ Expected Keywords: {', '.join(q['keywords'])}\n")
