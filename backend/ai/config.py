import os
from dotenv import load_dotenv

load_dotenv()


class Settings:

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    GEMINI_MODEL = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.1-flash-lite",
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