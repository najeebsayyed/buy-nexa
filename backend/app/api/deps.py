"""FastAPI shared dependency injections for database and anonymous sessions."""

from datetime import datetime, timedelta, timezone

from fastapi import Cookie, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.core.security import generate_session_token, hash_session_token
from app.db.models.session import ShoppingSession
from app.db.session import get_db_session
from app.features.briefs.repository import brief_repository


async def get_shopper_session(
    response: Response,
    db: AsyncSession = Depends(get_db_session),
    session_token: str | None = Cookie(alias=settings.SESSION_COOKIE_NAME, default=None),
) -> ShoppingSession:
    """Retrieves existing active anonymous shopper session or provisions a new one."""
    now = datetime.now(timezone.utc)

    if session_token:
        token_hash = hash_session_token(session_token)
        existing_session = await brief_repository.get_session_by_token_hash(db, token_hash)
        if existing_session and not existing_session.is_expired:
            return existing_session
        logger.info("Session token expired or unrecognized; creating fresh session.")

    # Generate new cryptographically random session token
    raw_token = generate_session_token()
    token_hash = hash_session_token(raw_token)
    expires_at = now + timedelta(days=settings.SESSION_MAX_AGE_DAYS)

    new_session = await brief_repository.create_session(
        db=db,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    # Attach HttpOnly secure session cookie to response
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=raw_token,
        max_age=settings.SESSION_MAX_AGE_DAYS * 86400,
        httponly=True,
        samesite="lax",
        secure=settings.SESSION_COOKIE_SECURE,
        path="/",
    )

    logger.info(
        "Provisioned new anonymous session",
        extra={"extra_data": {"session_id": new_session.id}},
    )
    return new_session
# Alias for dependency consistency
get_db = get_db_session
