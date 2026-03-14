"""
Application configuration module

Loads environment variables from the .env file
and makes them available across the application.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str

    # JWT Authentication
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # External APIs
    mapbox_access_token: str

    # Tell Pydantic to load from .env
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


# Create a global settings object
settings = Settings()