"""Demo Catalog endpoints for the BuyNexa Sandbox Store."""

from fastapi import APIRouter

from app.schemas.cart import DemoCatalogItem

router = APIRouter(prefix="/demo-catalog", tags=["Demo Catalog"])

DEMO_CATALOG_ITEMS: list[DemoCatalogItem] = [
    DemoCatalogItem(
        sku="BN-ANC-PRO",
        title="BuyNexa Studio Pro ANC Wireless Headphones",
        description="Flagship active noise cancelling headphones with custom 40mm drivers, 40-hour battery life, and USB-C audio.",
        price_minor=12999,
        currency="USD",
        image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        category="Audio",
        features=[
            "Active Noise Cancellation",
            "40h Battery",
            "Multipoint Bluetooth 5.3",
            "USB-C Fast Charging",
        ],
        in_stock=True,
    ),
    DemoCatalogItem(
        sku="BN-TRAVEL-BUDS",
        title="BuyNexa TravelPods ANC Earbuds",
        description="Ultra-compact wireless earbuds with adaptive transparency, IPX5 water resistance, and wireless charging case.",
        price_minor=7999,
        currency="USD",
        image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
        category="Audio",
        features=[
            "Adaptive Transparency",
            "IPX5 Water Resistant",
            "Wireless Charging Case",
            "Voice Clarity Mic",
        ],
        in_stock=True,
    ),
    DemoCatalogItem(
        sku="BN-CALL-HEADSET",
        title="BuyNexa ClearVoice Wireless Office Headset",
        description="Dual-mic beamforming headset engineered for all-day crystal-clear video conferences and ergonomic comfort.",
        price_minor=5999,
        currency="USD",
        image_url="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
        category="Productivity",
        features=[
            "AI Background Noise Removal",
            "30h Talk Time",
            "Flip-to-Mute Boom",
            "Memory Foam Cushions",
        ],
        in_stock=True,
    ),
    DemoCatalogItem(
        sku="BN-DESK-PAD",
        title="BuyNexa Ergonomic Wool Felt Desk Mat",
        description="Premium anti-slip organic wool felt desk mat providing tactile comfort for keyboard, mouse, and desktop accessories.",
        price_minor=2999,
        currency="USD",
        image_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
        category="Accessories",
        features=[
            "High-density Natural Wool",
            "Anti-slip Base",
            "Water-repellent Coating",
            "90cm x 40cm Surface",
        ],
        in_stock=True,
    ),
]


@router.get("", response_model=dict[str, list[DemoCatalogItem]])
async def get_demo_catalog() -> dict[str, list[DemoCatalogItem]]:
    """Retrieve active demo store catalog items with server-authoritative pricing."""
    return {"items": DEMO_CATALOG_ITEMS}
