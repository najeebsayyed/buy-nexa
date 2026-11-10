"""API tests for shopping brief creation, cookie session persistence, and updates."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_brief_provisions_session_cookie(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/briefs",
        json={"query": "Find comfortable wireless headphones under $150 for travel"},
    )
    assert response.status_code == 201
    data = response.json()

    assert "id" in data
    assert "session_id" in data
    assert data["category"] == "wireless headphones"
    assert data["budget"]["amount"] == 150.0
    assert data["budget"]["currency"] == "USD"
    assert data["budget"]["mode"] == "hard_limit"

    # Verify session cookie was set
    assert "set-cookie" in response.headers
    cookie_header = response.headers["set-cookie"]
    assert "buynexa_session=" in cookie_header
    assert "HttpOnly" in cookie_header
    assert "samesite=lax" in cookie_header.lower()
    assert "X-Request-ID" in response.headers


@pytest.mark.asyncio
async def test_create_brief_validation_error(async_client: AsyncClient):
    # Short query (< 3 chars)
    response = await async_client.post(
        "/api/v1/briefs",
        json={"query": "ab"},
    )
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "request_id" in data["error"]


@pytest.mark.asyncio
async def test_update_brief_session_ownership_enforcement(async_client: AsyncClient):
    # 1. Client 1 creates a brief and receives session cookie
    res1 = await async_client.post(
        "/api/v1/briefs",
        json={"query": "Find a 27-inch 4K monitor under $300"},
    )
    assert res1.status_code == 201
    brief1 = res1.json()
    brief_id = brief1["id"]

    # Extract session cookie from client 1
    cookie_value = res1.cookies.get("buynexa_session")
    assert cookie_value is not None

    # 2. Client 1 updates their own brief with cookie
    update_res = await async_client.patch(
        f"/api/v1/briefs/{brief_id}",
        json={
            "category": "gaming monitor",
            "budget": {"amount": 350.0, "currency": "USD", "mode": "target"},
        },
        cookies={"buynexa_session": cookie_value},
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["category"] == "gaming monitor"
    assert updated_data["budget"]["amount"] == 350.0

    # 3. Client 2 with a different session token attempts to update Client 1's brief
    forbidden_res = await async_client.patch(
        f"/api/v1/briefs/{brief_id}",
        json={"category": "hacked monitor"},
        cookies={"buynexa_session": "different_foreign_token_value_12345"},
    )
    assert forbidden_res.status_code == 403
    err = forbidden_res.json()
    assert err["error"]["code"] == "BRIEF_OWNERSHIP_MISMATCH"


@pytest.mark.asyncio
async def test_update_non_existent_brief(async_client: AsyncClient):
    response = await async_client.patch(
        "/api/v1/briefs/non_existent_id",
        json={"category": "headphones"},
    )
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "BRIEF_NOT_FOUND"
