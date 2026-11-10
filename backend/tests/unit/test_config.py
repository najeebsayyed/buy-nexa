"""Unit tests for centralized configuration and environment validation."""

import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_default_settings():
    settings = Settings()
    assert settings.APP_NAME == "BuyNexa"
    assert settings.API_V1_PREFIX == "/api/v1"
    assert settings.SESSION_MAX_AGE_DAYS == 30
    assert not settings.is_production


def test_invalid_database_url():
    with pytest.raises(ValidationError):
        Settings(DATABASE_URL="")


def test_session_cookie_age_bounds():
    with pytest.raises(ValidationError):
        Settings(SESSION_MAX_AGE_DAYS=0)
    with pytest.raises(ValidationError):
        Settings(SESSION_MAX_AGE_DAYS=500)
