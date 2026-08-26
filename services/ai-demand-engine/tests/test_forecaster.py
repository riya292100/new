"""Unit Tests for Python AI Demand Engine"""
from app.forecaster import (
    calculate_moving_average_velocity,
    calculate_exponential_smoothing,
    estimate_reorder_point
)
from app.recommender import rank_frequently_bought_together
from app.pricing import calculate_surge_multiplier
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "UP"


def test_moving_average_velocity():
    history = [10, 15, 20, 25, 30]
    velocity = calculate_moving_average_velocity(history, window_size=3)
    assert velocity == 25.0  # (20 + 25 + 30) / 3


def test_exponential_smoothing():
    history = [10, 20, 30]
    forecast = calculate_exponential_smoothing(history, alpha=0.5)
    assert forecast > 0.0


def test_reorder_point_calculation():
    result = estimate_reorder_point(daily_velocity=20.0, lead_time_days=2.0)
    assert result["reorder_point"] > 40
    assert result["recommendation"] == "REORDER_NOW"


def test_frequently_bought_together():
    baskets = [
        [1, 2, 3],
        [1, 2, 4],
        [1, 5],
        [2, 3]
    ]
    recs = rank_frequently_bought_together(target_product_id=1, order_baskets=baskets, top_k=2)
    assert len(recs) == 2
    assert recs[0]["product_id"] == 2
    assert recs[0]["confidence_score"] == round(2 / 3, 3)


def test_surge_multiplier():
    surge = calculate_surge_multiplier(
        current_store_load=90,
        max_store_capacity=100,
        available_riders=1,
        is_raining=True,
        is_peak_hour=True
    )
    assert surge["is_surge_active"] is True
    assert surge["surge_multiplier"] > 1.5


def test_api_forecast_demand_endpoint():
    payload = {
        "product_id": 101,
        "sales_history": [12, 14, 18, 22, 25],
        "lead_time_days": 2.0
    }
    response = client.post("/api/v1/ai/forecast-demand", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == 101
    assert data["reorder_point"] > 0
