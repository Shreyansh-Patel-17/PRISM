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


import google.generativeai as genai

genai.configure(api_key="AIzaSyDrf94oYvNvkADcgCj-QLOKIGTNJu14frg")

models = genai.list_models()

for m in models:
    print(m.name)
