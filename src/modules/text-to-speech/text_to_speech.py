# from gtts import gTTS
# import os
# import tempfile
# import pygame  # For playing audio files

# def speak(text, lang='en', slow=False):
#     """
#     Convert text to speech using Google Text-to-Speech and play it.
#     """
#     try:
#         # Generate speech
#         tts = gTTS(text=text, lang=lang, slow=slow)
        
#         # Save to temporary file
#         with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
#             temp_filename = temp_file.name
#             tts.save(temp_filename)
        
#         # Initialize pygame mixer if not already done
#         if not pygame.mixer.get_init():
#             pygame.mixer.init()
        
#         # Load and play the audio
#         pygame.mixer.music.load(temp_filename)
#         pygame.mixer.music.play()
        
#         # Wait for playback to finish
#         while pygame.mixer.music.get_busy():
#             pygame.time.wait(100)
        
#         # Clean up
#         pygame.mixer.music.unload()
#         os.unlink(temp_filename)
        
#         print("🎧 Speaking:", text)
        
#     except Exception as e:
#         print(f"Error in text-to-speech: {e}")

# # Example
# if __name__ == "__main__":
#     speak("People's well-being was the only thought in his mind. So, he was determined to marry a smart and kind-hearted girl. He heard about Naina. Naina was a princess of her neighbouring kingdom. She was a brave and smart girl. She even helped people in need. She was the only daughter of her father. Her father Narasimha supported her very much. She helped her father in making decisions. She made women's education compulsory in her kingdom.")
