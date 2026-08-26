"""
Dynamic Surge Pricing & Delivery Fee Elasticity Engine
"""
from typing import Dict, Any


def calculate_surge_multiplier(
    current_store_load: int,
    max_store_capacity: int,
    available_riders: int,
    is_raining: bool = False,
    is_peak_hour: bool = False
) -> Dict[str, Any]:
    """
    Computes dynamic delivery fee surge multiplier based on supply/demand balance.
    """
    if max_store_capacity <= 0:
        max_store_capacity = 100

    load_ratio = current_store_load / max_store_capacity
    multiplier = 1.0
    surge_reasons = []

    # 1. Store Capacity Factor
    if load_ratio > 0.85:
        multiplier += 0.5
        surge_reasons.append("HIGH_STORE_LOAD")
    elif load_ratio > 0.70:
        multiplier += 0.25
        surge_reasons.append("MODERATE_STORE_LOAD")

    # 2. Rider Scarcity Factor
    if available_riders == 0:
        multiplier += 0.6
        surge_reasons.append("NO_AVAILABLE_RIDERS")
    elif available_riders < 3:
        multiplier += 0.3
        surge_reasons.append("LOW_RIDER_SUPPLY")

    # 3. Environmental Factors
    if is_raining:
        multiplier += 0.4
        surge_reasons.append("INCLEMENT_WEATHER")

    if is_peak_hour:
        multiplier += 0.2
        surge_reasons.append("PEAK_COMMERCE_HOUR")

    multiplier = min(round(multiplier, 2), 3.0)  # Capped at 3.0x

    return {
        "surge_multiplier": multiplier,
        "is_surge_active": multiplier > 1.0,
        "load_ratio": round(load_ratio, 2),
        "surge_reasons": surge_reasons
    }
