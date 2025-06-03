"""
Configuration settings for ESAL Platform Backend
"""
from pydantic_settings import BaseSettings
from typing import List, Union
import os


class Settings(BaseSettings):
    """Application settings"""    # Supabase Configuration (Primary Database)
    SUPABASE_URL: str = "https://ppvkucdspgoeqsxxydxg.supabase.co"    
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmt1Y2RzcGdvZXFzeHh5ZHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNTkzMzAsImV4cCI6MjA2MzczNTMzMH0.6VVpA6qEcjNPJvPvn0dMh7CUNkNTCYGWsMwb6WS0XGE"  # Keep for reference
    SUPABASE_SERVICE_ROLE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmt1Y2RzcGdvZXFzeHh5ZHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE1OTMzMCwiZXhwIjoyMDYzNzM1MzMwfQ.Tt2F9WnX6Dai3Yi2TBgzfUPK38XR4tIpLLh5rFMlU-s"  # Service role key - bypasses RLS
    
    # Local Database (Optional - can be disabled)
    USE_LOCAL_DB: bool = False  # Set to False to use only Supabase
    DATABASE_URL: str = "sqlite:///./esal_dev.db"  # Kept for backward compatibility
      # Email Configuration (deprecated - email confirmation disabled)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@esalplatform.com"
    SMTP_FROM_NAME: str = "ESAL Platform"
    
    # Site Configuration
    SITE_URL: str = "http://localhost:3001"
    # CONFIRM_EMAIL_REDIRECT_URL removed - email confirmation disabled    # AI APIs
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "your-gemini-api-key")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")  # Optional OpenAI API key
      # JWT
    JWT_SECRET_KEY: str = "hzuQ0vV09u6lDiKEb7a+5SG0uNRpepuaImQW7F/8+pePoatdth4/YyJWkgB/IjnwH6qYTMJWgny1bs0fB/nS8A=="
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_TIME: int = 3600  # 1 hour
      # CORS - Handle as string and convert to list
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",  # Landing page
        "http://localhost:3001",  # Innovator portal
        "http://localhost:3002",  # Investor portal
        "http://localhost:3003",  # Hub portal
        "http://localhost:3004",  # Admin portal
        "http://localhost:5173",  # Vite default dev server
        "http://localhost:8080",  # Alternative dev server
        "http://localhost:5000",  # Alternative dev server
        "http://127.0.0.1:3000",  # Landing page (127.0.0.1)
        "http://127.0.0.1:3001",  # Innovator portal (127.0.0.1)
        "http://127.0.0.1:3002",  # Investor portal (127.0.0.1)
        "http://127.0.0.1:3003",  # Hub portal (127.0.0.1)
        "http://127.0.0.1:3004",  # Admin portal (127.0.0.1)
        "http://127.0.0.1:5173",  # Vite default (127.0.0.1)
        "https://esal-platform.vercel.app"  # Production deployment
    ]
    
    # App
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra environment variables
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert ALLOWED_ORIGINS from string to list if needed
        if isinstance(self.ALLOWED_ORIGINS, str):
            self.ALLOWED_ORIGINS = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
