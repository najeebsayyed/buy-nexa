"""Shared pytest fixtures for unit, integration, and API tests."""

from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.api.deps import get_db_session
from app.db.base import Base
from app.features.briefs.service import brief_service
from app.integrations.openai.client import OpenAIAdapter
from app.main import app
from app.schemas.brief import Budget, ShoppingBriefData

# In-memory async SQLite engine for isolated, fast, and repeatable testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Provisions a fresh in-memory SQLite database for test execution."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        future=True,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def db_session(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Provides an isolated database session rolled back after every test."""
    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )

    async with session_factory() as session:
        yield session


class MockOpenAIAdapter(OpenAIAdapter):
    """Mock OpenAI adapter returning deterministic structured shopping briefs for testing."""

    def __init__(
        self,
        canned_data: ShoppingBriefData | None = None,
        should_fail: bool = False,
        failure_exc: Exception | None = None,
    ):
        super().__init__()
        self.canned_data = canned_data or ShoppingBriefData(
            category="wireless headphones",
            use_cases=["travel", "office calls"],
            budget=Budget(amount=150.0, currency="USD", mode="hard_limit"),
            must_have=["wireless", "noise cancellation"],
            preferences=["comfortable"],
            exclusions=["bulky models"],
            preferred_brands=[],
            locale="US",
        )
        self.should_fail = should_fail
        self.failure_exc = failure_exc

    async def extract_shopping_brief(self, query: str) -> ShoppingBriefData:
        if self.should_fail and self.failure_exc:
            raise self.failure_exc

        q_lower = query.lower()
        if "laptop" in q_lower:
            return ShoppingBriefData(
                category="laptop",
                use_cases=["programming", "development"],
                budget=Budget(amount=1500.0, currency="USD", mode="hard_limit"),
                must_have=["16GB RAM", "SSD"],
                preferences=["lightweight"],
                exclusions=[],
                preferred_brands=[],
                locale="US",
            )
        if "monitor" in q_lower:
            return ShoppingBriefData(
                category="monitor",
                use_cases=["office", "coding"],
                budget=Budget(amount=500.0, currency="USD", mode="hard_limit"),
                must_have=["4K", "USB-C"],
                preferences=["IPS"],
                exclusions=[],
                preferred_brands=[],
                locale="US",
            )
        if "shoe" in q_lower:
            return ShoppingBriefData(
                category="running shoes",
                use_cases=["marathon", "running"],
                budget=Budget(amount=150.0, currency="USD", mode="hard_limit"),
                must_have=["cushioning"],
                preferences=["breathable"],
                exclusions=[],
                preferred_brands=[],
                locale="US",
            )
        return self.canned_data


@pytest.fixture
def mock_openai() -> MockOpenAIAdapter:
    return MockOpenAIAdapter()


@pytest.fixture
async def async_client(
    test_engine: AsyncEngine,
    mock_openai: MockOpenAIAdapter,
) -> AsyncGenerator[AsyncClient, None]:
    """Provides an AsyncClient bound to the FastAPI application with test dependencies."""
    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )

    async def override_get_db_session() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db_session] = override_get_db_session
    original_ai = brief_service.ai
    brief_service.ai = mock_openai

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    brief_service.ai = original_ai
