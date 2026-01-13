from model.evaluator import evaluate_response

def evaluate(payload: dict):
    """
    Expected payload:
    {
      "response": "user answer",
      "question": {
        "text": "...",
        "expected_keywords": [
          {"keyword": "python", "weight": 1.0}
        ]
      }
    }
    """
    response = payload.get("response")
    question = payload.get("question")
    
    if not isinstance(question, dict) or "text" not in question:
        return {"error": "Invalid question format"}

    if not response or not question:
        return {"error": "Missing response or question"}

    try:
        return evaluate_response(response, question)
    except Exception as e:
        return {"error": "Evaluation failed", "details": str(e)}