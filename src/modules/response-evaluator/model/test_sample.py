# from evaluator import evaluate_response

# questions = [
#     {
#         "text": "Tell me about your experience with Python",
#         "expected_keywords": ["python", "programming", "data", "automation", "scripting"]
#     },
#     {
#         "text": "What is OOP?",
#         "expected_keywords": ["object", "class", "inheritance", "encapsulation", "polymorphism"]
#     }
# ]

# responses = [
#     "I use Python for data analysis and automation. It's my favorite programming language.",
#     "OOP is about using classes and objects. It includes inheritance and encapsulation."
# ]

# for q, r in zip(questions, responses):
#     result = evaluate_response(r, q)
#     print("\n--- Evaluation ---")
#     print(f"Question       : {result['question']}")
#     print(f"Response       : {result['response']}")
#     print(f"Final Score    : {result['scores']['final']}%")
#     print(f"Sentiment      : {result['feedback']['sentiment']}")
#     print(f"Matched        : {result['feedback']['matched_keywords']}")
#     print(f"Missing        : {result['feedback']['missing_keywords']}")
#     print(f"Suggestion     : {result['feedback']['suggestion']}")











# test_batch.py

from evaluator import evaluate_response

questions = [
    {
        "text": "Tell me about your experience with Python",
        "expected_keywords": ["python", "programming", "data", "automation", "scripting"]
    },
    {
        "text": "What is OOP?",
        "expected_keywords": ["object", "class", "inheritance", "encapsulation", "polymorphism"]
    }
]

responses = [
    "I use Python for data analysis and automation. It's my favorite programming language.",
    "OOP is about using classes and objects. It includes inheritance and encapsulation."
]

for q, r in zip(questions, responses):
    result = evaluate_response(r, q, debug=True)
    print("\n--- Evaluation ---")
    print(f"Question       : {result['question']}")
    print(f"Response       : {result['response']}")
    print(f"Final Score    : {result['scores']['final']}%")
    print(f"Sentiment      : {result['feedback']['sentiment']}")
    print(f"Matched        : {result['feedback']['matched_keywords']}")
    print(f"Missing        : {result['feedback']['missing_keywords']}")
    print(f"Suggestion     : {result['feedback']['suggestion']}")
    print(f"Semantic Scores: {result['debug']['semantic_scores']}")