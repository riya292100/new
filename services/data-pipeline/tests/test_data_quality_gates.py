"""
Automated Data Quality Gate and Schema Anomaly Detection Suite.
Enforces non-negotiable data quality thresholds on critical e-commerce entities (products, orders, inventories),
raising explicit exceptions to fail CI/CD build gates upon quality rule breaches.
"""

from typing import List, Dict, Any
import pytest
from data_validator import DataValidator, DataQualityResult


class DataQualityGateViolation(Exception):
    """Raised when data quality gate checks fail in pipeline execution."""
    pass


def run_catalog_data_quality_gate(products: List[Dict[str, Any]]) -> List[DataQualityResult]:
    """
    Executes a comprehensive data quality gate on product catalog records.
    Throws DataQualityGateViolation if any critical invariants are violated.
    """
    results = []

    # 1. Null checks on critical columns
    for col in ["id", "name", "slug", "mrp", "selling_price", "stock_quantity"]:
        res = DataValidator.validate_not_null(products, col)
        results.append(res)
        if not res.passed:
            raise DataQualityGateViolation(f"Quality gate breached: {res.message}")

    # 2. Uniqueness checks on slug and id
    for col in ["id", "slug"]:
        res = DataValidator.validate_unique(products, col)
        results.append(res)
        if not res.passed:
            raise DataQualityGateViolation(f"Uniqueness violation: {res.message}")

    # 3. Numeric range checks
    res_mrp = DataValidator.validate_numeric_range(products, "mrp", min_val=0.01, max_val=100000.0)
    results.append(res_mrp)
    if not res_mrp.passed:
        raise DataQualityGateViolation(f"MRP out of bounds: {res_mrp.message}")

    res_price = DataValidator.validate_numeric_range(products, "selling_price", min_val=0.0, max_val=100000.0)
    results.append(res_price)
    if not res_price.passed:
        raise DataQualityGateViolation(f"Selling price out of bounds: {res_price.message}")

    res_stock = DataValidator.validate_numeric_range(products, "stock_quantity", min_val=0, max_val=1000000)
    results.append(res_stock)
    if not res_stock.passed:
        raise DataQualityGateViolation(f"Stock quantity out of bounds: {res_stock.message}")

    # 4. Invariant: selling_price must never exceed mrp
    for p in products:
        mrp = p.get("mrp")
        sp = p.get("selling_price")
        if mrp is not None and sp is not None and sp > mrp:
            raise DataQualityGateViolation(f"Pricing anomaly: Product '{p.get('slug')}' selling_price ({sp}) > MRP ({mrp})")

    return results


def run_orders_data_quality_gate(orders: List[Dict[str, Any]]) -> List[DataQualityResult]:
    """
    Executes a comprehensive data quality gate on order lifecycle records.
    Throws DataQualityGateViolation on invalid statuses, negative amounts, or missing keys.
    """
    results = []
    VALID_STATUSES = {
        "PLACED",
        "CONFIRMED",
        "STORE_ALLOCATED",
        "PACKED",
        "READY_FOR_PICKUP",
        "DISPATCHED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
    }

    # 1. Null checks
    for col in ["id", "order_number", "user_id", "total_amount", "status"]:
        res = DataValidator.validate_not_null(orders, col)
        results.append(res)
        if not res.passed:
            raise DataQualityGateViolation(f"Order null check failed: {res.message}")

    # 2. Uniqueness
    res_num = DataValidator.validate_unique(orders, "order_number")
    results.append(res_num)
    if not res_num.passed:
        raise DataQualityGateViolation(f"Duplicate order numbers: {res_num.message}")

    # 3. Status enum validation
    res_status = DataValidator.validate_accepted_values(orders, "status", VALID_STATUSES)
    results.append(res_status)
    if not res_status.passed:
        raise DataQualityGateViolation(f"Invalid order status detected: {res_status.message}")

    # 4. Total amount non-negative range
    res_amount = DataValidator.validate_numeric_range(orders, "total_amount", min_val=0.0, max_val=1000000.0)
    results.append(res_amount)
    if not res_amount.passed:
        raise DataQualityGateViolation(f"Negative order amount: {res_amount.message}")

    return results


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

def test_valid_catalog_passes_quality_gate():
    """Ensure clean product catalog data passes all quality gate checks."""
    valid_products = [
        {"id": 1, "name": "Organic Apples", "slug": "organic-apples", "mrp": 120.0, "selling_price": 99.0, "stock_quantity": 45},
        {"id": 2, "name": "Brown Bread", "slug": "brown-bread", "mrp": 45.0, "selling_price": 40.0, "stock_quantity": 20},
        {"id": 3, "name": "Almond Milk", "slug": "almond-milk", "mrp": 250.0, "selling_price": 220.0, "stock_quantity": 15},
    ]
    results = run_catalog_data_quality_gate(valid_products)
    assert all(r.passed for r in results)
    assert len(results) >= 8


def test_catalog_null_mrp_fails_gate():
    """Ensure missing MRP triggers a quality gate exception."""
    corrupted_products = [
        {"id": 1, "name": "Apple", "slug": "apple", "mrp": None, "selling_price": 99.0, "stock_quantity": 10},
    ]
    with pytest.raises(DataQualityGateViolation, match="mrp: 1/1 null records detected"):
        run_catalog_data_quality_gate(corrupted_products)


def test_catalog_negative_stock_fails_gate():
    """Ensure negative stock quantity triggers a quality gate exception."""
    invalid_stock_products = [
        {"id": 1, "name": "Apple", "slug": "apple", "mrp": 100.0, "selling_price": 90.0, "stock_quantity": -5},
    ]
    with pytest.raises(DataQualityGateViolation, match="Stock quantity out of bounds"):
        run_catalog_data_quality_gate(invalid_stock_products)


def test_catalog_selling_price_exceeds_mrp_fails_gate():
    """Ensure price gouging anomaly (selling_price > mrp) triggers a quality gate exception."""
    gouged_products = [
        {"id": 1, "name": "Sanitizer", "slug": "sanitizer", "mrp": 50.0, "selling_price": 120.0, "stock_quantity": 100},
    ]
    with pytest.raises(DataQualityGateViolation, match="Pricing anomaly"):
        run_catalog_data_quality_gate(gouged_products)


def test_catalog_duplicate_slug_fails_gate():
    """Ensure duplicate product slug fails uniqueness quality gate."""
    duplicate_slug_products = [
        {"id": 1, "name": "Apple 1", "slug": "fresh-apple", "mrp": 100.0, "selling_price": 90.0, "stock_quantity": 10},
        {"id": 2, "name": "Apple 2", "slug": "fresh-apple", "mrp": 120.0, "selling_price": 95.0, "stock_quantity": 15},
    ]
    with pytest.raises(DataQualityGateViolation, match="Uniqueness violation"):
        run_catalog_data_quality_gate(duplicate_slug_products)


def test_valid_orders_pass_quality_gate():
    """Ensure clean order records pass all order quality gate checks."""
    valid_orders = [
        {"id": 1, "order_number": "QC-101", "user_id": 10, "total_amount": 250.0, "status": "DELIVERED"},
        {"id": 2, "order_number": "QC-102", "user_id": 11, "total_amount": 140.0, "status": "OUT_FOR_DELIVERY"},
        {"id": 3, "order_number": "QC-103", "user_id": 12, "total_amount": 0.0, "status": "CANCELLED"},
    ]
    results = run_orders_data_quality_gate(valid_orders)
    assert all(r.passed for r in results)


def test_order_invalid_status_fails_gate():
    """Ensure illegal status string fails order quality gate."""
    bad_status_orders = [
        {"id": 1, "order_number": "QC-104", "user_id": 10, "total_amount": 500.0, "status": "STOLEN_IN_TRANSIT"},
    ]
    with pytest.raises(DataQualityGateViolation, match="Invalid order status detected"):
        run_orders_data_quality_gate(bad_status_orders)


def test_order_negative_amount_fails_gate():
    """Ensure negative total amount fails order quality gate."""
    negative_orders = [
        {"id": 1, "order_number": "QC-105", "user_id": 10, "total_amount": -150.0, "status": "CONFIRMED"},
    ]
    with pytest.raises(DataQualityGateViolation, match="Negative order amount"):
        run_orders_data_quality_gate(negative_orders)
