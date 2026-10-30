import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables and local .env file.
    Supports managed Supabase PostgreSQL connection strings as well as local SQLite fallback.
    """
    app_name: str = "Madhya Pradesh El Niño Preemption Engine API"
    app_version: str = "1.0.0"
    app_env: str = Field(default="development", alias="APP_ENV")
    
    # Supabase PostgreSQL or standard PostgreSQL URL
    # e.g.: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
    database_url: str = Field(default="", alias="DATABASE_URL")
    
    # Optional Supabase credentials
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_key: str = Field(default="", alias="SUPABASE_KEY")
    
    # Port to bind FastAPI
    port: int = Field(default=8081, alias="FASTAPI_PORT")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def effective_database_url(self) -> str:
        """
        Returns the resolved database connection URL.
        1. If DATABASE_URL is set, normalizes 'postgres://' to 'postgresql://' for SQLAlchemy 2.0.
        2. If empty, falls back gracefully to a safe local SQLite file database.
        """
        url = (self.database_url or "").strip()
        if not url:
            # Safe local fallback for development and test execution
            return "sqlite:///./app_data.db"
        
        # SQLAlchemy 2 requires postgresql:// rather than postgres://
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url


settings = Settings()
