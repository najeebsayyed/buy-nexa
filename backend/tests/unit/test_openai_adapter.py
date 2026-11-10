"""Unit tests for OpenAI adapter error handling and client boundaries."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from openai import APITimeoutError

from app.core.config import settings
from app.core.errors import ConfigurationException, ProviderException
from app.integrations.openai.client import OpenAIAdapter


@pytest.mark.asyncio
async def test_missing_api_key_raises_configuration_error(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)
    adapter = OpenAIAdapter(client=None)

    with pytest.raises(ConfigurationException) as exc_info:
        await adapter.extract_shopping_brief("Test query")

    assert exc_info.value.code == "OPENAI_NOT_CONFIGURED"


@pytest.mark.asyncio
async def test_openai_refusal_raises_provider_error():
    mock_client = MagicMock()
    mock_client.beta = MagicMock()
    mock_client.beta.chat = MagicMock()
    mock_client.beta.chat.completions = MagicMock()

    mock_choice = MagicMock()
    mock_choice.message.refusal = "I cannot assist with commercial shopping requests."
    mock_choice.message.parsed = None

    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]

    mock_client.beta.chat.completions.parse = AsyncMock(return_value=mock_completion)

    adapter = OpenAIAdapter(client=mock_client)
    with pytest.raises(ProviderException) as exc_info:
        await adapter.extract_shopping_brief("Test query")

    assert exc_info.value.code == "AI_EXTRACTION_REFUSED"


@pytest.mark.asyncio
async def test_openai_timeout_raises_provider_error():
    mock_client = MagicMock()
    mock_client.beta = MagicMock()
    mock_client.beta.chat = MagicMock()
    mock_client.beta.chat.completions = MagicMock()

    mock_client.beta.chat.completions.parse = AsyncMock(
        side_effect=APITimeoutError(request=MagicMock())
    )

    adapter = OpenAIAdapter(client=mock_client)
    with pytest.raises(ProviderException) as exc_info:
        await adapter.extract_shopping_brief("Test query")

    assert exc_info.value.code == "AI_PROVIDER_UNAVAILABLE"
    assert exc_info.value.retryable is True
