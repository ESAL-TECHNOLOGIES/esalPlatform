"""
Environment Configuration Loader for Python
Loads environment variables from the secrets folder based on ENVIRONMENT variable
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any
from dotenv import load_dotenv


class EnvironmentConfig:
    """Environment configuration class with validation"""
    
    def __init__(self, environment: Optional[str] = None):
        self.environment = environment or os.getenv('ENVIRONMENT', 'development')
        self._load_environment()
        self._validate_required_vars()
    
    def _load_environment(self):
        """Load environment variables from secrets file"""
        secrets_path = Path(__file__).parent / 'environments' / f'.env.{self.environment}'
        
        if secrets_path.exists():
            load_dotenv(secrets_path)
        else:
            print(f"Warning: Secrets file not found: {secrets_path}")
            print("Loading from system environment variables instead...")
    
    def _validate_required_vars(self):
        """Validate that required environment variables are present"""
        required_vars = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'JWT_SECRET_KEY',
            'DATABASE_URL'
        ]
        
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    @property
    def supabase_url(self) -> str:
        return os.getenv('SUPABASE_URL', '')
    
    @property
    def supabase_anon_key(self) -> str:
        return os.getenv('SUPABASE_ANON_KEY', '')
    
    @property
    def supabase_service_role_key(self) -> str:
        return os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    
    @property
    def database_url(self) -> str:
        return os.getenv('DATABASE_URL', '')
    
    @property
    def gemini_api_key(self) -> str:
        return os.getenv('GEMINI_API_KEY', '')
    
    @property
    def openai_api_key(self) -> Optional[str]:
        return os.getenv('OPENAI_API_KEY')
    
    @property
    def jwt_secret_key(self) -> str:
        return os.getenv('JWT_SECRET_KEY', '')
    
    @property
    def jwt_algorithm(self) -> str:
        return os.getenv('JWT_ALGORITHM', 'HS256')
    
    @property
    def jwt_expiration_time(self) -> int:
        return int(os.getenv('JWT_EXPIRATION_TIME', '3600'))
    
    @property
    def debug(self) -> bool:
        return os.getenv('DEBUG', 'false').lower() == 'true'
    
    @property
    def project_name(self) -> str:
        return os.getenv('PROJECT_NAME', 'ESAL Platform API')
    
    @property
    def api_version(self) -> str:
        return os.getenv('API_VERSION', 'v1')
    
    @property
    def allowed_origins(self) -> list:
        origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000')
        return [origin.strip() for origin in origins.split(',')]
    
    @property
    def smtp_host(self) -> str:
        return os.getenv('SMTP_HOST', 'smtp.gmail.com')
    
    @property
    def smtp_port(self) -> int:
        return int(os.getenv('SMTP_PORT', '587'))
    
    @property
    def smtp_user(self) -> str:
        return os.getenv('SMTP_USER', '')
    
    @property
    def smtp_password(self) -> str:
        return os.getenv('SMTP_PASSWORD', '')
    
    @property
    def smtp_from_email(self) -> str:
        return os.getenv('SMTP_FROM_EMAIL', '')
    
    @property
    def smtp_from_name(self) -> str:
        return os.getenv('SMTP_FROM_NAME', 'ESAL Platform')
    
    @property
    def redis_url(self) -> str:
        return os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    def to_dict(self) -> Dict[str, Any]:
        """Return configuration as dictionary"""
        return {
            'environment': self.environment,
            'supabase_url': self.supabase_url,
            'database_url': self.database_url,
            'debug': self.debug,
            'project_name': self.project_name,
            'api_version': self.api_version,
            'allowed_origins': self.allowed_origins,
            'smtp_host': self.smtp_host,
            'smtp_port': self.smtp_port,
            'redis_url': self.redis_url
        }


# Create singleton instance
env_config = EnvironmentConfig()


def get_environment_config(environment: Optional[str] = None) -> EnvironmentConfig:
    """Get environment configuration instance"""
    if environment:
        return EnvironmentConfig(environment)
    return env_config
