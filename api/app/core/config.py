import os
from typing import List, Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from pydantic import ConfigDict, field_validator
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Logs Dashboard API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "REST API for Logs Dashboard - Full Stack Engineer Assignment"
    
    # Server Configuration
    HOST: str = os.getenv("API_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:password@db:5432/logs_dashboard"
    )
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = ["*"]
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_HEADERS: List[str] = ["*"]
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")
    
    # Pagination defaults
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 1000
    model_config = ConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="allow"
    )


# Create global settings instance
settings = Settings()