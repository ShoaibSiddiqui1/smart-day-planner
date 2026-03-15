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

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Email (SMTP) – used for password reset emails
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""

    # Password reset token lifetime in minutes
    PASSWORD_RESET_EXPIRE_MINUTES: int = 15

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
