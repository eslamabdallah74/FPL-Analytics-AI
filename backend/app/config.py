import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    FPL_BASE_URL: str = "https://fantasy.premierleague.com/api/"
    DATABASE_URL: str = "sqlite:///./fpldb.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    ENVIRONMENT: str = "development"
    
    # OAuth 2.0 / OIDC Settings
    FPL_ISSUER: str = "https://account.premierleague.com/as"
    FPL_CLIENT_ID: str = ""  # Set via environment variable if registered
    FPL_CLIENT_SECRET: str = ""
    FPL_REDIRECT_URI: str = "http://localhost:9001/auth/fpl/callback"
    SECRET_KEY: str = "fpl_ai_secret_key_session_encryption_2026_super_secret"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
