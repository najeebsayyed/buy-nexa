"""Pydantic schemas for product discovery, ranking, and comparison."""

from typing import Any

from pydantic import BaseModel, Field


class ProductMoney(BaseModel):
    """Provider monetary representation for display purposes only."""

    amount: str
    currency: str = "USD"


class NormalizedProduct(BaseModel):
    """Normalized third-party merchant product record."""

    id: str
    provider: str = "channel3"
    provider_product_id: str
    title: str
    description: str | None = None
    image_url: str | None = None
    price: ProductMoney | None = None
    retailer: str | None = None
    product_url: str | None = None
    availability: str | None = "in stock"
    attributes: dict[str, Any] = Field(default_factory=dict)
    fetched_at: str


class CriterionEvidence(BaseModel):
    """Concrete evidence explaining why a product satisfies a shopping criterion."""

    criterion: str
    evidence: str


class ProductRecommendation(BaseModel):
    """Deterministic recommendation evaluation for a product against a brief."""

    product_id: str
    rank: int
    fit_score: int = Field(ge=0, le=100)
    matched_criteria: list[CriterionEvidence] = Field(default_factory=list)
    caveats: list[str] = Field(default_factory=list)
    missing_attributes: list[str] = Field(default_factory=list)
    explanation: str


class RankedProductItem(BaseModel):
    """Pairing of a normalized merchant product and its recommendation evidence."""

    product: NormalizedProduct
    recommendation: ProductRecommendation


class ProductSearchRequest(BaseModel):
    """Search request payload referencing an existing shopping brief."""

    brief_id: str
    limit: int = Field(default=5, ge=1, le=15)


class ProductSearchResponse(BaseModel):
    """Ranked product recommendations response contract."""

    brief_id: str
    query: str
    total_found: int
    items: list[RankedProductItem] = Field(default_factory=list)
    generated_at: str


class ComparisonRequest(BaseModel):
    """Request payload to compare selected products."""

    product_ids: list[str] = Field(..., min_length=1, max_length=3)


class ComparisonRow(BaseModel):
    """Row in the side-by-side comparison matrix."""

    label: str
    category: str
    values: dict[str, str | None]


class ComparisonResponse(BaseModel):
    """Product comparison response contract."""

    product_ids: list[str]
    products: list[NormalizedProduct]
    recommendations: dict[str, ProductRecommendation] = Field(default_factory=dict)
    rows: list[ComparisonRow] = Field(default_factory=list)
