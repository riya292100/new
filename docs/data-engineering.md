# QuickCart Data Engineering & Machine Learning Architecture

QuickCart incorporates automated data validation, demand forecasting algorithms, and data pipeline quality assurance.

---

## 1. AI Demand Forecasting Engine

The Python AI Demand Engine (`services/ai-demand-engine`) models dark store sales velocities to automate inventory replenishment.

### 1.1 Core Mathematical Models

1. **Moving Average Velocity**:
   $$\text{Velocity} = \frac{1}{N} \sum_{i=1}^{N} S_i$$
   Computes baseline daily sales velocity over sliding history windows.

2. **Exponential Smoothing (Holt-Winters)**:
   $$F_t = \alpha S_t + (1 - \alpha) F_{t-1}$$
   Adapts forecasting weights to recent demand volatility.

3. **Safety Stock & Reorder Point (ROP)**:
   $$\text{Safety Stock} = Z \times \sigma_L$$
   $$\text{ROP} = (\text{Daily Demand} \times \text{Lead Time}) + \text{Safety Stock}$$
   Prevents stockouts during surge ordering windows while minimizing holding costs.

4. **Dynamic Surge Pricing Multiplier**:
   Calculates real-time price elasticity multipliers based on dark store delivery backlog and active courier density:
   $$\text{Multiplier} = \min\left(2.5, \max\left(1.0, 1.0 + \frac{\text{Unassigned Backlog}}{\text{Active Drivers} \times 2}\right)\right)$$

---

## 2. Data Pipeline Quality Invariants

The data validation test suite (`services/data-pipeline/tests/test_pipeline_and_schema.py`) enforces strict data quality assertions:
- **Completeness**: No `NULL` values on primary business keys (`order_id`, `product_id`, `timestamp`).
- **Uniqueness**: Primary key uniqueness across batch ingestion streams.
- **Range Invariants**: Prices > 0, Stock Quantities ≥ 0, Geocoordinates within valid GPS bounds ([-90, 90], [-180, 180]).
- **Referential Integrity**: Foreign keys match valid dimension rows.
