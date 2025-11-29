# import google.generativeai as genai

# # Replace with your actual API key
# genai.configure(api_key="AIzaSyDrf94oYvNvkADcgCj-QLOKIGTNJu14frg")

# model = genai.GenerativeModel("gemini-pro")

# try:
#     response = model.generate_content("Write 2 interview questions on Python.")
#     print("RAW RESPONSE:", response)
#     print("\n----\nExtracted Text:\n")
#     print(response.text)
# except Exception as e:
#     print("API ERROR:", e)

# OLD VERSION
# import google.generativeai as genai

# genai.configure(api_key="AIzaSyDrf94oYvNvkADcgCj-QLOKIGTNJu14frg")

# models = genai.list_models()

# for m in models:
#     print(m.name)




import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load variables from .env file
load_dotenv()

# Get the key securely
api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini with the hidden key
genai.configure(api_key=api_key)

# Test: list models
models = genai.list_models()
for m in models:
    print(m.name)

