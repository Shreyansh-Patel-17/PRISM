import pyttsx3

def speak(text):
    engine = pyttsx3.init()
    engine.setProperty('rate', 170)     # Speed (default ~200)
    engine.setProperty('volume', 1.0)   # Volume (0.0 to 1.0)

    # Optional: choose male/female voice
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[0].id)   # 0 = male, 1 = female (on most systems)

    print("🎧 Speaking:", text)
    engine.say(text)
    engine.runAndWait()

# Example
if __name__ == "__main__":
    speak("People's well-being was the only thought in his mind. So, he was determined to marry a smart and kind-hearted girl. He heard about Naina. Naina was a princess of his neighbouring kingdom. She was a brave and smart girl. She even helped people in need. She was the only daughter of her father. Her father Narasimha supported her very much. She helped her father in making decisions. She made women's education compulsory in her kingdom. ")
