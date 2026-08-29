"""
Unit Tests for Data Pipeline Orchestrator, Data Quality Validator, and dbt Models.
"""

import pytest
import os
import sys

PIPELINE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PIPELINE_ROOT not in sys.path:
    sys.path.insert(0, PIPELINE_ROOT)

from data_validator import DataValidator
from orchestrator import PipelineOrchestrator


def test_data_validator_not_null():
    records = [{"id": 1, "name": "Apple"}, {"id": 2, "name": "Banana"}]
    res = DataValidator.validate_not_null(records, "name")
    assert res.passed is True

    records_with_null = [{"id": 1, "name": "Apple"}, {"id": 2, "name": None}]
    res_null = DataValidator.validate_not_null(records_with_null, "name")
    assert res_null.passed is False
    assert res_null.details["null_count"] == 1


def test_data_validator_uniqueness():
    records = [{"order_id": 101}, {"order_id": 102}, {"order_id": 103}]
    res = DataValidator.validate_unique(records, "order_id")
    assert res.passed is True

    duplicate_records = [{"order_id": 101}, {"order_id": 101}]
    res_dup = DataValidator.validate_unique(duplicate_records, "order_id")
    assert res_dup.passed is False


def test_data_validator_numeric_range():
    records = [{"price": 10.5}, {"price": 150.0}, {"price": 99.0}]
    res = DataValidator.validate_numeric_range(records, "price", min_val=0.0, max_val=500.0)
    assert res.passed is True

    invalid_records = [{"price": -5.0}, {"price": 1000.0}]
    res_invalid = DataValidator.validate_numeric_range(invalid_records, "price", min_val=0.0, max_val=500.0)
    assert res_invalid.passed is False


def test_data_validator_accepted_values():
    records = [{"status": "CONFIRMED"}, {"status": "DELIVERED"}, {"status": "CANCELLED"}]
    valid_statuses = {"CONFIRMED", "PACKING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"}
    res = DataValidator.validate_accepted_values(records, "status", valid_statuses)
    assert res.passed is True

    invalid_records = [{"status": "UNKNOWN_STATUS"}]
    res_invalid = DataValidator.validate_accepted_values(invalid_records, "status", valid_statuses)
    assert res_invalid.passed is False


def test_data_validator_referential_integrity():
    parents = [{"id": 1}, {"id": 2}]
    children = [{"order_id": 10, "store_id": 1}, {"order_id": 20, "store_id": 2}]
    res = DataValidator.validate_foreign_key_integrity(children, "store_id", parents, "id")
    assert res.passed is True

    orphan_children = [{"order_id": 30, "store_id": 999}]
    res_orphan = DataValidator.validate_foreign_key_integrity(orphan_children, "store_id", parents, "id")
    assert res_orphan.passed is False


def test_pipeline_orchestrator_execution():
    orchestrator = PipelineOrchestrator("test_dag")
    execution_state = []

    def task_a():
        execution_state.append("task_a")
        return {"records": 50}

    def task_b():
        execution_state.append("task_b")
        return {"validated": True}

    orchestrator.add_task("ingest_cdc", task_a)
    orchestrator.add_task("validate_staging", task_b, dependencies=["ingest_cdc"])

    success = orchestrator.run()
    assert success is True
    assert execution_state == ["task_a", "task_b"]
    assert len(orchestrator.execution_log) == 2


def test_dbt_models_exist():
    pipeline_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(pipeline_root, "models")
    assert os.path.exists(os.path.join(models_dir, "staging", "stg_orders.sql"))
    assert os.path.exists(os.path.join(models_dir, "marts", "fct_order_fulfillment.sql"))
    assert os.path.exists(os.path.join(models_dir, "marts", "fct_hourly_demand.sql"))
    assert os.path.exists(os.path.join(models_dir, "schema.yml"))
