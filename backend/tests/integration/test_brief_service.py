"""Integration tests for BriefService intent orchestration and session security."""

from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenException, NotFoundException
from app.core.security import generate_session_token, hash_session_token
from app.features.briefs.repository import brief_repository
from app.features.briefs.service import BriefService
from app.schemas.brief import (
    Budget,
    ShoppingBriefCreateRequest,
    ShoppingBriefData,
    ShoppingBriefUpdateRequest,
)
from tests.conftest import MockOpenAIAdapter


@pytest.mark.asyncio
async def test_brief_service_create_and_ownership(db_session: AsyncSession):
    # Setup two different shopper sessions
    now = datetime.now(timezone.utc)
    s1 = await brief_repository.create_session(
        db_session, hash_session_token(generate_session_token()), now + timedelta(days=30)
    )
    s2 = await brief_repository.create_session(
        db_session, hash_session_token(generate_session_token()), now + timedelta(days=30)
    )

    mock_ai = MockOpenAIAdapter(
        canned_data=ShoppingBriefData(
            category="mechanical keyboard",
            use_cases=["programming"],
            budget=Budget(amount=120.0, currency="USD", mode="hard_limit"),
            must_have=["tactile switches"],
            preferences=["wireless"],
            exclusions=["RGB lighting"],
        )
    )
    service = BriefService(repo=brief_repository, ai=mock_ai)

    # 1. Create brief under session 1
    req = ShoppingBriefCreateRequest(
        query="Looking for a quiet mechanical keyboard for coding under $120"
    )
    created = await service.create_brief(payload=req, shopper_session=s1, db=db_session)

    assert created.id is not None
    assert created.session_id == s1.id
    assert created.category == "mechanical keyboard"
    assert created.budget.amount == 120.0
    assert created.must_have == ["tactile switches"]

    # 2. Update brief under session 1 (should succeed)
    update_req = ShoppingBriefUpdateRequest(
        category="custom mechanical keyboard",
        budget=Budget(amount=150.0, currency="USD", mode="target"),
    )
    updated = await service.update_brief(
        brief_id=created.id,
        payload=update_req,
        shopper_session=s1,
        db=db_session,
    )
    assert updated.category == "custom mechanical keyboard"
    assert updated.budget.amount == 150.0

    # 3. Session 2 attempts to modify Session 1's brief (must fail with ForbiddenException)
    with pytest.raises(ForbiddenException) as exc_info:
        await service.update_brief(
            brief_id=created.id,
            payload=update_req,
            shopper_session=s2,
            db=db_session,
        )
    assert exc_info.value.code == "BRIEF_OWNERSHIP_MISMATCH"

    # 4. Attempt to update non-existent brief
    with pytest.raises(NotFoundException) as exc_info:
        await service.update_brief(
            brief_id="non_existent_uuid",
            payload=update_req,
            shopper_session=s1,
            db=db_session,
        )
    assert exc_info.value.code == "BRIEF_NOT_FOUND"
