"""Pydantic schemas for shopping briefs, budget and intent extraction."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Budget(BaseModel):
    """Budget parameters extracted from shopping intent."""

    amount: float = Field(gt=0, description="Positive monetary budget amount")
    currency: str = Field(min_length=3, max_length=3, description="ISO 4217 3-letter currency code")
    mode: Literal["hard_limit", "target"] = Field(
        default="hard_limit",
        description="'hard_limit' for strict ceiling, 'target' for soft guidance",
    )

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, v: str) -> str:
        return v.upper()


class ShoppingBriefData(BaseModel):
    """Structured shopping criteria extracted from a query or edited by user."""

    category: str | None = Field(default=None, max_length=100)
    use_cases: list[str] = Field(default_factory=list)
    budget: Budget | None = None
    must_have: list[str] = Field(default_factory=list)
    preferences: list[str] = Field(default_factory=list)
    exclusions: list[str] = Field(default_factory=list)
    preferred_brands: list[str] = Field(default_factory=list)
    locale: str | None = Field(default=None, max_length=10)


class ShoppingBriefCreateRequest(BaseModel):
    """Request payload to extract and persist a new shopping brief."""

    query: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Shopper natural language goal, constraints, or preferences",
    )


class ShoppingBriefUpdateRequest(BaseModel):
    """Request payload for shopper review / correction of extracted brief."""

    category: str | None = None
    use_cases: list[str] | None = None
    budget: Budget | None = None
    must_have: list[str] | None = None
    preferences: list[str] | None = None
    exclusions: list[str] | None = None
    preferred_brands: list[str] | None = None
    locale: str | None = None


class ShoppingBriefResponse(BaseModel):
    """Complete public shopping brief response contract."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    original_query: str
    category: str | None = None
    use_cases: list[str] = Field(default_factory=list)
    budget: Budget | None = None
    must_have: list[str] = Field(default_factory=list)
    preferences: list[str] = Field(default_factory=list)
    exclusions: list[str] = Field(default_factory=list)
    preferred_brands: list[str] = Field(default_factory=list)
    locale: str | None = None
    created_at: datetime
    updated_at: datetime
