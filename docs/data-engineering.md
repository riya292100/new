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

## 2. Data Pipeline Quality Invariants & Quality Gates

The data validation test suites (`services/data-pipeline/tests/` and `services/ai-demand-engine/tests/`) enforce strict data quality assertions:
- **Completeness & Null Checks**: Zero null values on critical columns (`id`, `name`, `slug`, `mrp`, `selling_price`, `stock_quantity`, `total_amount`, `order_number`).
- **Uniqueness**: Primary key and slug/SKU uniqueness across batch ingestion streams.
- **Range Invariants & Boundaries**: MRP > 0, Selling Price ≥ 0, Selling Price ≤ MRP, Stock Quantities ≥ 0, Ratings within [1.0, 5.0], Geocoordinates within valid GPS bounds ([-90, 90], [-180, 180]).
- **Referential Integrity & Cascades**: Foreign keys match valid dimension rows with cascade delete testing on users, orders, products, and inventories (`test_referential_integrity.py`).
- **Automated CI Quality Gates**: Enforced quality gate validator functions (`test_data_quality_gate.py` and `test_data_quality_gates.py`) that throw explicit `DataQualityGateViolation` exceptions to fail CI/CD merges when data drift or null anomalies occur.

---

## 3. Declarative Pipeline Idempotency & Backfill Guarantees

The pipeline runner (`services/data-pipeline/pipeline/run.py`) guarantees mathematical idempotency:
$$f(f(x)) = f(x)$$

### 3.1 Idempotent Upsert Strategy
Every target analytics entity utilizes declarative `ON CONFLICT (...) DO UPDATE SET ...` syntax:
- **Orders**: Target conflict on unique `order_number`, updating financial aggregates and lifecycle status.
- **Inventories**: Target conflict on composite key `(dark_store_id, product_id)`, mutating latest stock counts without duplicating rows.
- **Hourly Demand Aggregates**: Target conflict on composite key `(order_hour, dark_store_id, product_id)`, maintaining aggregate sales and revenue integrity across repeated replay batches.

### 3.2 Verification
Automated double-run testing in `services/data-pipeline/tests/test_idempotency.py` asserts that running any batch once, twice, or multiple times leaves row counts completely unchanged and updates data in place without entity multiplication.

