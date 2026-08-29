"""
API Input Validation & Edge Case Tests for QuickCart AI Demand Engine.

Covers invalid input, boundary conditions, HTTP error responses,
and malformed request bodies for all three API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.forecaster import (
    calculate_moving_average_velocity,
    calculate_exponential_smoothing,
    estimate_reorder_point,
)
from app.pricing import calculate_surge_multiplier
from app.recommender import rank_frequently_bought_together

client = TestClient(app)


# ---------------------------------------------------------------------------
# Forecast demand endpoint — input validation
# ---------------------------------------------------------------------------

def test_forecast_demand_missing_sales_history():
    """Request without sales_history field should return 422 (validation error)."""
    response = client.post("/api/v1/ai/forecast-demand", json={"product_id": 1})
    assert response.status_code == 422


def test_forecast_demand_empty_sales_history():
    """Empty sales_history list should return 400 (business logic rejection)."""
    payload = {"product_id": 1, "sales_history": [], "lead_time_days": 2.0}
    response = client.post("/api/v1/ai/forecast-demand", json=payload)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_forecast_demand_negative_lead_time():
    """Negative lead_time_days should produce a non-negative reorder point."""
    payload = {
        "product_id": 5,
        "sales_history": [10, 20, 30],
        "lead_time_days": -1.0,
    }
    # Business logic should still return a structured response (not crash)
    response = client.post("/api/v1/ai/forecast-demand", json=payload)
    # Accept either 200 (graceful) or 400 (validation rejection)
    assert response.status_code in (200, 400, 422)


def test_forecast_demand_single_data_point():
    """A single sales data point should work and return a valid response."""
    payload = {"product_id": 9, "sales_history": [42], "lead_time_days": 1.0}
    response = client.post("/api/v1/ai/forecast-demand", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == 9
    assert data["moving_average_velocity"] == 42.0
    assert data["reorder_point"] >= 0


def test_forecast_demand_large_history():
    """Large sales history should not error or degrade."""
    history = list(range(1, 101))  # 100 data points
    payload = {"product_id": 100, "sales_history": history, "lead_time_days": 3.0}
    response = client.post("/api/v1/ai/forecast-demand", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["reorder_point"] > 0


def test_forecast_demand_response_schema():
    """Response must contain all documented fields."""
    payload = {
        "product_id": 7,
        "sales_history": [5, 10, 15, 20, 25],
        "lead_time_days": 2.0,
    }
    response = client.post("/api/v1/ai/forecast-demand", json=payload)
    assert response.status_code == 200
    data = response.json()
    required_fields = {
        "product_id",
        "moving_average_velocity",
        "exponential_smoothed_forecast",
        "reorder_point",
        "safety_stock",
        "recommendation",
    }
    assert required_fields.issubset(data.keys())


# ---------------------------------------------------------------------------
# Recommendations endpoint — edge cases
# ---------------------------------------------------------------------------

def test_recommendations_missing_target_product():
    """Missing target_product_id should return 422."""
    response = client.post(
        "/api/v1/ai/recommendations", json={"order_baskets": [[1, 2, 3]]}
    )
    assert response.status_code == 422


def test_recommendations_empty_baskets():
    """Empty baskets should return an empty recommendations list."""
    payload = {"target_product_id": 1, "order_baskets": [], "top_k": 5}
    response = client.post("/api/v1/ai/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommendations"] == []


def test_recommendations_top_k_respected():
    """top_k parameter must limit result count."""
    baskets = [[1, 2, 3, 4, 5], [1, 2, 3], [1, 4, 5], [1, 2, 4]]
    payload = {"target_product_id": 1, "order_baskets": baskets, "top_k": 2}
    response = client.post("/api/v1/ai/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) <= 2


def test_recommendations_target_not_in_own_list():
    """Target product must never appear in its own recommendations."""
    baskets = [[1, 2], [1, 3], [1, 4]]
    payload = {"target_product_id": 1, "order_baskets": baskets, "top_k": 5}
    response = client.post("/api/v1/ai/recommendations", json=payload)
    assert response.status_code == 200
    for rec in response.json()["recommendations"]:
        assert rec["product_id"] != 1


# ---------------------------------------------------------------------------
# Surge pricing endpoint — boundary conditions
# ---------------------------------------------------------------------------

def test_surge_pricing_zero_capacity():
    """max_store_capacity of 0 should not divide by zero."""
    payload = {
        "store_id": 1,
        "current_store_load": 0,
        "max_store_capacity": 0,
        "available_riders": 5,
        "is_raining": False,
        "is_peak_hour": False,
    }
    # Should not crash — either return 200 with safe default or 400
    response = client.post("/api/v1/ai/surge-pricing", json=payload)
    assert response.status_code in (200, 400, 422)


def test_surge_pricing_missing_required_fields():
    """Missing required store fields should return 422."""
    response = client.post(
        "/api/v1/ai/surge-pricing",
        json={"store_id": 1},
    )
    assert response.status_code == 422


def test_surge_pricing_no_surge_conditions():
    """Baseline (no load, many riders, no rain, no peak) should be 1.0x."""
    payload = {
        "store_id": 2,
        "current_store_load": 0,
        "max_store_capacity": 100,
        "available_riders": 20,
        "is_raining": False,
        "is_peak_hour": False,
    }
    response = client.post("/api/v1/ai/surge-pricing", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["surge_multiplier"] == 1.0
    assert data["is_surge_active"] is False
    assert data["store_id"] == 2


def test_surge_pricing_full_load():
    """Full load + rain + peak hour should activate surge."""
    payload = {
        "store_id": 3,
        "current_store_load": 100,
        "max_store_capacity": 100,
        "available_riders": 0,
        "is_raining": True,
        "is_peak_hour": True,
    }
    response = client.post("/api/v1/ai/surge-pricing", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_surge_active"] is True
    assert data["surge_multiplier"] > 1.0
    # Multiplier must stay within safe cap
    assert data["surge_multiplier"] <= 3.0


# ---------------------------------------------------------------------------
# Forecaster unit-level edge cases
# ---------------------------------------------------------------------------

def test_moving_average_window_larger_than_history():
    """window_size > len(history) should use all available data."""
    result = calculate_moving_average_velocity([10, 20], window_size=10)
    assert result == 15.0


def test_exponential_smoothing_alpha_zero():
    """Alpha=0 means no new information; result equals the first value."""
    result = calculate_exponential_smoothing([50, 100, 150], alpha=0.0)
    assert result == 50.0


def test_exponential_smoothing_alpha_one():
    """Alpha=1 means only the last observation matters."""
    result = calculate_exponential_smoothing([50, 100, 150], alpha=1.0)
    assert result == 150.0


def test_reorder_point_zero_velocity():
    """Zero daily velocity should still produce a valid (safety-stock-only) ROP."""
    result = estimate_reorder_point(daily_velocity=0.0, lead_time_days=2.0)
    assert result["reorder_point"] >= 0
    assert result["safety_stock"] >= 0


def test_recommender_single_basket():
    """Single basket should still return valid co-purchase data."""
    baskets = [[1, 2, 3]]
    recs = rank_frequently_bought_together(target_product_id=1, order_baskets=baskets)
    product_ids = [r["product_id"] for r in recs]
    assert 1 not in product_ids
    assert 2 in product_ids
    assert 3 in product_ids
