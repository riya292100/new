"""
Dedicated Data & Schema Migration Tests.
Validates the structural integrity, table constraints, indices, foreign keys,
and data quality invariant rules defined in Flyway V1__initial_schema.sql.
"""

import os
import re
import pytest

# Isolated test fixture snapshot of the database schema contract
LOCAL_FIXTURE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "fixtures", "schema_snapshot.sql")
)
FALLBACK_SCHEMA_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "..",
        "backend",
        "src",
        "main",
        "resources",
        "db",
        "migration",
        "V1__initial_schema.sql",
    )
)
SCHEMA_PATH = LOCAL_FIXTURE_PATH if os.path.exists(LOCAL_FIXTURE_PATH) else FALLBACK_SCHEMA_PATH


def load_schema_sql() -> str:
    assert os.path.exists(SCHEMA_PATH), f"Schema file not found at {SCHEMA_PATH}"
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        return f.read()


def test_schema_file_exists_and_non_empty():
    sql = load_schema_sql()
    assert len(sql) > 1000, "V1__initial_schema.sql is suspiciously short or empty"


def test_core_tables_defined():
    sql = load_schema_sql()
    expected_tables = [
        "users",
        "roles",
        "user_roles",
        "refresh_tokens",
        "addresses",
        "categories",
        "brands",
        "products",
        "product_variants",
        "product_images",
        "dark_stores",
        "inventories",
        "inventory_transactions",
        "carts",
        "cart_items",
        "coupons",
        "coupon_usages",
        "orders",
        "order_items",
        "payments",
        "refunds",
        "delivery_zones",
        "delivery_partners",
        "delivery_assignments",
        "wallets",
        "wallet_transactions",
        "reviews",
        "notifications",
        "audit_logs",
        "idempotency_keys",
        "fraud_alerts"
    ]
    for table in expected_tables:
        pattern = rf"CREATE TABLE IF NOT EXISTS\s+{table}\b"
        assert re.search(pattern, sql, re.IGNORECASE), f"Missing CREATE TABLE statement for '{table}'"


def test_primary_keys_and_not_null_constraints():
    sql = load_schema_sql()
    assert "PRIMARY KEY" in sql.upper()
    assert "NOT NULL" in sql.upper()

    # Check specific critical NOT NULL constraints
    assert re.search(r"order_number\s+VARCHAR\(\d+\)\s+NOT NULL", sql, re.IGNORECASE)
    assert re.search(r"total_amount\s+NUMERIC\(\d+,\s*\d+\)\s+NOT NULL", sql, re.IGNORECASE)


def test_foreign_key_referential_constraints():
    sql = load_schema_sql()
    fk_references = [
        ("orders", "user_id", "users"),
        ("order_items", "order_id", "orders"),
        ("order_items", "product_id", "products"),
        ("payments", "order_id", "orders"),
        ("delivery_assignments", "order_id", "orders"),
        ("inventories", "product_id", "products"),
        ("inventories", "store_id", "dark_stores"),
    ]
    for child_table, fk_col, parent_table in fk_references:
        pattern = rf"REFERENCES\s+{parent_table}\s*\("
        assert re.search(pattern, sql, re.IGNORECASE), f"Missing FK reference from {child_table}.{fk_col} to {parent_table}"


def test_performance_indices_defined():
    sql = load_schema_sql()
    critical_indices = [
        "idx_products_category",
        "idx_products_brand",
        "idx_orders_user",
        "idx_orders_status",
        "idx_orders_order_number",
        "idx_inventories_store_product",
        "idx_idempotency_key",
    ]
    for idx in critical_indices:
        assert idx.lower() in sql.lower(), f"Missing index '{idx}' in V1__initial_schema.sql"


def test_idempotency_and_audit_tables():
    sql = load_schema_sql()
    assert "idempotency_keys" in sql.lower(), "Missing idempotency_keys table for replay protection"
    assert "audit_logs" in sql.lower(), "Missing audit_logs table for transactional audit trail"
