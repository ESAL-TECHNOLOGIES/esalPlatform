"""
Configuration settings for the ESAL Platform API.

This module defines application-wide settings with environment variable validation.
All environment variables are validated at startup time using Pydantic.
"""
from functools import lru_cache
from typing import List, Optional, Union
import os
from pydantic import Field, field_validator, PostgresDsn, HttpUrl
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings with environment validation.
    
    Attributes:
        PROJECT_NAME: Name of the project
        API_VERSION: API version
        DEBUG: Debug mode flag
        ENVIRONMENT: Current environment (dev, test, prod)
        ALLOWED_ORIGINS: CORS allowed origins
        DATABASE_URL: PostgreSQL connection URL
        REDIS_URL: Redis connection URL
        GEMINI_API_KEY: Google Gemini API key
        OPENAI_API_KEY: OpenAI API key
        SENTRY_DSN: Sentry error tracking URL
        TELEMETRY_ENABLED: Whether telemetry is enabled
    """
    # Core settings
    PROJECT_NAME: str = "ESAL Platform API"
    API_VERSION: str = "v1"
    DEBUG: bool = Field(default=False)
    ENVIRONMENT: str = Field(default="dev")    # CORS settings
    ALLOWED_ORIGINS: Union[str, List[str]] = Field(
        default="http://localhost:3000,http://localhost:8000"
    )
    
    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse ALLOWED_ORIGINS from comma-separated string to list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    # Database configurations
    DATABASE_URL: Optional[Union[PostgresDsn, str]] = Field(
        default="postgresql://postgres:postgres@localhost:5432/esal_db",
        description="PostgreSQL connection string"
    )
    
    # Redis for caching and background tasks
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection string"
    )
    
    # AI API keys
    GEMINI_API_KEY: Optional[str] = Field(
        default=None,
        description="Google Gemini API key"
    )
    OPENAI_API_KEY: Optional[str] = Field(
        default=None, 
        description="OpenAI API key"
    )
    
    # Observability settings
    SENTRY_DSN: Optional[HttpUrl] = Field(
        default=None, 
        description="Sentry DSN for error tracking"
    )
    TELEMETRY_ENABLED: bool = Field(
        default=True,
        description="Enable telemetry collection"
    )
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level"
    )
    
    @field_validator("ENVIRONMENT")
    def validate_environment(cls, v: str) -> str:
        """Validate that the environment is one of the allowed values."""
        allowed = ["dev", "test", "prod"]
        if v.lower() not in allowed:
            raise ValueError(f"Environment must be one of: {', '.join(allowed)}")
        return v.lower()
    
    @field_validator("LOG_LEVEL")
    def validate_log_level(cls, v: str) -> str:
        """Validate that the log level is one of the allowed values."""
        allowed = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in allowed:
            raise ValueError(f"Log level must be one of: {', '.join(allowed)}")
        return v.upper()
    
    class Config:
        """Configuration for environment variables."""
        env_file = ".env"
        case_sensitive = True
        validate_assignment = True
        extra = "ignore"

# Cache settings to avoid reloading from environment each time
@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Returns:
        Settings instance
    """
    return Settings()

# Create settings instance for direct import
settings = get_settings()