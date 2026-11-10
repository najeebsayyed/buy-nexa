"""Health and readiness monitoring endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.db.session import get_db_session

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live", summary="Process liveness check")
async def check_liveness() -> dict[str, str]:
    """Lightweight check verifying application process is alive."""
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready", summary="Database readiness check")
async def check_readiness(db: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    """Verifies database connectivity by executing a lightweight query."""
    try:
        await db.execute(text("SELECT 1"))
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "ok",
                "database": "connected",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
    except Exception as exc:
        logger.error(f"Readiness check failed on database ping: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
