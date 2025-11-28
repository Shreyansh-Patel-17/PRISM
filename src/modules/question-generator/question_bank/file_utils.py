def save_questions_to_file(questions, filepath="generated_questions.txt"):
    with open(filepath, "a", encoding="utf-8") as f:
        for q in questions:
            f.write(f"[{q['skill']}] {q['text']}\n")
            f.write(f"   ➝ Expected Keywords: {', '.join(q['keywords'])}\n\n")
    print(f"✅ Questions saved to {filepath}")
