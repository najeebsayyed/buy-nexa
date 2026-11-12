"""Server-authoritative cart endpoints enforcing integer minor unit pricing."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_shopper_session
from app.api.v1.endpoints.catalog import DEMO_CATALOG_ITEMS
from app.db.models.session import ShoppingSession
from app.schemas.cart import AddToCartRequest, Cart, CartItem, UpdateCartItemRequest

router = APIRouter(prefix="/cart", tags=["Cart"])

# Session-scoped cart store for demonstration
# Keyed by session.id
_SESSION_CARTS: dict[str, dict[str, int]] = {}  # session_id -> { sku: quantity }


def _build_cart_response(session_id: str) -> Cart:
    items_map = _SESSION_CARTS.get(session_id, {})
    catalog_lookup = {item.sku: item for item in DEMO_CATALOG_ITEMS}

    cart_items: list[CartItem] = []
    subtotal = 0

    for sku, qty in items_map.items():
        if sku in catalog_lookup and qty > 0:
            catalog_item = catalog_lookup[sku]
            line_total = qty * catalog_item.price_minor
            subtotal += line_total
            cart_items.append(
                CartItem(
                    sku=sku,
                    title=catalog_item.title,
                    description=catalog_item.description,
                    quantity=qty,
                    unit_price_minor=catalog_item.price_minor,
                    line_total_minor=line_total,
                    currency=catalog_item.currency,
                    image_url=catalog_item.image_url,
                )
            )

    count = sum(item.quantity for item in cart_items)
    return Cart(
        id=f"cart_{session_id[:8]}",
        session_id=session_id,
        items=cart_items,
        subtotal_minor=subtotal,
        total_minor=subtotal,
        currency="USD",
        item_count=count,
        updated_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("", response_model=Cart)
async def get_cart(
    session: ShoppingSession = Depends(get_shopper_session),
) -> Cart:
    """Retrieve current session cart with server-calculated totals."""
    return _build_cart_response(session.id)


@router.post("", response_model=Cart)
async def add_to_cart(
    payload: AddToCartRequest,
    session: ShoppingSession = Depends(get_shopper_session),
) -> Cart:
    """Add a demo catalog item to the session cart."""
    catalog_lookup = {item.sku: item for item in DEMO_CATALOG_ITEMS}
    if payload.sku not in catalog_lookup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SKU '{payload.sku}' is not an active catalog item.",
        )

    if session.id not in _SESSION_CARTS:
        _SESSION_CARTS[session.id] = {}

    current_qty = _SESSION_CARTS[session.id].get(payload.sku, 0)
    _SESSION_CARTS[session.id][payload.sku] = current_qty + payload.quantity

    return _build_cart_response(session.id)


@router.patch("", response_model=Cart)
async def update_cart_item(
    payload: UpdateCartItemRequest,
    session: ShoppingSession = Depends(get_shopper_session),
) -> Cart:
    """Update quantity of an item in the session cart."""
    if session.id not in _SESSION_CARTS:
        _SESSION_CARTS[session.id] = {}

    if payload.quantity <= 0:
        _SESSION_CARTS[session.id].pop(payload.sku, None)
    else:
        _SESSION_CARTS[session.id][payload.sku] = payload.quantity

    return _build_cart_response(session.id)


@router.delete("/{sku}", response_model=Cart)
async def remove_cart_item(
    sku: str,
    session: ShoppingSession = Depends(get_shopper_session),
) -> Cart:
    """Remove a SKU from the session cart."""
    if session.id in _SESSION_CARTS:
        _SESSION_CARTS[session.id].pop(sku, None)

    return _build_cart_response(session.id)
