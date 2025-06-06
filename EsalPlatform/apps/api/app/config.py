"""
Configuration settings for ESAL Platform Backend
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Union
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Supabase Configuration (Primary Database)
    SUPABASE_URL: str = Field(default="", description="Supabase project URL")
    SUPABASE_ANON_KEY: str = Field(default="", description="Supabase anonymous key")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", description="Supabase service role key")    
    # Local Database (Optional - can be disabled)
    USE_LOCAL_DB: bool = Field(default=False, description="Use local SQLite database")
    DATABASE_URL: str = Field(default="sqlite:///./esal_dev.db", description="Database URL")
    
    # Email Configuration - Gmail SMTP for verification codes
    SMTP_HOST: str = Field(default="smtp.gmail.com", description="SMTP server host")
    SMTP_PORT: int = Field(default=587, description="SMTP server port")
    SMTP_USER: str = Field(default="", description="SMTP username")
    SMTP_PASSWORD: str = Field(default="", description="SMTP password")
    SMTP_FROM_EMAIL: str = Field(default="", description="Email sender address")
    SMTP_FROM_NAME: str = Field(default="ESAL Platform", description="Email sender name")
    
    # Email verification settings
    VERIFICATION_CODE_EXPIRY_MINUTES: int = Field(default=10, description="Code expiry time in minutes")
    SITE_URL: str = Field(default="http://localhost:3000", description="Site base URL")
    CONFIRM_EMAIL_REDIRECT_URL: str = Field(default="http://localhost:3001/email-confirmed", description="Email confirmation redirect URL")
    
    # AI APIs
    GEMINI_API_KEY: str = Field(default="your-gemini-api-key", description="Google Gemini API key")
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    
    # JWT
    JWT_SECRET_KEY: str = Field(default="dev-change-this-in-production", description="JWT secret key")
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    JWT_EXPIRATION_TIME: int = Field(default=3600, description="JWT expiration time in seconds")    
    # CORS - Handle as string and convert to list
    ALLOWED_ORIGINS: Union[str, List[str]] = Field(
        default=[
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
        ],
        description="Allowed CORS origins"
    )
    
    # App
    DEBUG: bool = Field(default=True, description="Debug mode")    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert ALLOWED_ORIGINS from string to list if needed
        if isinstance(self.ALLOWED_ORIGINS, str):
            self.ALLOWED_ORIGINS = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
