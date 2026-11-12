"""Centralized configuration for BuyNexa backend using Pydantic Settings."""

from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env files."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "BuyNexa"
    APP_ENV: Literal["development", "production", "test"] = "development"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # Frontend Origin for CORS (e.g. Vite dev server)
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/buynexa"

    # OpenAI (server-side only)
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Channel3 API (server-side only)
    CHANNEL3_API_KEY: str | None = None
    CHANNEL3_BASE_URL: str = "https://api.trychannel3.com"

    # PayPal Orders v2 Sandbox (server-side only)
    PAYPAL_CLIENT_ID: str | None = None
    PAYPAL_CLIENT_SECRET: str | None = None
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"

    # Anonymous Session Cookie
    SESSION_COOKIE_NAME: str = "buynexa_session"
    SESSION_COOKIE_SECURE: bool = False
    SESSION_MAX_AGE_DAYS: int = Field(default=30, ge=1, le=365)

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            raise ValueError("DATABASE_URL must not be empty")
        return v

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def openai_api_key(self) -> str | None:
        return self.OPENAI_API_KEY

    @property
    def openai_model(self) -> str:
        return self.OPENAI_MODEL

    @property
    def channel3_api_key(self) -> str | None:
        return self.CHANNEL3_API_KEY

    @property
    def channel3_base_url(self) -> str:
        return self.CHANNEL3_BASE_URL

    @property
    def paypal_client_id(self) -> str | None:
        return self.PAYPAL_CLIENT_ID

    @property
    def paypal_client_secret(self) -> str | None:
        return self.PAYPAL_CLIENT_SECRET

    @property
    def paypal_base_url(self) -> str:
        return self.PAYPAL_BASE_URL


settings = Settings()


def get_settings() -> Settings:
    """Return the cached application settings instance."""
    return settings
