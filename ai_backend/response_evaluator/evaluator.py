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

    if not isinstance(payload, dict):
        return _fallback_result("Invalid payload")

    response = payload.get("response")
    question = payload.get("question")

    # Validate question object
    if not isinstance(question, dict) or "text" not in question:
        return _fallback_result("Invalid question format")

    # Allow empty response, but not missing
    if response is None:
        return _fallback_result("Missing response")

    try:
        return evaluate_response(response, question)
    except Exception:
        # Never expose internal errors to frontend
        return _fallback_result("Evaluation failed")


def _fallback_result(message: str):
    """
    Guaranteed-safe response structure.
    Frontend will NEVER crash because of this.
    """
    return {
        "question": "Invalid Question",
        "response": "",
        "scores": {
            "keyword": 0.0,
            "sentiment": 50.0,
            "final": 25.0,
            "weights": {
                "keyword_weight": 0.8,
                "sentiment_weight": 0.2,
            },
        },
        "feedback": {
            "matched_keywords": [],
            "missing_keywords": [],
            "sentiment": "neutral",
            "suggestion": message,
            "keyword_detail": {},
        },
    }
