"""
Data Quality Gate & SLA Enforcement Tests.
Asserts that automated quality gates evaluate null rates, referential constraints,
and schema invariants, throwing fatal DataQualityGateViolation to halt CI pipelines
when data drift or corrupted payloads are encountered.
"""

import pytest
from typing import List, Dict, Any


class DataQualityGateViolation(Exception):
    """Raised when data fails strict quality SLA gates, failing CI/CD pipeline runs."""
    pass


# Documented Quality Gate SLA Thresholds
QUALITY_GATE_CONFIG = {
    "max_allowed_null_rate": 0.00,  # Strict 0% null tolerance on primary attributes
    "max_orphan_fk_rate": 0.00,     # Strict 0% orphan tolerance
    "min_price_threshold": 0.01,
    "max_price_threshold": 100000.0,
}


def evaluate_null_rate_gate(records: List[Dict[str, Any]], column: str, max_null_rate: float = 0.00) -> float:
    """
    Computes null rate on specified column.
    Raises DataQualityGateViolation if null rate strictly exceeds max_null_rate.
    """
    if not records:
        return 0.0
    null_count = sum(1 for r in records if r.get(column) is None)
    rate = null_count / len(records)
    if rate > max_null_rate:
        raise DataQualityGateViolation(
            f"Quality Gate Failed: Column '{column}' null rate {rate:.2%} exceeds SLA threshold {max_null_rate:.2%}"
        )
    return rate


def evaluate_referential_integrity_gate(
    child_records: List[Dict[str, Any]],
    foreign_key: str,
    parent_keys: set,
    max_orphan_rate: float = 0.00
) -> float:
    """
    Evaluates foreign key referential integrity.
    Raises DataQualityGateViolation if orphan references exceed max_orphan_rate.
    """
    if not child_records:
        return 0.0
    orphans = sum(1 for c in child_records if c.get(foreign_key) not in parent_keys)
    rate = orphans / len(child_records)
    if rate > max_orphan_rate:
        raise DataQualityGateViolation(
            f"Referential Quality Gate Failed: FK '{foreign_key}' orphan rate {rate:.2%} exceeds threshold {max_orphan_rate:.2%}"
        )
    return rate


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

def test_clean_orders_pass_null_rate_quality_gate():
    """Valid order stream with zero nulls must pass the gate."""
    valid_orders = [
        {"order_id": 1, "order_number": "QC-01", "total_amount": 100.0, "status": "DELIVERED"},
        {"order_id": 2, "order_number": "QC-02", "total_amount": 250.0, "status": "CONFIRMED"},
        {"order_id": 3, "order_number": "QC-03", "total_amount": 499.0, "status": "PACKING"},
    ]

    rate = evaluate_null_rate_gate(valid_orders, "order_number", QUALITY_GATE_CONFIG["max_allowed_null_rate"])
    assert rate == 0.0

    rate_amount = evaluate_null_rate_gate(valid_orders, "total_amount", QUALITY_GATE_CONFIG["max_allowed_null_rate"])
    assert rate_amount == 0.0


def test_null_order_number_triggers_gate_failure():
    """Corrupted batch with missing order numbers must fail the quality gate."""
    corrupt_orders = [
        {"order_id": 1, "order_number": "QC-01", "total_amount": 100.0},
        {"order_id": 2, "order_number": None, "total_amount": 250.0},  # NULL
        {"order_id": 3, "order_number": "QC-03", "total_amount": 499.0},
    ]

    with pytest.raises(DataQualityGateViolation) as exc_info:
        evaluate_null_rate_gate(corrupt_orders, "order_number", QUALITY_GATE_CONFIG["max_allowed_null_rate"])

    assert "null rate 33.33% exceeds SLA threshold 0.00%" in str(exc_info.value)


def test_null_total_amount_triggers_gate_failure():
    """Financial fact table ingestion must reject null total amounts."""
    corrupt_orders = [
        {"order_id": 1, "total_amount": None},
        {"order_id": 2, "total_amount": 199.0},
    ]

    with pytest.raises(DataQualityGateViolation):
        evaluate_null_rate_gate(corrupt_orders, "total_amount", QUALITY_GATE_CONFIG["max_allowed_null_rate"])


def test_clean_relationships_pass_referential_integrity_gate():
    """Child items referencing known parent order IDs must pass."""
    parent_orders = {101, 102, 103}
    child_items = [
        {"item_id": 1, "order_id": 101, "product_id": 5},
        {"item_id": 2, "order_id": 102, "product_id": 9},
        {"item_id": 3, "order_id": 103, "product_id": 12},
    ]

    orphan_rate = evaluate_referential_integrity_gate(
        child_items, "order_id", parent_orders, QUALITY_GATE_CONFIG["max_orphan_fk_rate"]
    )
    assert orphan_rate == 0.0


def test_orphan_foreign_keys_trigger_gate_failure():
    """Dangling child records without parent orders must trigger pipeline halt."""
    parent_orders = {101, 102}
    child_items_with_orphan = [
        {"item_id": 1, "order_id": 101, "product_id": 5},
        {"item_id": 2, "order_id": 999, "product_id": 8},  # Orphan
    ]

    with pytest.raises(DataQualityGateViolation) as exc_info:
        evaluate_referential_integrity_gate(
            child_items_with_orphan, "order_id", parent_orders, QUALITY_GATE_CONFIG["max_orphan_fk_rate"]
        )

    assert "orphan rate 50.00% exceeds threshold 0.00%" in str(exc_info.value)


def test_sql_injection_safety_passes_for_clean_records():
    """Sanitized business payloads must pass boundary security check."""
    import sys, os
    pipeline_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if pipeline_dir not in sys.path:
        sys.path.insert(0, pipeline_dir)
    from data_validator import DataValidator

    clean_records = [
        {"product_id": 1, "name": "Fresh Organic Milk", "description": "100% pure cow milk"},
        {"product_id": 2, "name": "Brown Bread", "description": "Whole wheat freshly baked"},
    ]
    result = DataValidator.validate_sql_injection_safety(clean_records, ["name", "description"])
    assert result.passed is True
    assert result.details["violation_count"] == 0


def test_sql_injection_safety_detects_malicious_payloads():
    """Malicious SQL injection payloads must be flagged and rejected."""
    import sys, os
    pipeline_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if pipeline_dir not in sys.path:
        sys.path.insert(0, pipeline_dir)
    from data_validator import DataValidator

    malicious_records = [
        {"product_id": 1, "name": "Fresh Milk'; DROP TABLE products; --", "description": "Normal desc"},
        {"product_id": 2, "name": "Bread", "description": "1' OR '1'='1"},
        {"product_id": 3, "name": "Apples", "description": "' UNION SELECT * FROM users --"},
    ]
    result = DataValidator.validate_sql_injection_safety(malicious_records, ["name", "description"])
    assert result.passed is False
    assert result.details["violation_count"] == 3


def test_ingestion_boundary_validation():
    """Validates metadata provenance and batch sizing constraints."""
    import sys, os
    pipeline_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if pipeline_dir not in sys.path:
        sys.path.insert(0, pipeline_dir)
    from data_validator import DataValidator
    valid_batch = [
        {"id": 1, "_ingested_at": "2026-09-05T00:00:00Z", "_source_system": "pos_terminal"},
        {"id": 2, "_ingested_at": "2026-09-05T00:00:01Z", "_source_system": "pos_terminal"},
    ]
    res_valid = DataValidator.validate_ingestion_boundary(valid_batch, max_batch_size=100)
    assert res_valid.passed is True

    # Missing provenance
    invalid_batch = [{"id": 1}]
    res_invalid = DataValidator.validate_ingestion_boundary(invalid_batch, max_batch_size=100)
    assert res_invalid.passed is False
