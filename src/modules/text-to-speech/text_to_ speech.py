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

# ---------- MAIN PROGRAM ----------
if __name__ == "__main__":
    user_text = input("📝 Enter the text you want to speak: ")
    if user_text.strip():
        text_to_speech(user_text)
    else:
        print("⚠️ No text entered.")
