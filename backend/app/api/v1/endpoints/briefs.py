"""Shopping brief creation, retrieval, and update endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_shopper_session
from app.db.models.session import ShoppingSession
from app.db.session import get_db_session
from app.features.briefs.service import BriefService, brief_service
from app.schemas.brief import (
    ShoppingBriefCreateRequest,
    ShoppingBriefResponse,
    ShoppingBriefUpdateRequest,
)

router = APIRouter(prefix="/briefs", tags=["briefs"])


@router.post(
    "",
    response_model=ShoppingBriefResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Extract and create a structured shopping brief",
)
async def create_shopping_brief(
    payload: ShoppingBriefCreateRequest,
    shopper_session: ShoppingSession = Depends(get_shopper_session),
    db: AsyncSession = Depends(get_db_session),
    service: BriefService = Depends(lambda: brief_service),
) -> ShoppingBriefResponse:
    """Extracts shopper constraints via OpenAI and saves the shopping brief."""
    return await service.create_brief(
        payload=payload,
        shopper_session=shopper_session,
        db=db,
    )


@router.get(
    "/{brief_id}",
    response_model=ShoppingBriefResponse,
    summary="Retrieve an existing shopping brief by ID",
)
async def get_shopping_brief(
    brief_id: str,
    shopper_session: ShoppingSession = Depends(get_shopper_session),
    db: AsyncSession = Depends(get_db_session),
    service: BriefService = Depends(lambda: brief_service),
) -> ShoppingBriefResponse:
    """Retrieves an existing shopping brief after validating session ownership."""
    return await service.get_brief(
        brief_id=brief_id,
        shopper_session=shopper_session,
        db=db,
    )


@router.patch(
    "/{brief_id}",
    response_model=ShoppingBriefResponse,
    summary="Update an existing shopping brief",
)
async def update_shopping_brief(
    brief_id: str,
    payload: ShoppingBriefUpdateRequest,
    shopper_session: ShoppingSession = Depends(get_shopper_session),
    db: AsyncSession = Depends(get_db_session),
    service: BriefService = Depends(lambda: brief_service),
) -> ShoppingBriefResponse:
    """Updates user-confirmed brief fields after validating session ownership."""
    return await service.update_brief(
        brief_id=brief_id,
        payload=payload,
        shopper_session=shopper_session,
        db=db,
    )
