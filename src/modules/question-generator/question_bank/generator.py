# import json

# def load_static_questions(filepath="static_questions.json"):
#     with open(filepath, "r") as f:
#         return json.load(f)


import json

def load_static_questions(filepath="static_questions.json"):
    """
    Load static questions from a JSON file.
    JSON structure example:
    {
        "DBMS": ["What is a primary key?", "Explain ACID properties."],
        "SQL": ["Write a SQL query to fetch all employees."],
        ...
    }
    """
    with open(filepath, "r") as f:
        return json.load(f)
