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


@pytest.mark.asyncio
async def test_search_endpoint(async_client: AsyncClient) -> None:
    """Verify search returns ranked product recommendations including relevant demo catalog items."""
    # 1. Create a shopping brief
    brief_res = await async_client.post(
        "/api/v1/briefs",
        json={"query": "Comfortable wireless noise-cancelling headphones under $150"},
    )
    assert brief_res.status_code == 201
    brief_id = brief_res.json()["id"]

    # 2. Call search with brief_id
    search_res = await async_client.post(
        "/api/v1/search",
        json={"brief_id": brief_id, "limit": 5},
    )
    assert search_res.status_code == 200
    data = search_res.json()
    assert data["brief_id"] == brief_id
    assert len(data["items"]) > 0

    first_item = data["items"][0]
    assert "product" in first_item
    assert "recommendation" in first_item
    assert first_item["recommendation"]["fit_score"] >= 0
    assert first_item["recommendation"]["rank"] == 1

    # Verify that relevant BuyNexa Demo Store headphones are considered alongside external results
    providers = [it["product"]["provider"] for it in data["items"]]
    assert "buynexa" in providers
    buynexa_item = next(it for it in data["items"] if it["product"]["provider"] == "buynexa")
    assert buynexa_item["product"]["retailer"] == "BuyNexa Store"


@pytest.mark.asyncio
async def test_search_endpoint_category_specific_laptop(async_client: AsyncClient) -> None:
    """Verify searching for laptops returns laptops and never forces demo store items."""
    # 1. Create a laptop shopping brief
    brief_res = await async_client.post(
        "/api/v1/briefs",
        json={"query": "High-performance laptop for programming and machine learning under $1500"},
    )
    assert brief_res.status_code == 201
    brief_id = brief_res.json()["id"]

    # 2. Call search
    search_res = await async_client.post(
        "/api/v1/search",
        json={"brief_id": brief_id, "limit": 3},
    )
    assert search_res.status_code == 200
    data = search_res.json()
    assert len(data["items"]) > 0

    # Ensure none of the returned items are headphones or demo store products
    for item in data["items"]:
        title_lower = item["product"]["title"].lower()
        assert "headphone" not in title_lower, f"Found headphones in laptop search: {title_lower}"
        assert item["product"]["provider"] != "buynexa"


@pytest.mark.asyncio
async def test_coherent_discovery_to_paypal_checkout_journey(async_client: AsyncClient) -> None:
    """Verify Journey B: Brief -> Relevant Demo Recommendation -> Add to Cart -> PayPal Order -> Capture."""
    # 1. User submits natural-language shopping brief
    brief_res = await async_client.post(
        "/api/v1/briefs",
        json={"query": "Noise-cancelling headphones for flights under $150"},
    )
    assert brief_res.status_code == 201
    brief_id = brief_res.json()["id"]

    # 2. Discovery returns recommendations including BuyNexa Store demo headphones
    search_res = await async_client.post(
        "/api/v1/search",
        json={"brief_id": brief_id, "limit": 5},
    )
    assert search_res.status_code == 200
    search_data = search_res.json()
    buynexa_items = [it for it in search_data["items"] if it["product"]["provider"] == "buynexa"]
    assert len(buynexa_items) >= 1
    selected_demo_prod = buynexa_items[0]["product"]
    sku = selected_demo_prod["provider_product_id"]

    # 3. Add to server-authoritative cart directly
    cart_add_res = await async_client.post(
        "/api/v1/cart",
        json={"sku": sku, "quantity": 1},
    )
    assert cart_add_res.status_code == 200
    cart_data = cart_add_res.json()
    assert cart_data["item_count"] == 1
    assert cart_data["total_minor"] == 12999

    # 4. Create PayPal Orders v2 order server-side
    create_order_res = await async_client.post(
        "/api/v1/payments/paypal/orders",
        json={"cart_id": "current_session_cart"},
    )
    assert create_order_res.status_code == 200
    order_info = create_order_res.json()
    local_order_id = order_info["local_order_id"]
    paypal_order_id = order_info["paypal_order_id"]

    # 5. Capture payment server-side (mocking successful PayPal approval & capture response)
    from unittest.mock import AsyncMock, MagicMock, patch

    mock_cap_res = MagicMock()
    mock_cap_res.status_code = 201
    mock_cap_res.json.return_value = {
        "id": paypal_order_id,
        "status": "COMPLETED",
        "purchase_units": [
            {
                "payments": {
                    "captures": [
                        {
                            "id": "CAP-COHERENT-TEST-999",
                            "status": "COMPLETED",
                            "amount": {"value": "129.99", "currency_code": "USD"},
                        }
                    ]
                }
            }
        ],
    }

    mock_http_instance = MagicMock()
    mock_http_instance.__aenter__.return_value = mock_http_instance
    mock_http_instance.__aexit__.return_value = None
    mock_http_instance.post = AsyncMock(return_value=mock_cap_res)

    with (
        patch(
            "app.api.v1.endpoints.payments._get_paypal_access_token",
            new_callable=AsyncMock,
            return_value="fake_access_token",
        ),
        patch("app.api.v1.endpoints.payments.httpx.AsyncClient", return_value=mock_http_instance),
    ):
        capture_res = await async_client.post(
            f"/api/v1/payments/paypal/orders/{local_order_id}/capture",
            json={"paypal_order_id": paypal_order_id},
        )
        assert capture_res.status_code == 200
        assert capture_res.json()["status"] == "COMPLETED"

    # 6. Retrieve verified order confirmation
    receipt_res = await async_client.get(f"/api/v1/orders/{local_order_id}")
    assert receipt_res.status_code == 200
    receipt_data = receipt_res.json()
    assert receipt_data["status"] == "COMPLETED"
    assert receipt_data["total_minor"] == 12999
    assert len(receipt_data["items"]) == 1
    assert receipt_data["items"][0]["sku"] == sku
