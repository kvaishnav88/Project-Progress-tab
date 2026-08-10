import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "AuraGen Backend")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://auragen:auragen@127.0.0.1:5433/auragen",
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_me_in_production")
    AI_SERVICE_URL: str = os.getenv(
        "AI_SERVICE_URL",
        "http://127.0.0.1:8000/generate-ui",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
