import whisper
import tempfile
import os

# Load once (important for performance)
model = whisper.load_model("base")

def transcribe_audio(audio_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path)
        return result["text"]
    finally:
        os.remove(tmp_path)
