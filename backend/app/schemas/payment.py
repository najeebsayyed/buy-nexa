"""Pydantic schemas for PayPal Sandbox order creation, capture, and receipts."""

from typing import Literal

from pydantic import BaseModel, Field

OrderStatus = Literal["PENDING_APPROVAL", "APPROVED", "COMPLETED", "CANCELLED", "FAILED"]


class CreatePayPalOrderRequest(BaseModel):
    """Request payload to initiate a PayPal Orders v2 order from a local cart."""

    cart_id: str


class CreatePayPalOrderResponse(BaseModel):
    """Response containing local reference and provider PayPal order ID."""

    local_order_id: str
    paypal_order_id: str
    status: str = "CREATED"


class CapturePayPalOrderRequest(BaseModel):
    """Request payload to capture an approved PayPal order."""

    paypal_order_id: str


class CapturePayPalOrderResponse(BaseModel):
    """Response returned upon server-side capture verification."""

    local_order_id: str
    paypal_order_id: str
    status: OrderStatus
    capture_id: str | None = None
    amount_minor: int
    currency: str = "USD"


class OrderItemSummary(BaseModel):
    """Summary of line items attached to a confirmed order."""

    sku: str
    title: str
    quantity: int
    unit_price_minor: int
    line_total_minor: int


class OrderReceipt(BaseModel):
    """Verified order receipt contract."""

    order_id: str
    paypal_order_id: str
    status: OrderStatus
    capture_id: str | None = None
    items: list[OrderItemSummary] = Field(default_factory=list)
    total_minor: int
    currency: str = "USD"
    created_at: str
    sandbox_disclosure: str = "Sandbox demo — no real money and no fulfilment."
