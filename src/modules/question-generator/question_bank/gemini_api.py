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




import os
from dotenv import load_dotenv
import google.generativeai as genai
import re

# Load variables from .env.local in project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../../../.env.local'))

# Get the key securely
api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini with the hidden key
genai.configure(api_key=api_key)


MODEL_PRIORITY = ["models/gemini-2.5-flash", "models/gemini-2.0-flash", "models/gemini-pro"]

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
import json

def generate_questions_for_skills(skills):
    """
    Batch-generate questions for multiple skills in ONE Gemini call.

    Input:
        skills: ["Python", "React", "DBMS", ...]

    Output:
        A flat list of dicts:
        [
          {"skill": "Python", "text": "...", "keywords": ["...", ...]},
          {"skill": "Python", "text": "...", "keywords": ["...", ...]},
          {"skill": "React",  "text": "...", "keywords": ["...", ...]},
          ...
        ]
    """
    try:
        model_name = get_available_model()
        model = genai.GenerativeModel(model_name)

        skills_json = json.dumps(skills)

        prompt = f"""
        You are an interview question generator.

        You will receive a JSON array of skills:

        {skills_json}

        For EACH skill in that array, generate EXACTLY 3 interview questions
        that test the candidate's knowledge of that skill.

        For each question, also provide 3-5 important keywords that should
        appear in a strong answer.

        Return ONLY valid JSON in the following format (no extra text, no markdown):

        [
          {{"skill": "Python", "question": "Question text", "keywords": ["keyword1","keyword2","keyword3"]}},
          {{"skill": "Python", "question": "Question text", "keywords": ["keyword1","keyword2","keyword3"]}},
          {{"skill": "React",  "question": "Question text", "keywords": ["keyword1","keyword2","keyword3"]}},
          ...
        ]

        Requirements:
        - The top-level value MUST be a JSON array.
        - Each object MUST contain "skill", "question", and "keywords".
        - "skill" must be exactly one of the skills from the input array.
        - Do NOT include comments, explanation, or any text outside the JSON array.
        """

        response = model.generate_content(prompt)

        if not response or not hasattr(response, "text"):
            print("ERROR: Gemini returned empty or invalid response")
            return []

        raw = response.text.strip()

        # Try to extract the JSON array if there's any noise
        try:
            first = raw.find("[")
            last = raw.rfind("]")
            if first != -1 and last != -1:
                raw_json = raw[first:last + 1]
            else:
                raw_json = raw

            data = json.loads(raw_json)
        except Exception as e:
            print("ERROR parsing Gemini batch output:", e)
            print("Raw output was:", raw)
            return []

        if not isinstance(data, list):
            print("ERROR: Expected a JSON array from Gemini, got:", type(data))
            return []

        normalized = []
        for item in data:
            if not isinstance(item, dict):
                continue

            skill = item.get("skill")
            qtext = (
                item.get("question")
                or item.get("text")
                or ""
            )
            keywords = item.get("keywords") or item.get("tags") or []

            if not skill or not qtext:
                continue

            # Force keywords into a list of strings
            if not isinstance(keywords, list):
                keywords = [str(keywords)]
            else:
                keywords = [str(k) for k in keywords]

            normalized.append(
                {
                    "skill": skill,
                    "text": qtext,
                    "keywords": keywords,
                }
            )

        return normalized

    except Exception as e:
        print(f"Error generating batch questions for skills: {e}")
        return []
