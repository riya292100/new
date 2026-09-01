"""
QuickCart Data Pipeline Runner.
Implements declarative, idempotent ETL transformations with ON CONFLICT DO UPDATE
upserts across target analytics tables.
"""

import os
import sys
import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone


class DataPipelineRunner:
    """
    Orchestrates idempotent batch data ingestion into PostgreSQL / SQLite storage.
    Enforces atomic transactions and idempotent upsert constraints.
    """

    def __init__(self, connection: Optional[sqlite3.Connection] = None):
        self.conn = connection or sqlite3.connect(":memory:")
        self.conn.execute("PRAGMA foreign_keys = ON;")
        self.init_target_schema()

    def init_target_schema(self) -> None:
        """Create target tables with uniqueness constraints required for idempotent upserts."""
        with self.conn:
            self.conn.executescript("""
                CREATE TABLE IF NOT EXISTS target_orders (
                    id INTEGER PRIMARY KEY,
                    order_number TEXT UNIQUE NOT NULL,
                    user_id INTEGER NOT NULL,
                    dark_store_id INTEGER NOT NULL,
                    total_amount REAL NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS target_inventories (
                    id INTEGER PRIMARY KEY,
                    dark_store_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    stock_quantity INTEGER NOT NULL,
                    updated_at TEXT NOT NULL,
                    UNIQUE(dark_store_id, product_id)
                );

                CREATE TABLE IF NOT EXISTS target_hourly_demand (
                    order_hour TEXT NOT NULL,
                    dark_store_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    total_quantity_sold INTEGER NOT NULL,
                    total_revenue REAL NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (order_hour, dark_store_id, product_id)
                );
            """)

    def upsert_orders(self, records: List[Dict[str, Any]]) -> int:
        """
        Idempotently upsert orders using ON CONFLICT DO UPDATE.
        Running this multiple times on identical records produces identical state.
        """
        sql = """
            INSERT INTO target_orders (
                id, order_number, user_id, dark_store_id, total_amount, status, created_at, updated_at
            ) VALUES (
                :id, :order_number, :user_id, :dark_store_id, :total_amount, :status, :created_at, :updated_at
            )
            ON CONFLICT(order_number) DO UPDATE SET
                user_id = excluded.user_id,
                dark_store_id = excluded.dark_store_id,
                total_amount = excluded.total_amount,
                status = excluded.status,
                updated_at = excluded.updated_at;
        """
        with self.conn:
            self.conn.executemany(sql, records)
        return len(records)

    def upsert_inventories(self, records: List[Dict[str, Any]]) -> int:
        """
        Idempotently upsert dark store inventories on (dark_store_id, product_id).
        """
        sql = """
            INSERT INTO target_inventories (
                id, dark_store_id, product_id, stock_quantity, updated_at
            ) VALUES (
                :id, :dark_store_id, :product_id, :stock_quantity, :updated_at
            )
            ON CONFLICT(dark_store_id, product_id) DO UPDATE SET
                stock_quantity = excluded.stock_quantity,
                updated_at = excluded.updated_at;
        """
        with self.conn:
            self.conn.executemany(sql, records)
        return len(records)

    def upsert_hourly_demand(self, records: List[Dict[str, Any]]) -> int:
        """
        Idempotently upsert hourly demand aggregate metrics.
        """
        sql = """
            INSERT INTO target_hourly_demand (
                order_hour, dark_store_id, product_id, total_quantity_sold, total_revenue, updated_at
            ) VALUES (
                :order_hour, :dark_store_id, :product_id, :total_quantity_sold, :total_revenue, :updated_at
            )
            ON CONFLICT(order_hour, dark_store_id, product_id) DO UPDATE SET
                total_quantity_sold = excluded.total_quantity_sold,
                total_revenue = excluded.total_revenue,
                updated_at = excluded.updated_at;
        """
        with self.conn:
            self.conn.executemany(sql, records)
        return len(records)

    def run_pipeline(self, batch_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """
        Execute full batch ingestion pipeline.
        Guarantees idempotent state transitions.
        """
        orders_count = self.upsert_orders(batch_data.get("orders", []))
        inv_count = self.upsert_inventories(batch_data.get("inventories", []))
        demand_count = self.upsert_hourly_demand(batch_data.get("hourly_demand", []))

        return {
            "status": "SUCCESS",
            "orders_processed": orders_count,
            "inventories_processed": inv_count,
            "demand_records_processed": demand_count,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_table_counts(self) -> Dict[str, int]:
        """Fetch row counts for verification."""
        cursor = self.conn.cursor()
        counts = {}
        for tbl in ["target_orders", "target_inventories", "target_hourly_demand"]:
            cursor.execute(f"SELECT COUNT(*) FROM {tbl}")
            counts[tbl] = cursor.fetchone()[0]
        return counts


def run_pipeline(conn: Optional[sqlite3.Connection] = None, batch_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Helper entry point for external schedulers or CLI."""
    runner = DataPipelineRunner(conn)
    if not batch_data:
        # Default smoke test payload
        batch_data = {
            "orders": [
                {
                    "id": 1,
                    "order_number": "QC-2026-001",
                    "user_id": 10,
                    "dark_store_id": 1,
                    "total_amount": 499.0,
                    "status": "DELIVERED",
                    "created_at": "2026-08-28T10:00:00Z",
                    "updated_at": "2026-08-28T10:15:00Z",
                }
            ],
            "inventories": [
                {
                    "id": 1,
                    "dark_store_id": 1,
                    "product_id": 101,
                    "stock_quantity": 45,
                    "updated_at": "2026-08-28T10:00:00Z",
                }
            ],
            "hourly_demand": [
                {
                    "order_hour": "2026-08-28T10:00:00Z",
                    "dark_store_id": 1,
                    "product_id": 101,
                    "total_quantity_sold": 5,
                    "total_revenue": 240.0,
                    "updated_at": "2026-08-28T10:00:00Z",
                }
            ],
        }
    return runner.run_pipeline(batch_data)


if __name__ == "__main__":
    result = run_pipeline()
    print(f"Pipeline executed successfully: {result}")
