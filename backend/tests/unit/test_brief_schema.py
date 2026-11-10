"""Unit tests for shopping brief and budget Pydantic schemas."""

import pytest
from pydantic import ValidationError

from app.schemas.brief import (
    Budget,
    ShoppingBriefCreateRequest,
    ShoppingBriefData,
    ShoppingBriefUpdateRequest,
)


def test_budget_normalization_and_validation():
    b = Budget(amount=100.5, currency="usd", mode="hard_limit")
    assert b.currency == "USD"
    assert b.amount == 100.5
    assert b.mode == "hard_limit"

    with pytest.raises(ValidationError):
        Budget(amount=-10, currency="USD", mode="hard_limit")

    with pytest.raises(ValidationError):
        Budget(amount=50, currency="US", mode="hard_limit")  # min_length=3


def test_shopping_brief_data_defaults():
    data = ShoppingBriefData()
    assert data.category is None
    assert data.use_cases == []
    assert data.must_have == []
    assert data.preferences == []
    assert data.exclusions == []
    assert data.preferred_brands == []


def test_shopping_brief_create_request_bounds():
    with pytest.raises(ValidationError):
        ShoppingBriefCreateRequest(query="hi")  # min_length=3

    with pytest.raises(ValidationError):
        ShoppingBriefCreateRequest(query="a" * 2001)  # max_length=2000

    valid = ShoppingBriefCreateRequest(query="Find comfortable wireless headphones")
    assert valid.query == "Find comfortable wireless headphones"


def test_shopping_brief_update_request():
    update = ShoppingBriefUpdateRequest(
        category="headphones",
        budget=Budget(amount=120.0, currency="USD", mode="target"),
    )
    assert update.category == "headphones"
    assert update.budget is not None
    assert update.budget.mode == "target"
    assert update.use_cases is None
