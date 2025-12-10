import sys
import json
from model.evaluator import evaluate_response

if __name__ == "__main__":
    try:
        # Read full JSON string from stdin
        raw_input = sys.stdin.read().strip()

        if not raw_input:
            print(json.dumps({"error": "No input received"}))
            sys.exit(1)

        # Parse JSON input
        try:
            data = json.loads(raw_input)
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
            sys.exit(1)

        response = data.get("response")
        question = data.get("question")

        if not response or not question:
            print(json.dumps({"error": "Missing 'response' or 'question' field"}))
            sys.exit(1)

        # Evaluate
        result = evaluate_response(response, question)

        # Output PURE JSON
        print(json.dumps(result))

    except Exception as e:
        # Fatal fallback
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
