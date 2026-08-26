"""
QuickCart AI Demand & Recommendation FastAPI Service
"""
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from app.forecaster import (
    calculate_moving_average_velocity,
    calculate_exponential_smoothing,
    estimate_reorder_point
)
from app.recommender import rank_frequently_bought_together
from app.pricing import calculate_surge_multiplier

app = FastAPI(
    title="QuickCart AI Demand & Intelligence Engine",
    description="Python microservice for demand forecasting, dynamic pricing & product recommendations",
    version="1.0.0"
)


# Pydantic Schemas
class DemandForecastRequest(BaseModel):
    product_id: int
    sales_history: List[int] = Field(..., description="Hourly or daily historical sales units")
    lead_time_days: Optional[float] = 2.0


class DemandForecastResponse(BaseModel):
    product_id: int
    moving_average_velocity: float
    exponential_smoothed_forecast: float
    reorder_point: int
    safety_stock: int
    recommendation: str


class RecommendationRequest(BaseModel):
    target_product_id: int
    order_baskets: List[List[int]]
    top_k: Optional[int] = 5


class SurgePricingRequest(BaseModel):
    store_id: int
    current_store_load: int
    max_store_capacity: int
    available_riders: int
    is_raining: Optional[bool] = False
    is_peak_hour: Optional[bool] = False


@app.get("/healthz")
def health_check():
    return {"status": "UP", "service": "quickcart-ai-demand-engine", "version": "1.0.0"}


@app.post("/api/v1/ai/forecast-demand", response_model=DemandForecastResponse)
def forecast_demand(req: DemandForecastRequest):
    if not req.sales_history:
        raise HTTPException(status_code=400, detail="sales_history cannot be empty")

    ma_velocity = calculate_moving_average_velocity(req.sales_history)
    ses_forecast = calculate_exponential_smoothing(req.sales_history)
    reorder_info = estimate_reorder_point(ma_velocity, lead_time_days=req.lead_time_days)

    return DemandForecastResponse(
        product_id=req.product_id,
        moving_average_velocity=ma_velocity,
        exponential_smoothed_forecast=ses_forecast,
        reorder_point=reorder_info["reorder_point"],
        safety_stock=reorder_info["safety_stock"],
        recommendation=reorder_info["recommendation"]
    )


@app.post("/api/v1/ai/recommendations")
def get_recommendations(req: RecommendationRequest):
    recommendations = rank_frequently_bought_together(
        target_product_id=req.target_product_id,
        order_baskets=req.order_baskets,
        top_k=req.top_k or 5
    )
    return {
        "target_product_id": req.target_product_id,
        "recommendations": recommendations
    }


@app.post("/api/v1/ai/surge-pricing")
def get_surge_pricing(req: SurgePricingRequest):
    surge_data = calculate_surge_multiplier(
        current_store_load=req.current_store_load,
        max_store_capacity=req.max_store_capacity,
        available_riders=req.available_riders,
        is_raining=req.is_raining or False,
        is_peak_hour=req.is_peak_hour or False
    )
    return {
        "store_id": req.store_id,
        **surge_data
    }
