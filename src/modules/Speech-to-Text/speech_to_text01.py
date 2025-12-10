import speech_recognition as sr
import sys
import os

# Initialize recognizer
r = sr.Recognizer()

# Check if a file path is provided as command line argument
if len(sys.argv) > 1:
    audio_file_path = sys.argv[1]
    if not os.path.exists(audio_file_path):
        print("ERROR: Audio file not found")
        sys.exit(1)

    # Use the audio file as input source
    with sr.AudioFile(audio_file_path) as source:
        print("Processing audio file...")
        r.adjust_for_ambient_noise(source)   # Optional: reduce background noise
        audio = r.record(source)
else:
    # Use the default microphone as input source (fallback for direct usage)
    with sr.Microphone() as source:
        print("Please say something...")
        r.adjust_for_ambient_noise(source)   # Optional: reduce background noise
        audio = r.listen(source)

print("Recognizing your speech...")

try:
    # Convert speech to text using Google API (free & built-in)
    text = r.recognize_google(audio)
    print("SUCCESS: You said:", text)
except sr.UnknownValueError:
    print("ERROR: Could not understand audio")
except sr.RequestError:
    print("WARNING: Could not request results from the Speech Recognition service")
