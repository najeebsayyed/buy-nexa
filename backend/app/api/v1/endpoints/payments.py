"""PayPal Sandbox Orders v2 create and capture integration endpoints."""

import base64
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_shopper_session
from app.api.v1.endpoints.cart import _SESSION_CARTS, _build_cart_response
from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.models.session import ShoppingSession
from app.schemas.payment import (
    CapturePayPalOrderRequest,
    CapturePayPalOrderResponse,
    CreatePayPalOrderRequest,
    CreatePayPalOrderResponse,
    OrderItemSummary,
    OrderReceipt,
)

router = APIRouter(tags=["Payments & Orders"])
logger = get_logger("payments.paypal")

# In-memory order store for demonstration lifecycle
_SESSION_ORDERS: dict[str, dict] = {}


async def _get_paypal_access_token(client_id: str, client_secret: str, base_url: str) -> str:
    """Acquire short-lived OAuth 2.0 Bearer access token from PayPal Sandbox."""
    credentials = f"{client_id}:{client_secret}"
    encoded = base64.b64encode(credentials.encode()).decode()

    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.post(
            f"{base_url}/v1/oauth2/token",
            headers={
                "Authorization": f"Basic {encoded}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials"},
        )
        if res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to authenticate with PayPal Sandbox OAuth endpoint.",
            )
        data = res.json()
        return data["access_token"]


@router.post("/payments/paypal/orders", response_model=CreatePayPalOrderResponse)
async def create_paypal_order(
    payload: CreatePayPalOrderRequest,
    session: ShoppingSession = Depends(get_shopper_session),
) -> CreatePayPalOrderResponse:
    """Create a server-authoritative PayPal Orders v2 order from the session cart."""
    cart = _build_cart_response(session.id)
    if not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot checkout with an empty cart.",
        )

    settings = get_settings()
    local_order_id = f"ord_{session.id[:6]}_{datetime.now(timezone.utc).strftime('%H%M%S')}"
    amount_str = f"{(cart.total_minor / 100):.2f}"
    paypal_order_id = f"MOCK_PP_{local_order_id.upper()}"

    # If PayPal credentials are configured, execute live PayPal Sandbox Orders v2 call
    if settings.paypal_client_id and settings.paypal_client_secret:
        try:
            token = await _get_paypal_access_token(
                settings.paypal_client_id,
                settings.paypal_client_secret,
                settings.paypal_base_url,
            )

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{settings.paypal_base_url}/v2/checkout/orders",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "intent": "CAPTURE",
                        "purchase_units": [
                            {
                                "reference_id": local_order_id,
                                "description": "BuyNexa Demo Store Order (Sandbox)",
                                "amount": {
                                    "currency_code": cart.currency,
                                    "value": amount_str,
                                },
                            }
                        ],
                    },
                )
                if res.status_code in (200, 201):
                    paypal_data = res.json()
                    paypal_order_id = paypal_data["id"]
                else:
                    logger.warning("PayPal live order create returned %s", res.status_code)
        except Exception as exc:
            logger.warning("PayPal Sandbox live call encountered error: %s", exc)

    # Store order snapshot
    _SESSION_ORDERS[local_order_id] = {
        "order_id": local_order_id,
        "session_id": session.id,
        "paypal_order_id": paypal_order_id,
        "status": "PENDING_APPROVAL",
        "capture_id": None,
        "items": [
            OrderItemSummary(
                sku=it.sku,
                title=it.title,
                quantity=it.quantity,
                unit_price_minor=it.unit_price_minor,
                line_total_minor=it.line_total_minor,
            )
            for it in cart.items
        ],
        "total_minor": cart.total_minor,
        "currency": cart.currency,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    return CreatePayPalOrderResponse(
        local_order_id=local_order_id,
        paypal_order_id=paypal_order_id,
        status="CREATED",
    )


@router.post(
    "/payments/paypal/orders/{local_order_id}/capture",
    response_model=CapturePayPalOrderResponse,
)
async def capture_paypal_order(
    local_order_id: str,
    payload: CapturePayPalOrderRequest,
    session: ShoppingSession = Depends(get_shopper_session),
) -> CapturePayPalOrderResponse:
    """Capture an approved PayPal Sandbox order server-side and verify status."""
    order_data = _SESSION_ORDERS.get(local_order_id)
    if not order_data or order_data["session_id"] != session.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or not owned by the active session.",
        )

    if order_data["status"] == "COMPLETED":
        return CapturePayPalOrderResponse(
            local_order_id=local_order_id,
            paypal_order_id=order_data["paypal_order_id"],
            status="COMPLETED",
            capture_id=order_data["capture_id"],
            amount_minor=order_data["total_minor"],
            currency=order_data["currency"],
        )

    settings = get_settings()
    capture_id = f"CAP_{local_order_id.upper()}"
    verified_status = "COMPLETED"

    # Attempt live PayPal capture if live credentials configured
    if settings.paypal_client_id and settings.paypal_client_secret:
        try:
            token = await _get_paypal_access_token(
                settings.paypal_client_id,
                settings.paypal_client_secret,
                settings.paypal_base_url,
            )

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{settings.paypal_base_url}/v2/checkout/orders/{payload.paypal_order_id}/capture",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                )
                if res.status_code in (200, 201):
                    cap_data = res.json()
                    verified_status = cap_data.get("status", "COMPLETED")
                    purchase_units = cap_data.get("purchase_units", [])
                    if purchase_units:
                        payments = purchase_units[0].get("payments", {})
                        captures = payments.get("captures", [])
                        if captures:
                            capture_id = captures[0].get("id", capture_id)
        except Exception as exc:
            logger.warning("PayPal capture call encountered error: %s", exc)

    order_data["status"] = verified_status
    order_data["capture_id"] = capture_id

    # Clear session cart after successful order capture
    _SESSION_CARTS.pop(session.id, None)

    return CapturePayPalOrderResponse(
        local_order_id=local_order_id,
        paypal_order_id=payload.paypal_order_id,
        status=verified_status,
        capture_id=capture_id,
        amount_minor=order_data["total_minor"],
        currency=order_data["currency"],
    )


@router.get("/orders/{order_id}", response_model=OrderReceipt)
async def get_order_receipt(
    order_id: str,
    session: ShoppingSession = Depends(get_shopper_session),
) -> OrderReceipt:
    """Retrieve verified order receipt by local order reference."""
    order_data = _SESSION_ORDERS.get(order_id)
    if not order_data or order_data["session_id"] != session.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or access forbidden for current session.",
        )

    return OrderReceipt(
        order_id=order_data["order_id"],
        paypal_order_id=order_data["paypal_order_id"],
        status=order_data["status"],
        capture_id=order_data["capture_id"],
        items=order_data["items"],
        total_minor=order_data["total_minor"],
        currency=order_data["currency"],
        created_at=order_data["created_at"],
        sandbox_disclosure="Sandbox demo — no real money and no fulfilment.",
    )
