from __future__ import annotations

import os
from pathlib import Path

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "compliance.db"

# Sample data lives alongside the repo (not uploaded at runtime)
SAMPLE_DIR = BASE_DIR.parent / "sample_data"


class Settings(BaseSettings):
    app_name: str = "Multilingual Regulatory Compliance Engine"
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 12

    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    embedding_model: str = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-small")
    default_retention_days: int = int(os.getenv("DEFAULT_RETENTION_DAYS", "1825"))

    database_url: str = f"sqlite:///{DB_PATH}"
    cors_origins: list[str] = ["http://localhost:3002", "http://localhost:5173"]

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "ignore"


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
