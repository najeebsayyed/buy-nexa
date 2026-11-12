"""Integration tests for catalog, cart, comparison, and payments endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_demo_catalog_returns_items(async_client: AsyncClient) -> None:
    """Verify demo catalog returns items with valid minor unit pricing."""
    response = await async_client.get("/api/v1/demo-catalog")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 4

    item = data["items"][0]
    assert "sku" in item
    assert "title" in item
    assert item["price_minor"] > 0
    assert item["currency"] == "USD"


@pytest.mark.asyncio
async def test_cart_lifecycle(async_client: AsyncClient) -> None:
    """Verify cart addition, retrieval, and server-authoritative totals."""
    # 1. Initially empty
    res_get = await async_client.get("/api/v1/cart")
    assert res_get.status_code == 200
    assert res_get.json()["item_count"] == 0

    # 2. Add an item
    res_add = await async_client.post(
        "/api/v1/cart",
        json={"sku": "BN-ANC-PRO", "quantity": 2},
    )
    assert res_add.status_code == 200
    cart_data = res_add.json()
    assert cart_data["item_count"] == 2
    assert cart_data["total_minor"] == 12999 * 2
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["sku"] == "BN-ANC-PRO"

    # 3. Update quantity
    res_patch = await async_client.patch(
        "/api/v1/cart",
        json={"sku": "BN-ANC-PRO", "quantity": 1},
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["item_count"] == 1
    assert res_patch.json()["total_minor"] == 12999

    # 4. Remove item
    res_del = await async_client.delete("/api/v1/cart/BN-ANC-PRO")
    assert res_del.status_code == 200
    assert res_del.json()["item_count"] == 0


@pytest.mark.asyncio
async def test_compare_endpoint(async_client: AsyncClient) -> None:
    """Verify comparison returns matrix rows and product snapshots."""
    response = await async_client.post(
        "/api/v1/compare",
        json={"product_ids": ["c3_sony_whch720n", "c3_anker_space_q45"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["products"]) == 2
    assert len(data["rows"]) >= 3
