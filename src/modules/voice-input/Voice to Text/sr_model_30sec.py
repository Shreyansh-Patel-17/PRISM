import speech_recognition as sr

# Initialize recognizer
r = sr.Recognizer()

import pyttsx3

def text_to_speech(text):
    """
    Convert text input to speech and play it aloud.
    """
    engine = pyttsx3.init()
    engine.setProperty('rate', 170)      # speaking speed
    engine.setProperty('volume', 1.0)    # volume (0.0–1.0)

    # Select voice (male/female depending on system)
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[0].id)   # change to voices[1] for female if available

    print("🎧 Speaking...")
    engine.say(text)
    engine.runAndWait()

# Use the default microphone as input source
with sr.Microphone() as source:
    print("🎙️ Please start speaking (you have up to 30 seconds)...")
    
    # Reduce background noise (optional but recommended)
    r.adjust_for_ambient_noise(source, duration=1)
    
    # Listen for speech for up to 30 seconds
    audio = r.listen(source, phrase_time_limit=30)

print("⏳ Recognizing your speech...")

try:
    # Convert speech to text using Google API
    text = r.recognize_google(audio)
    text_to_speech(text)
except sr.UnknownValueError:
    print("❌ Could not understand audio")
except sr.RequestError:
    print("⚠️ Could not request results from the Speech Recognition service")
