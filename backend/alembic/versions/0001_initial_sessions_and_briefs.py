"""Initial migration for ShoppingSession and ShoppingBrief

Revision ID: 0001_initial
Revises:
Create Date: 2026-11-10 21:45:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create shopping_sessions
    op.create_table(
        "shopping_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash", name="uq_shopping_sessions_token_hash"),
    )
    op.create_index(
        "ix_shopping_sessions_token_hash",
        "shopping_sessions",
        ["token_hash"],
        unique=True,
    )

    # 2. Create shopping_briefs
    op.create_table(
        "shopping_briefs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("original_query", sa.Text(), nullable=False),
        sa.Column(
            "normalized_json",
            sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["shopping_sessions.id"],
            name="fk_shopping_briefs_session_id_shopping_sessions",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_shopping_briefs_session_id",
        "shopping_briefs",
        ["session_id"],
        unique=False,
    )
    op.create_index(
        "ix_shopping_briefs_created_at",
        "shopping_briefs",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_shopping_briefs_created_at", table_name="shopping_briefs")
    op.drop_index("ix_shopping_briefs_session_id", table_name="shopping_briefs")
    op.drop_table("shopping_briefs")
    op.drop_index("ix_shopping_sessions_token_hash", table_name="shopping_sessions")
    op.drop_table("shopping_sessions")
