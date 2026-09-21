import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "monsterjack-super-secret-jwt-token-key-change-in-production-2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./monster_jack.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI Config
    AI_PROVIDER: str = "ollama"  # ollama | openai | gemini
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:latest"

    # Google Gemini / Imagen
    GEMINI_API_KEY: Optional[str] = None
    IMAGEN_MODEL: str = "imagen-3.0-generate-002"

    # OpenAI (Fallback)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Social Connectors
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    TWITTER_CLIENT_ID: Optional[str] = None
    TWITTER_CLIENT_SECRET: Optional[str] = None

settings = Settings()
