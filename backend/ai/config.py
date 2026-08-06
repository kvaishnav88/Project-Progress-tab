import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend package dir and repo root (cwd-independent).
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_REPO_ROOT = _BACKEND_DIR.parent

load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_REPO_ROOT / ".env")


class Settings:

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    GEMINI_MODEL = os.getenv(
        "GEMINI_MODEL",
        "gemini-2.0-flash",
    )

    # Future support for multiple providers
    LLM_PROVIDER = os.getenv(
        "LLM_PROVIDER",
        "gemini",
    )

    DEBUG = os.getenv(
        "DEBUG",
        "False",
    ).lower() == "true"


settings = Settings()
