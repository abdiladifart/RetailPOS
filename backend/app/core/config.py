from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "RetailPOS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    SQLITE_URL: str = "sqlite:///./retailpos_offline.db"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Printer
    PRINTER_NAME: str = "default"
    PRINTER_WIDTH: int = 80
    
    # Sync
    SYNC_INTERVAL_SECONDS: int = 300  # 5 minutes
    OFFLINE_MODE: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
