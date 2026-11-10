"""Repository layer for ShoppingSession and ShoppingBrief persistence."""

from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.brief import ShoppingBrief
from app.db.models.session import ShoppingSession


class BriefRepository:
    """Handles database queries and mutations for sessions and shopping briefs."""

    async def get_session_by_token_hash(
        self, db: AsyncSession, token_hash: str
    ) -> ShoppingSession | None:
        """Finds active session by its SHA-256 token digest."""
        stmt = select(ShoppingSession).where(ShoppingSession.token_hash == token_hash)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_session(
        self, db: AsyncSession, token_hash: str, expires_at: datetime
    ) -> ShoppingSession:
        """Creates and commits a new anonymous shopper session."""
        session_obj = ShoppingSession(
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(session_obj)
        await db.commit()
        await db.refresh(session_obj)
        return session_obj

    async def create_brief(
        self,
        db: AsyncSession,
        session_id: str,
        original_query: str,
        normalized_json: dict[str, Any],
    ) -> ShoppingBrief:
        """Persists a newly extracted shopping brief bound to the session."""
        brief = ShoppingBrief(
            session_id=session_id,
            original_query=original_query,
            normalized_json=normalized_json,
        )
        db.add(brief)
        await db.commit()
        await db.refresh(brief)
        return brief

    async def get_brief_by_id(self, db: AsyncSession, brief_id: str) -> ShoppingBrief | None:
        """Retrieves a shopping brief by its primary key ID."""
        stmt = select(ShoppingBrief).where(ShoppingBrief.id == brief_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_brief(
        self,
        db: AsyncSession,
        brief: ShoppingBrief,
        updated_json: dict[str, Any],
    ) -> ShoppingBrief:
        """Updates the normalized criteria of an existing shopping brief."""
        brief.normalized_json = updated_json
        await db.commit()
        await db.refresh(brief)
        return brief


brief_repository = BriefRepository()
