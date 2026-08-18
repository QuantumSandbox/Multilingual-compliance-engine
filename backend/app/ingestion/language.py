from __future__ import annotations

from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0

SUPPORTED = {
    "en": "English",
    "hi": "Hindi",
    "or": "Odia",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "fr": "French",
    "es": "Spanish",
}


def detect_language(text: str) -> str:
    sample = " ".join(text.split())[:1000]
    if not sample.strip():
        return "en"
    try:
        return detect(sample)
    except Exception:
        return "en"
