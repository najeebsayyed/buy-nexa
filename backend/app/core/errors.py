"""Application domain exceptions and standard error response formatting."""

from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import logger, request_id_ctx


class AppException(Exception):
    """Base class for all BuyNexa application exceptions."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        retryable: bool = False,
        details: Any = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.retryable = retryable
        self.details = details


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", code: str = "RESOURCE_NOT_FOUND"):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ValidationException(AppException):
    def __init__(
        self,
        message: str = "Validation failed",
        code: str = "VALIDATION_ERROR",
        details: Any = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            details=details,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access forbidden", code: str = "FORBIDDEN"):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized session", code: str = "UNAUTHORIZED"):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ProviderException(AppException):
    def __init__(
        self,
        message: str = "External provider unavailable",
        code: str = "PROVIDER_ERROR",
        retryable: bool = True,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_502_BAD_GATEWAY,
            retryable=retryable,
        )


class ConfigurationException(AppException):
    def __init__(self, message: str = "Configuration error", code: str = "CONFIG_ERROR"):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            retryable=False,
        )


def make_error_response(
    status_code: int,
    code: str,
    message: str,
    retryable: bool | None = None,
    request_id: str | None = None,
) -> JSONResponse:
    req_id = request_id or request_id_ctx.get()
    error_payload: dict[str, Any] = {
        "code": code,
        "message": message,
        "request_id": req_id,
    }
    if retryable is not None:
        error_payload["retryable"] = retryable

    return JSONResponse(
        status_code=status_code,
        content={"error": error_payload},
    )


async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    logger.warning(
        f"Handled application exception: {exc.code} - {exc.message}",
        extra={"extra_data": {"code": exc.code, "status": exc.status_code, "details": exc.details}},
    )
    return make_error_response(
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        retryable=exc.retryable,
    )


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    logger.info("Request validation failed", extra={"extra_data": {"errors": exc.errors()}})
    first_error = exc.errors()[0]["msg"] if exc.errors() else "Validation error"
    return make_error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        code="VALIDATION_ERROR",
        message=f"Invalid request data: {first_error}",
    )


async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = "NOT_FOUND" if exc.status_code == 404 else f"HTTP_{exc.status_code}"
    return make_error_response(
        status_code=exc.status_code,
        code=code,
        message=str(exc.detail),
    )


async def generic_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled exception: {exc}")
    return make_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected server error occurred. Please try again later.",
    )
