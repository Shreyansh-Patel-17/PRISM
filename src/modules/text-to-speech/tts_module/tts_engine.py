# prism/tts_module/tts_engine.py

import os
import threading
import tempfile
import sys
import subprocess

try:
    import pyttsx3
except ImportError:
    pyttsx3 = None

try:
    from gtts import gTTS
except ImportError:
    gTTS = None

class TTSEngine:
    def __init__(self, backend='pyttsx3', voice=None, rate=150, volume=1.0):
        self.backend = backend
        self.voice = voice
        self.rate = rate
        self.volume = volume
        self._engine = None
        self._play_thread = None

        if backend == 'pyttsx3' and pyttsx3:
            self._init_pyttsx3()

    # ---------- PYTTSX3 SECTION ----------
    def _init_pyttsx3(self):
        self._engine = pyttsx3.init()
        self._engine.setProperty('rate', self.rate)
        self._engine.setProperty('volume', self.volume)
        if self.voice:
            try:
                self._engine.setProperty('voice', self.voice)
            except Exception:
                pass

    def list_voices(self):
        if self.backend == 'pyttsx3' and self._engine:
            voices = self._engine.getProperty('voices')
            return [(v.id, v.name) for v in voices]
        return []

    def set_voice(self, voice_id):
        self.voice = voice_id
        if self._engine:
            self._engine.setProperty('voice', voice_id)

    def _speak_blocking(self, text):
        if self._engine:
            self._engine.say(text)
            self._engine.runAndWait()

    def speak(self, text):
        """Speaks text depending on backend"""
        if self.backend == 'pyttsx3':
            self._play_thread = threading.Thread(target=self._speak_blocking, args=(text,), daemon=True)
            self._play_thread.start()
        elif self.backend == 'gtts':
            self._speak_gtts(text)
        else:
            print("Unsupported backend.")

    def save(self, text, filepath):
        if self.backend == 'pyttsx3' and self._engine:
            self._engine.save_to_file(text, filepath)
            self._engine.runAndWait()
        elif self.backend == 'gtts':
            self._save_gtts(text, filepath)

    def stop(self):
        if self.backend == 'pyttsx3' and self._engine:
            try:
                self._engine.stop()
            except Exception:
                pass

    # ---------- GTTS SECTION ----------
    def _speak_gtts(self, text, lang='en'):
        if not gTTS:
            print("gTTS not installed.")
            return
        tts = gTTS(text=text, lang=lang)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        tmp.close()
        tts.save(tmp.name)
        self._play_audio(tmp.name)
        os.remove(tmp.name)

    def _save_gtts(self, text, filepath, lang='en'):
        if not gTTS:
            print("gTTS not installed.")
            return
        tts = gTTS(text=text, lang=lang)
        tts.save(filepath)

    def _play_audio(self, path):
        """Play audio cross-platform"""
        try:
            if sys.platform.startswith('linux'):
                subprocess.run(['mpg123', path], check=False)
            elif sys.platform.startswith('win'):
                os.startfile(path)
            else:
                from playsound import playsound
                playsound(path)
        except Exception:
            from playsound import playsound
            playsound(path)
