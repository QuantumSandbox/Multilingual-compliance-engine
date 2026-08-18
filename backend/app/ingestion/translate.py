from __future__ import annotations

from app.config import settings


def translate_text(text: str, src: str = "auto", tgt: str = "en") -> str:
    """Translate using Gemini when an API key is configured; else passthrough."""
    if not text.strip():
        return text
    if not settings.gemini_api_key:
        return text
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)
        prompt = (
            f"Translate the following text from {src} to {tgt}. "
            f"Preserve meaning, numbers, dates and named entities. "
            f"Return only the translated text.\n\n{text}"
        )
        resp = model.generate_content(prompt)
        return (resp.text or text).strip()
    except Exception:
        return text
