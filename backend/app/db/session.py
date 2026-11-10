"""Database connection and session lifecycle management."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.core.logging import logger

engine: AsyncEngine | None = None
AsyncSessionFactory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """Returns or initializes the singleton async database engine."""
    global engine, AsyncSessionFactory
    if engine is None:
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            future=True,
            pool_pre_ping=True,
        )
        AsyncSessionFactory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Returns or initializes the async session factory."""
    if AsyncSessionFactory is None:
        get_engine()
    assert AsyncSessionFactory is not None
    return AsyncSessionFactory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI request-scoped dependency providing an AsyncSession."""
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def close_db_engine() -> None:
    """Closes the async database engine on application shutdown."""
    global engine, AsyncSessionFactory
    if engine is not None:
        logger.info("Disposing database connection pool...")
        await engine.dispose()
        engine = None
        AsyncSessionFactory = None
