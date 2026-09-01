import os
import sys
import sqlite3
import pytest

# Ensure data-pipeline root is on sys.path regardless of where pytest is executed from
SERVICE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)


@pytest.fixture
def standalone_db():
    """
    Self-contained, in-memory SQLite database fixture for isolated testing.
    Guarantees zero reliance on live PostgreSQL, external network sockets,
    or external service provisioning.
    """
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Seed common schema tables matching pipeline targets
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock_quantity INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS pipeline_runs (
            run_id TEXT PRIMARY KEY,
            batch_date TEXT NOT NULL,
            records_processed INTEGER NOT NULL,
            records_inserted INTEGER NOT NULL,
            records_updated INTEGER NOT NULL,
            status TEXT NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()

    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture
def mock_pipeline_data():
    """Provides sample order and product rows for testing data quality and transforms."""
    return [
        {"order_id": 1001, "user_id": 501, "total_amount": 250.0, "status": "DELIVERED"},
        {"order_id": 1002, "user_id": 502, "total_amount": 890.5, "status": "DELIVERED"},
        {"order_id": 1003, "user_id": 503, "total_amount": 120.0, "status": "CANCELLED"},
    ]
