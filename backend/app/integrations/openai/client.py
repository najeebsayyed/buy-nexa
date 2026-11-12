"""OpenAI integration adapter for structured shopping brief extraction."""

from typing import Protocol

from openai import APIConnectionError, APIError, APITimeoutError, AsyncOpenAI

from app.core.config import settings
from app.core.errors import ConfigurationException, ProviderException
from app.core.logging import logger
from app.schemas.brief import ShoppingBriefData

BRIEF_EXTRACTION_SYSTEM_PROMPT = """You are BuyNexa's shopping intent extraction analyst.
Analyze the shopper's natural-language buying goal and produce a structured brief.

Guidelines:
1. Extract product category (e.g. 'wireless headphones', '4k monitor').
2. Extract specific use cases (e.g. ['travel', 'office calls', 'coding']).
3. Extract budget if stated:
   - amount: numeric positive float (e.g. 150.0 for '$150')
   - currency: ISO 4217 3-letter code (default 'USD' for '$' or US context)
   - mode: 'hard_limit' for 'under $X', 'max $X', 'below $X', 'up to $X'; 'target' for 'around $X', 'ideally'.
   CRITICAL: If a budget or price limit is stated, ALWAYS populate the budget object.
4. must_have: features described as important, required, or essential (e.g. 'noise cancellation is important' -> ['noise cancellation']).
5. preferences: soft preferences or desirable attributes (e.g. ['comfortable', 'compact']).
6. exclusions: explicit negatives, dealbreakers, or styles to avoid (e.g. ['bulky models', 'wired']).
7. preferred_brands: specific manufacturer/brand names mentioned favorably.
8. locale: shopper locale if mentioned (e.g. 'US', 'UK'), else null.

CRITICAL: Never invent facts or brands not mentioned. Keep unknown values as null or []."""


class OpenAIClientProtocol(Protocol):
    """Protocol defining the OpenAI client adapter contract for testing and swappability."""

    async def extract_shopping_brief(self, query: str) -> ShoppingBriefData: ...


class OpenAIAdapter:
    """Official OpenAI client adapter using structured outputs."""

    def __init__(self, client: AsyncOpenAI | None = None, model: str | None = None):
        self._client = client
        self._model = model or settings.OPENAI_MODEL

    def _get_client(self) -> AsyncOpenAI:
        if self._client is not None:
            return self._client
        if not settings.OPENAI_API_KEY:
            raise ConfigurationException(
                message="OpenAI API key is not configured. Set OPENAI_API_KEY in environment.",
                code="OPENAI_NOT_CONFIGURED",
            )
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, timeout=30.0)
        return self._client

    async def extract_shopping_brief(self, query: str) -> ShoppingBriefData:
        """Calls OpenAI beta parse API to extract structured ShoppingBriefData."""
        client = self._get_client()

        try:
            logger.info(
                "Calling OpenAI for structured shopping brief extraction",
                extra={"extra_data": {"model": self._model}},
            )
            completion = await client.beta.chat.completions.parse(
                model=self._model,
                messages=[
                    {"role": "system", "content": BRIEF_EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": query},
                ],
                response_format=ShoppingBriefData,
            )

            choice = completion.choices[0]
            if choice.message.refusal:
                logger.warning(f"OpenAI refused extraction: {choice.message.refusal}")
                raise ProviderException(
                    message=f"Model refused intent extraction: {choice.message.refusal}",
                    code="AI_EXTRACTION_REFUSED",
                    retryable=False,
                )

            parsed = choice.message.parsed
            if parsed is None:
                raise ProviderException(
                    message="Model failed to return structured shopping brief data",
                    code="AI_OUTPUT_INVALID",
                    retryable=True,
                )

            return parsed

        except (APITimeoutError, APIConnectionError) as exc:
            logger.error(f"OpenAI connectivity/timeout error: {exc}")
            raise ProviderException(
                message="OpenAI service is temporarily unreachable or timed out.",
                code="AI_PROVIDER_UNAVAILABLE",
                retryable=True,
            ) from exc
        except APIError as exc:
            logger.error(f"OpenAI API error: {exc}")
            raise ProviderException(
                message=f"OpenAI API error: {exc.message}",
                code="AI_PROVIDER_ERROR",
                retryable=exc.code in ("rate_limit_exceeded", "server_error"),
            ) from exc


openai_adapter = OpenAIAdapter()
