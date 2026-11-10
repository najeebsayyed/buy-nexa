"""ShoppingBrief model for persisted user intent and normalized brief data."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.session import ShoppingSession


class ShoppingBrief(Base):
    __tablename__ = "shopping_briefs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("shopping_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_query: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    # Uses JSONB on PostgreSQL and JSON on SQLite/others
    normalized_json: Mapped[dict[str, Any]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    session: Mapped["ShoppingSession"] = relationship(
        "ShoppingSession",
        back_populates="briefs",
    )

    __table_args__ = (Index("ix_shopping_briefs_created_at", "created_at"),)
