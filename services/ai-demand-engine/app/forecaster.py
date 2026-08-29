"""
Demand Velocity & Safety Stock Forecasting Algorithms
"""
from typing import List, Dict, Any
import math


def calculate_moving_average_velocity(sales_history: List[int], window_size: int = 7) -> float:
    """
    Computes moving average sales velocity across recent hourly/daily historical data.
    """
    if not sales_history:
        return 0.0
    effective_window = sales_history[-window_size:]
    return round(sum(effective_window) / len(effective_window), 2)


def calculate_exponential_smoothing(sales_history: List[int], alpha: float = 0.3) -> float:
    """
    Computes Single Exponential Smoothing (SES) forecast for next period demand.
    """
    if not sales_history:
        return 0.0
    forecast = float(sales_history[0])
    for actual in sales_history[1:]:
        forecast = alpha * actual + (1 - alpha) * forecast
    return round(forecast, 2)


def estimate_reorder_point(
    daily_velocity: float,
    lead_time_days: float = 2.0,
    service_level_z: float = 1.65,  # 95% service level
    demand_std_dev: float = 3.5
) -> Dict[str, Any]:
    """
    Calculates safety stock and inventory reorder point (ROP).
    ROP = (Lead Time * Velocity) + Safety Stock
    Safety Stock = Z * sqrt(Lead Time) * Demand Standard Deviation

    Raises:
        ValueError: if lead_time_days or daily_velocity is negative.
    """
    if lead_time_days < 0:
        raise ValueError(f"lead_time_days must be non-negative, got {lead_time_days}")
    if daily_velocity < 0:
        raise ValueError(f"daily_velocity must be non-negative, got {daily_velocity}")
    safety_stock = math.ceil(service_level_z * math.sqrt(lead_time_days) * demand_std_dev)
    lead_time_demand = math.ceil(daily_velocity * lead_time_days)
    reorder_point = lead_time_demand + safety_stock

    return {
        "daily_velocity": daily_velocity,
        "lead_time_days": lead_time_days,
        "safety_stock": safety_stock,
        "reorder_point": reorder_point,
        "recommendation": "REORDER_NOW" if reorder_point > 0 else "STOCK_HEALTHY",
    }
