"""
Configuration settings for ESAL Platform Backend
"""
from pydantic_settings import BaseSettings
from typing import List, Union
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: str = "your-supabase-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "your-supabase-service-role-key"
    DATABASE_URL: str = "sqlite:///./esal_dev.db"  # Default to SQLite for development
    
    # Gemini AI
    GEMINI_API_KEY: str = "your-gemini-api-key"
    
    # JWT
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_TIME: int = 3600  # 1 hour
    
    # CORS - Handle as string and convert to list
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080",
        "http://localhost:5000",
        "https://esal-platform.vercel.app"
    ]
    
    # App
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert ALLOWED_ORIGINS from string to list if needed
        if isinstance(self.ALLOWED_ORIGINS, str):
            self.ALLOWED_ORIGINS = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
