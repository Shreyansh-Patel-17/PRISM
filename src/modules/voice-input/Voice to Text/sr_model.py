import speech_recognition as sr

# Initialize recognizer
r = sr.Recognizer()

# Use the default microphone as input source
with sr.Microphone() as source:
    print("🎙️ Please say something...")
    r.adjust_for_ambient_noise(source)   # Optional: reduce background noise
    audio = r.listen(source)

print("⏳ Recognizing your speech...")

try:
    # Convert speech to text using Google API (free & built-in)
    text = r.recognize_google(audio)
    print("✅ You said:", text)
except sr.UnknownValueError:
    print("❌ Could not understand audio")
except sr.RequestError:
    print("⚠️ Could not request results from the Speech Recognition service")
