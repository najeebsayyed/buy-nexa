"""Structured logging configuration with request correlation ID and redaction."""

import contextvars
import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any

# Context variable for tracing request IDs across async calls
request_id_ctx: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "request_id", default=None
)

SENSITIVE_KEYS = {
    "password",
    "token",
    "access_token",
    "secret",
    "client_secret",
    "api_key",
    "authorization",
    "cookie",
    "buynexa_session",
    "paypal_client_secret",
    "openai_api_key",
    "channel3_api_key",
}


def redact_sensitive_data(data: Any) -> Any:
    """Recursively redacts sensitive keys in dictionaries or strings."""
    if isinstance(data, dict):
        redacted = {}
        for k, v in data.items():
            if str(k).lower() in SENSITIVE_KEYS:
                redacted[k] = "[REDACTED]"
            else:
                redacted[k] = redact_sensitive_data(v)
        return redacted
    elif isinstance(data, list):
        return [redact_sensitive_data(item) for item in data]
    return data


class StructuredJsonFormatter(logging.Formatter):
    """Formats log records as structured JSON with request correlation."""

    def format(self, record: logging.LogRecord) -> str:
        req_id = request_id_ctx.get()
        log_entry: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": req_id,
        }

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        if hasattr(record, "extra_data") and isinstance(record.extra_data, dict):
            log_entry["data"] = redact_sensitive_data(record.extra_data)

        return json.dumps(log_entry)


def setup_logging(level: str = "INFO") -> None:
    """Configures structured root logging."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredJsonFormatter())

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Suppress verbose third-party loggers
    logging.getLogger("uvicorn.access").handlers = [handler]
    logging.getLogger("uvicorn.error").handlers = [handler]
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


logger = logging.getLogger("buynexa")
def get_logger(name: str = "buynexa") -> logging.Logger:
    """Return a named logger within the structured logging framework."""
    return logging.getLogger(name)
