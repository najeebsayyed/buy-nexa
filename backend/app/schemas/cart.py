"""Pydantic schemas for the BuyNexa Demo Store and server-priced cart."""

from pydantic import BaseModel, Field


class DemoCatalogItem(BaseModel):
    """Product item in the controlled BuyNexa Sandbox Store catalog."""

    sku: str
    title: str
    description: str
    price_minor: int = Field(
        gt=0, description="Price in integer minor units (e.g. 12999 = $129.99)"
    )
    currency: str = "USD"
    image_url: str
    category: str
    features: list[str] = Field(default_factory=list)
    in_stock: bool = True


class CartItem(BaseModel):
    """Line item in the server-authoritative cart."""

    sku: str
    title: str
    description: str
    quantity: int = Field(ge=1, le=50)
    unit_price_minor: int = Field(ge=0)
    line_total_minor: int = Field(ge=0)
    currency: str = "USD"
    image_url: str


class Cart(BaseModel):
    """Server-authoritative cart model."""

    id: str
    session_id: str
    items: list[CartItem] = Field(default_factory=list)
    subtotal_minor: int = Field(default=0, ge=0)
    total_minor: int = Field(default=0, ge=0)
    currency: str = "USD"
    item_count: int = Field(default=0, ge=0)
    updated_at: str


class AddToCartRequest(BaseModel):
    """Request to add or increment a SKU in the cart."""

    sku: str
    quantity: int = Field(default=1, ge=1, le=50)


class UpdateCartItemRequest(BaseModel):
    """Request to update the quantity of a SKU in the cart."""

    sku: str
    quantity: int = Field(ge=0, le=50)
