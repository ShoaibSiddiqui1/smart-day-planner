"""
Application configuration loaded from environment variables.
Uses pydantic-settings to validate and parse the .env file.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # App
    APP_NAME: str = "Smart Day Planner API"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
