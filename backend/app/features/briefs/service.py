"""Feature service implementing business logic for AI shopping briefs."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenException, NotFoundException
from app.core.logging import logger
from app.db.models.brief import ShoppingBrief
from app.db.models.session import ShoppingSession
from app.features.briefs.repository import BriefRepository, brief_repository
from app.integrations.openai.client import OpenAIAdapter, openai_adapter
from app.schemas.brief import (
    Budget,
    ShoppingBriefCreateRequest,
    ShoppingBriefResponse,
    ShoppingBriefUpdateRequest,
)


class BriefService:
    """Orchestrates AI brief extraction and persistence workflows."""

    def __init__(
        self,
        repo: BriefRepository | None = None,
        ai: OpenAIAdapter | None = None,
    ):
        self.repo = repo or brief_repository
        self.ai = ai or openai_adapter

    def _to_response_dto(self, brief: ShoppingBrief) -> ShoppingBriefResponse:
        """Converts an ORM ShoppingBrief model into the API response schema."""
        data = brief.normalized_json or {}
        budget_data = data.get("budget")
        budget_obj = Budget(**budget_data) if budget_data else None

        return ShoppingBriefResponse(
            id=brief.id,
            session_id=brief.session_id,
            original_query=brief.original_query,
            category=data.get("category"),
            use_cases=data.get("use_cases", []),
            budget=budget_obj,
            must_have=data.get("must_have", []),
            preferences=data.get("preferences", []),
            exclusions=data.get("exclusions", []),
            preferred_brands=data.get("preferred_brands", []),
            locale=data.get("locale"),
            created_at=brief.created_at,
            updated_at=brief.updated_at,
        )

    async def create_brief(
        self,
        payload: ShoppingBriefCreateRequest,
        shopper_session: ShoppingSession,
        db: AsyncSession,
    ) -> ShoppingBriefResponse:
        """Extracts structured intent from user query and persists the brief."""
        logger.info(
            "Extracting shopping brief for session",
            extra={
                "extra_data": {
                    "session_id": shopper_session.id,
                    "query_len": len(payload.query),
                }
            },
        )

        # 1. Extract structured criteria using OpenAI
        extracted_data = await self.ai.extract_shopping_brief(payload.query)

        # 2. Persist in database
        brief_record = await self.repo.create_brief(
            db=db,
            session_id=shopper_session.id,
            original_query=payload.query,
            normalized_json=extracted_data.model_dump(),
        )

        return self._to_response_dto(brief_record)

    async def update_brief(
        self,
        brief_id: str,
        payload: ShoppingBriefUpdateRequest,
        shopper_session: ShoppingSession,
        db: AsyncSession,
    ) -> ShoppingBriefResponse:
        """Updates user-confirmed brief criteria after validating session ownership."""
        brief_record = await self.repo.get_brief_by_id(db, brief_id)
        if not brief_record:
            raise NotFoundException(
                message=f"Shopping brief with id '{brief_id}' was not found.",
                code="BRIEF_NOT_FOUND",
            )

        # Enforce strict session ownership
        if brief_record.session_id != shopper_session.id:
            logger.warning(
                "Unauthorized brief update attempt across sessions",
                extra={"extra_data": {"brief_id": brief_id, "session_id": shopper_session.id}},
            )
            raise ForbiddenException(
                message="You do not have permission to modify this shopping brief.",
                code="BRIEF_OWNERSHIP_MISMATCH",
            )

        # Merge updates into existing normalized JSON without overwriting with None
        current_data = dict(brief_record.normalized_json or {})
        update_dict = payload.model_dump(exclude_unset=True)

        for key, value in update_dict.items():
            if value is not None:
                current_data[key] = value

        updated_record = await self.repo.update_brief(db, brief_record, current_data)
        return self._to_response_dto(updated_record)


brief_service = BriefService()
