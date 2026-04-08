from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import secrets
from dotenv import load_dotenv
import os
from pathlib import Path

# Get backend directory path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

# Load .env file explicitly with absolute path
load_dotenv(ENV_FILE)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Bug Bounty MindMap Platform"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Cloudflare Turnstile
    TURNSTILE_SECRET_KEY: str = ""
    TURNSTILE_ENABLED: bool = False
    
    # Email Configuration
    EMAIL_ENABLED: bool = False
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@bugbounty.com"
    FROM_NAME: str = "Bug Bounty Platform"
    
    # Database
    DATABASE_URL: str
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    
    # Environment
    ENVIRONMENT: str = "development"


settings = Settings()
