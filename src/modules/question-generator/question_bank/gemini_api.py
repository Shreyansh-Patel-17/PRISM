# import google.generativeai as genai

# # Replace with your actual Gemini API key
# genai.configure(api_key="AIzaSyDrf94oYvNvkADcgCj-QLOKIGTNJu14frg")

# model = genai.GenerativeModel("gemini-pro")

# def generate_questions(skill, num_questions=3):
#     prompt = f"Generate {num_questions} interview questions for the skill: {skill}. Include a mix of theory and practical."

#     try:
#         response = model.generate_content(prompt)
#         return [q.strip("- ").strip() for q in response.text.split('\n') if q.strip()]
#     except Exception as e:
#         print(f"Error generating questions for {skill}: {e}")
#         return []



# import google.generativeai as genai

# # Configure Gemini
# genai.configure(api_key="AIzaSyDrf94oYvNvkADcgCj-QLOKIGTNJu14frg")  # <-- replace with your API key

# # Try models in order (Pro > Flash > older)
# MODEL_PRIORITY = [
    
#     "models/gemini-2.5-flash"
# ]

# def get_available_model():
#     """
#     Return the first available Gemini model from the priority list.
#     """
#     available = [m.name for m in genai.list_models()]
#     for candidate in MODEL_PRIORITY:
#         if candidate in available:
#             return candidate
#     raise RuntimeError("No valid Gemini model available for this API key.")

# def generate_questions(skill):
#     """
#     Generate interview questions dynamically for a given skill using Gemini API.
#     """
#     try:
#         model_name = get_available_model()
#         model = genai.GenerativeModel(model_name)

#         prompt = f"""
#         Generate 3 clear interview questions to test a candidate's knowledge of {skill}.
#         Return only the questions as plain text, one per line.
#         """

#         response = model.generate_content(prompt)

#         if response and hasattr(response, "text"):
#             questions = [q.strip("-• ") for q in response.text.split("\n") if q.strip()]
#             return questions

#         return [f"Could not generate questions for {skill}."]

#     except Exception as e:
#         print(f"Error generating questions for {skill}: {e}")
#         return [f"Error: Unable to generate question for {skill}."]




import google.generativeai as genai
import re

# Configure Gemini API
genai.configure(api_key="AIzaSyDrf94oYvNvkADcgCj-QLOKIGTNJu14frg")  # <-- replace with your API key

MODEL_PRIORITY = ["models/gemini-2.5-flash"]

def get_available_model():
    available = [m.name for m in genai.list_models()]
    for candidate in MODEL_PRIORITY:
        if candidate in available:
            return candidate
    raise RuntimeError("No valid Gemini model available for this API key.")

def parse_response(text):
    """
    Parse Gemini response to extract question and keywords reliably.
    Returns a list of dictionaries: [{"question": ..., "keywords": [...]}, ...]
    """
    pattern = r'"question"\s*:\s*"([^"]+)"\s*,\s*"keywords"\s*:\s*\[([^\]]*)\]'
    matches = re.findall(pattern, text)

    data = []
    for q, kws in matches:
        keywords = [k.strip().strip('"') for k in kws.split(",") if k.strip()]
        data.append({"question": q, "keywords": keywords})
    return data

def generate_questions_and_keywords(skill):
    """
    Generate 3 interview questions with expected keywords for a given skill.
    Returns a list of dictionaries: [{"question": ..., "keywords": [...]}, ...]
    """
    try:
        model_name = get_available_model()
        model = genai.GenerativeModel(model_name)

        prompt = f"""
        Generate 3 interview questions to test a candidate's knowledge of {skill}.
        For each question, provide 3-5 important keywords that should be included in a good answer.
        Return ONLY valid JSON in the following format:

        [
          {{"question": "Question 1 text", "keywords": ["keyword1","keyword2","keyword3"]}},
          {{"question": "Question 2 text", "keywords": ["keyword1","keyword2","keyword3"]}},
          {{"question": "Question 3 text", "keywords": ["keyword1","keyword2","keyword3"]}}
        ]

        Do NOT include any extra text, numbering, or explanation.
        """

        response = model.generate_content(prompt)
        if response and hasattr(response, "text"):
            data = parse_response(response.text)
            if not data:  # fallback if parsing fails
                data = [{"question": response.text.strip(), "keywords": []}]
            return data
        else:
            return [{"question": f"Could not generate questions for {skill}.", "keywords": []}]

    except Exception as e:
        print(f"Error generating questions for {skill}: {e}")
        return [{"question": f"Error: Unable to generate question for {skill}.", "keywords": []}]
