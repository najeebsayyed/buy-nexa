"""Integration tests for database persistence and repository operations."""

from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import generate_session_token, hash_session_token
from app.features.briefs.repository import brief_repository


@pytest.mark.asyncio
async def test_session_lifecycle(db_session: AsyncSession):
    raw_token = generate_session_token()
    token_hash = hash_session_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    # 1. Create session
    session_obj = await brief_repository.create_session(db_session, token_hash, expires_at)
    assert session_obj.id is not None
    assert session_obj.token_hash == token_hash
    assert not session_obj.is_expired

    # 2. Lookup session
    retrieved = await brief_repository.get_session_by_token_hash(db_session, token_hash)
    assert retrieved is not None
    assert retrieved.id == session_obj.id

    # 3. Lookup non-existent
    assert await brief_repository.get_session_by_token_hash(db_session, "non_existent") is None


@pytest.mark.asyncio
async def test_brief_creation_and_update(db_session: AsyncSession):
    # Setup session
    token_hash = hash_session_token(generate_session_token())
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    session_obj = await brief_repository.create_session(db_session, token_hash, expires_at)

    # Create brief
    brief = await brief_repository.create_brief(
        db=db_session,
        session_id=session_obj.id,
        original_query="Find wireless earbuds under $50",
        normalized_json={
            "category": "earbuds",
            "budget": {"amount": 50.0, "currency": "USD", "mode": "hard_limit"},
        },
    )

    assert brief.id is not None
    assert brief.session_id == session_obj.id
    assert brief.normalized_json["category"] == "earbuds"

    # Lookup brief
    fetched = await brief_repository.get_brief_by_id(db_session, brief.id)
    assert fetched is not None
    assert fetched.id == brief.id

    # Update brief
    updated = await brief_repository.update_brief(
        db=db_session,
        brief=fetched,
        updated_json={
            "category": "premium earbuds",
            "budget": {"amount": 75.0, "currency": "USD", "mode": "target"},
        },
    )
    assert updated.normalized_json["category"] == "premium earbuds"
    assert updated.normalized_json["budget"]["amount"] == 75.0
