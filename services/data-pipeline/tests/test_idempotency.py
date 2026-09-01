"""
Data Pipeline Idempotency & Repeatability Tests.
Verifies that multi-run pipeline executions satisfy the mathematical property:
f(f(x)) = f(x), preventing duplicate row anomalies or count inflation.
"""

import pytest
import sqlite3
from pipeline.run import DataPipelineRunner


@pytest.fixture
def test_db():
    conn = sqlite3.connect(":memory:")
    yield conn
    conn.close()


@pytest.fixture
def sample_batch():
    return {
        "orders": [
            {
                "id": 1,
                "order_number": "QC-ORD-1001",
                "user_id": 101,
                "dark_store_id": 1,
                "total_amount": 349.50,
                "status": "CONFIRMED",
                "created_at": "2026-08-28T10:00:00Z",
                "updated_at": "2026-08-28T10:00:00Z",
            },
            {
                "id": 2,
                "order_number": "QC-ORD-1002",
                "user_id": 102,
                "dark_store_id": 1,
                "total_amount": 599.00,
                "status": "PACKING",
                "created_at": "2026-08-28T10:05:00Z",
                "updated_at": "2026-08-28T10:05:00Z",
            },
            {
                "id": 3,
                "order_number": "QC-ORD-1003",
                "user_id": 103,
                "dark_store_id": 2,
                "total_amount": 149.00,
                "status": "DELIVERED",
                "created_at": "2026-08-28T10:10:00Z",
                "updated_at": "2026-08-28T10:10:00Z",
            },
        ],
        "inventories": [
            {
                "id": 1,
                "dark_store_id": 1,
                "product_id": 501,
                "stock_quantity": 40,
                "updated_at": "2026-08-28T10:00:00Z",
            },
            {
                "id": 2,
                "dark_store_id": 1,
                "product_id": 502,
                "stock_quantity": 12,
                "updated_at": "2026-08-28T10:00:00Z",
            },
            {
                "id": 3,
                "dark_store_id": 2,
                "product_id": 501,
                "stock_quantity": 95,
                "updated_at": "2026-08-28T10:00:00Z",
            },
        ],
        "hourly_demand": [
            {
                "order_hour": "2026-08-28T10:00:00Z",
                "dark_store_id": 1,
                "product_id": 501,
                "total_quantity_sold": 8,
                "total_revenue": 320.0,
                "updated_at": "2026-08-28T10:00:00Z",
            },
            {
                "order_hour": "2026-08-28T10:00:00Z",
                "dark_store_id": 2,
                "product_id": 501,
                "total_quantity_sold": 4,
                "total_revenue": 160.0,
                "updated_at": "2026-08-28T10:00:00Z",
            },
        ],
    }


def test_pipeline_runs_twice_with_identical_row_counts(test_db, sample_batch):
    """
    Core Idempotency Invariant: Running the pipeline twice on identical input
    must produce identical row counts in all target tables.
    """
    runner = DataPipelineRunner(test_db)

    # First Execution Run
    res1 = runner.run_pipeline(sample_batch)
    assert res1["status"] == "SUCCESS"
    counts_run1 = runner.get_table_counts()

    assert counts_run1["target_orders"] == 3
    assert counts_run1["target_inventories"] == 3
    assert counts_run1["target_hourly_demand"] == 2

    # Second Execution Run (Replay / Backfill)
    res2 = runner.run_pipeline(sample_batch)
    assert res2["status"] == "SUCCESS"
    counts_run2 = runner.get_table_counts()

    # Assert exact row-count equality
    assert counts_run2 == counts_run1, (
        f"Idempotency violation! Counts changed between runs: {counts_run1} vs {counts_run2}"
    )


def test_pipeline_updates_state_without_duplication(test_db, sample_batch):
    """
    Mutated Replay: When incoming records contain status or quantity changes
    for existing primary keys, values are updated in place without row duplication.
    """
    runner = DataPipelineRunner(test_db)
    runner.run_pipeline(sample_batch)

    # Mutate data for existing keys
    mutated_batch = {
        "orders": [
            {
                "id": 1,
                "order_number": "QC-ORD-1001",
                "user_id": 101,
                "dark_store_id": 1,
                "total_amount": 349.50,
                "status": "DELIVERED",  # Status changed
                "created_at": "2026-08-28T10:00:00Z",
                "updated_at": "2026-08-28T10:30:00Z",
            }
        ],
        "inventories": [
            {
                "id": 1,
                "dark_store_id": 1,
                "product_id": 501,
                "stock_quantity": 38,  # Stock decremented
                "updated_at": "2026-08-28T10:30:00Z",
            }
        ],
        "hourly_demand": [],
    }

    runner.run_pipeline(mutated_batch)
    counts = runner.get_table_counts()

    # Row counts must remain strictly stable
    assert counts["target_orders"] == 3
    assert counts["target_inventories"] == 3

    # Assert updated values are reflected
    cursor = test_db.cursor()
    cursor.execute("SELECT status FROM target_orders WHERE order_number = 'QC-ORD-1001'")
    assert cursor.fetchone()[0] == "DELIVERED"

    cursor.execute(
        "SELECT stock_quantity FROM target_inventories WHERE dark_store_id = 1 AND product_id = 501"
    )
    assert cursor.fetchone()[0] == 38


def test_incremental_ingestion_adds_only_delta(test_db, sample_batch):
    """
    Incremental Backfill: Only genuinely new unique entities increase row count.
    """
    runner = DataPipelineRunner(test_db)
    runner.run_pipeline(sample_batch)

    delta_batch = {
        "orders": [
            # 1 existing order (replay)
            sample_batch["orders"][0],
            # 1 new order
            {
                "id": 4,
                "order_number": "QC-ORD-1004",
                "user_id": 104,
                "dark_store_id": 2,
                "total_amount": 890.00,
                "status": "CONFIRMED",
                "created_at": "2026-08-28T10:45:00Z",
                "updated_at": "2026-08-28T10:45:00Z",
            },
        ],
        "inventories": [],
        "hourly_demand": [],
    }

    runner.run_pipeline(delta_batch)
    counts = runner.get_table_counts()
    assert counts["target_orders"] == 4  # 3 original + 1 new
