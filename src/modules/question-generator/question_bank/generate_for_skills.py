import sys
import json
from question_mapper import get_questions_for_skills

if __name__ == "__main__":
    # Read skills from stdin as JSON
    input_data = sys.stdin.read()
    skills = json.loads(input_data)

    # Generate questions
    questions = get_questions_for_skills(skills)

    # Output as JSON
    print(json.dumps(questions))
