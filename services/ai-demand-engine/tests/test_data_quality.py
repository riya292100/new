"""
Data Quality and Invariant Validation Suite for AI Demand Engine.
Tests outlier handling, non-negative constraints, mathematical bounds, and data frame invariants.
"""

import pytest
from app.forecaster import (
    calculate_moving_average_velocity,
    calculate_exponential_smoothing,
    estimate_reorder_point,
)
from app.pricing import calculate_surge_multiplier
from app.recommender import rank_frequently_bought_together


def test_velocity_empty_history_data_quality():
    assert calculate_moving_average_velocity([]) == 0.0
    assert calculate_exponential_smoothing([]) == 0.0


def test_velocity_single_item_history():
    assert calculate_moving_average_velocity([15]) == 15.0
    assert calculate_exponential_smoothing([15]) == 15.0


def test_reorder_point_invariants():
    # Invariant: reorder_point must always be >= (daily_velocity * lead_time_days)
    result = estimate_reorder_point(daily_velocity=25.0, lead_time_days=3.0)
    assert result["reorder_point"] >= (25.0 * 3.0)
    assert result["safety_stock"] > 0
    assert result["recommendation"] == "REORDER_NOW"


def test_surge_multiplier_bounded_range():
    # Invariant: surge multiplier must never drop below 1.0 or exceed reasonable cap (e.g. 3.0)
    surge_min = calculate_surge_multiplier(
        current_store_load=0,
        max_store_capacity=100,
        available_riders=20,
        is_raining=False,
        is_peak_hour=False
    )
    assert surge_min["surge_multiplier"] == 1.0
    assert surge_min["is_surge_active"] is False

    surge_max = calculate_surge_multiplier(
        current_store_load=100,
        max_store_capacity=100,
        available_riders=0,
        is_raining=True,
        is_peak_hour=True
    )
    assert surge_max["surge_multiplier"] <= 3.0
    assert surge_max["is_surge_active"] is True


def test_recommender_handles_empty_baskets():
    recs = rank_frequently_bought_together(target_product_id=99, order_baskets=[])
    assert recs == []


def test_recommender_excludes_target_product():
    baskets = [[1, 1, 1], [1, 2]]
    recs = rank_frequently_bought_together(target_product_id=1, order_baskets=baskets)
    for item in recs:
        assert item["product_id"] != 1


def test_forecast_negative_velocity_handling():
    # Negative sales entries should be handled gracefully or clamped to 0
    res = calculate_moving_average_velocity([-10, -5, 0])
    assert res >= 0.0


def test_pricing_surge_gradient_monotonicity():
    # When load increases with everything else constant, surge multiplier must not decrease
    low_load = calculate_surge_multiplier(current_store_load=20, max_store_capacity=100, available_riders=10)
    high_load = calculate_surge_multiplier(current_store_load=90, max_store_capacity=100, available_riders=10)
    assert high_load["surge_multiplier"] >= low_load["surge_multiplier"]

