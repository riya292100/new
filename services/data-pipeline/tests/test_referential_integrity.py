"""
Referential Integrity and Schema Cascade Constraint Validation Suite.
Simulates relational schema foreign keys and cascade delete rules from Flyway V1__initial_schema.sql,
verifying that relational dependencies, orphan checks, and cascade deletions strictly hold.
"""

import sqlite3
import pytest
from data_validator import DataValidator


@pytest.fixture
def in_memory_db():
    """Create an in-memory SQLite database with foreign keys enabled and the core schema."""
    conn = sqlite3.connect(":memory:")
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # Core table definitions mirroring V1__initial_schema.sql
    cursor.executescript("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL UNIQUE
        );

        CREATE TABLE roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE user_roles (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, role_id)
        );

        CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE
        );

        CREATE TABLE brands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE
        );

        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            category_id INTEGER NOT NULL REFERENCES categories(id),
            brand_id INTEGER REFERENCES brands(id),
            mrp REAL NOT NULL,
            selling_price REAL NOT NULL,
            stock_quantity INTEGER NOT NULL DEFAULT 50
        );

        CREATE TABLE product_variants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            sku TEXT NOT NULL UNIQUE,
            variant_name TEXT NOT NULL
        );

        CREATE TABLE dark_stores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            city TEXT NOT NULL
        );

        CREATE TABLE inventories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            store_id INTEGER NOT NULL REFERENCES dark_stores(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            available_quantity INTEGER NOT NULL DEFAULT 0,
            reserved_quantity INTEGER NOT NULL DEFAULT 0,
            UNIQUE(store_id, product_id)
        );

        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT NOT NULL UNIQUE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            store_id INTEGER REFERENCES dark_stores(id),
            status TEXT NOT NULL DEFAULT 'PLACED',
            total_amount REAL NOT NULL
        );

        CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL
        );

        CREATE TABLE payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL DEFAULT 'PENDING',
            amount REAL NOT NULL
        );

        CREATE TABLE wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            balance REAL NOT NULL DEFAULT 100.0
        );
    """)
    conn.commit()
    yield conn
    conn.close()


def test_fixture_insertion_valid(in_memory_db):
    """Assert successful insertion of valid parent and child relational records."""
    cursor = in_memory_db.cursor()

    cursor.execute("INSERT INTO users (full_name, email, phone) VALUES ('Alice Smith', 'alice@example.com', '+919876543210')")
    user_id = cursor.lastrowid

    cursor.execute("INSERT INTO categories (name, slug) VALUES ('Dairy & Eggs', 'dairy-eggs')")
    cat_id = cursor.lastrowid

    cursor.execute("INSERT INTO products (name, slug, category_id, mrp, selling_price) VALUES ('Fresh Milk', 'fresh-milk', ?, 60.0, 55.0)", (cat_id,))
    product_id = cursor.lastrowid

    cursor.execute("INSERT INTO dark_stores (name, code, city) VALUES ('Indiranagar Store', 'DS-BLR-01', 'Bengaluru')")
    store_id = cursor.lastrowid

    cursor.execute("INSERT INTO inventories (store_id, product_id, available_quantity) VALUES (?, ?, 100)", (store_id, product_id))
    
    cursor.execute("INSERT INTO orders (order_number, user_id, store_id, total_amount) VALUES ('QC-1001', ?, ?, 110.0)", (user_id, store_id))
    order_id = cursor.lastrowid

    cursor.execute("INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, 2, 55.0, 110.0)", (order_id, product_id))
    cursor.execute("INSERT INTO payments (order_id, payment_method, payment_status, amount) VALUES (?, 'UPI', 'COMPLETED', 110.0)", (order_id,))
    
    in_memory_db.commit()

    # Verify counts
    cursor.execute("SELECT COUNT(*) FROM orders")
    assert cursor.fetchone()[0] == 1
    cursor.execute("SELECT COUNT(*) FROM order_items")
    assert cursor.fetchone()[0] == 1
    cursor.execute("SELECT COUNT(*) FROM payments")
    assert cursor.fetchone()[0] == 1


def test_foreign_key_violation_raises_error(in_memory_db):
    """Assert that inserting child records referencing non-existent parents raises an IntegrityError."""
    cursor = in_memory_db.cursor()

    # Inserting order for non-existent user_id=999 must fail
    with pytest.raises(sqlite3.IntegrityError):
        cursor.execute("INSERT INTO orders (order_number, user_id, total_amount) VALUES ('QC-FAIL', 999, 50.0)")

    # Inserting order item for non-existent order_id=999 must fail
    with pytest.raises(sqlite3.IntegrityError):
        cursor.execute("INSERT INTO order_items (order_id, quantity, unit_price, total_price) VALUES (999, 1, 50.0, 50.0)")

    # Inserting inventory for non-existent store_id=999 must fail
    with pytest.raises(sqlite3.IntegrityError):
        cursor.execute("INSERT INTO inventories (store_id, product_id, available_quantity) VALUES (999, 1, 50)")


def test_cascade_delete_order_removes_items_and_payments(in_memory_db):
    """Assert deleting an order cascades to order_items and payments."""
    cursor = in_memory_db.cursor()

    cursor.execute("INSERT INTO users (full_name, email, phone) VALUES ('Bob', 'bob@example.com', '+919999999999')")
    user_id = cursor.lastrowid
    cursor.execute("INSERT INTO categories (name, slug) VALUES ('Snacks', 'snacks')")
    cat_id = cursor.lastrowid
    cursor.execute("INSERT INTO products (name, slug, category_id, mrp, selling_price) VALUES ('Chips', 'chips', ?, 30.0, 25.0)", (cat_id,))
    product_id = cursor.lastrowid

    cursor.execute("INSERT INTO orders (order_number, user_id, total_amount) VALUES ('QC-1002', ?, 50.0)", (user_id,))
    order_id = cursor.lastrowid
    cursor.execute("INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, 2, 25.0, 50.0)", (order_id, product_id))
    cursor.execute("INSERT INTO payments (order_id, payment_method, amount) VALUES (?, 'CREDIT_CARD', 50.0)", (order_id,))
    in_memory_db.commit()

    # Confirm rows exist
    cursor.execute("SELECT COUNT(*) FROM order_items WHERE order_id = ?", (order_id,))
    assert cursor.fetchone()[0] == 1
    cursor.execute("SELECT COUNT(*) FROM payments WHERE order_id = ?", (order_id,))
    assert cursor.fetchone()[0] == 1

    # Delete order
    cursor.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    in_memory_db.commit()

    # Assert cascade removed items and payment
    cursor.execute("SELECT COUNT(*) FROM order_items WHERE order_id = ?", (order_id,))
    assert cursor.fetchone()[0] == 0
    cursor.execute("SELECT COUNT(*) FROM payments WHERE order_id = ?", (order_id,))
    assert cursor.fetchone()[0] == 0


def test_cascade_delete_product_removes_inventories_and_variants(in_memory_db):
    """Assert deleting a product cascades to inventories and product_variants."""
    cursor = in_memory_db.cursor()

    cursor.execute("INSERT INTO categories (name, slug) VALUES ('Beverages', 'beverages')")
    cat_id = cursor.lastrowid
    cursor.execute("INSERT INTO products (name, slug, category_id, mrp, selling_price) VALUES ('Cold Brew', 'cold-brew', ?, 150.0, 120.0)", (cat_id,))
    prod_id = cursor.lastrowid

    cursor.execute("INSERT INTO dark_stores (name, code, city) VALUES ('Koramangala Store', 'DS-BLR-02', 'Bengaluru')")
    store_id = cursor.lastrowid

    cursor.execute("INSERT INTO product_variants (product_id, sku, variant_name) VALUES (?, 'SKU-CB-250ML', '250 ml Bottle')", (prod_id,))
    cursor.execute("INSERT INTO inventories (store_id, product_id, available_quantity) VALUES (?, ?, 40)", (store_id, prod_id))
    in_memory_db.commit()

    # Delete product
    cursor.execute("DELETE FROM products WHERE id = ?", (prod_id,))
    in_memory_db.commit()

    cursor.execute("SELECT COUNT(*) FROM product_variants WHERE product_id = ?", (prod_id,))
    assert cursor.fetchone()[0] == 0
    cursor.execute("SELECT COUNT(*) FROM inventories WHERE product_id = ?", (prod_id,))
    assert cursor.fetchone()[0] == 0


def test_cascade_delete_user_removes_wallets_and_orders(in_memory_db):
    """Assert deleting a user cascades to orders and wallets."""
    cursor = in_memory_db.cursor()

    cursor.execute("INSERT INTO users (full_name, email, phone) VALUES ('Charlie', 'charlie@example.com', '+918888888888')")
    user_id = cursor.lastrowid
    cursor.execute("INSERT INTO wallets (user_id, balance) VALUES (?, 250.0)", (user_id,))
    cursor.execute("INSERT INTO orders (order_number, user_id, total_amount) VALUES ('QC-1003', ?, 200.0)", (user_id,))
    in_memory_db.commit()

    # Delete user
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    in_memory_db.commit()

    cursor.execute("SELECT COUNT(*) FROM wallets WHERE user_id = ?", (user_id,))
    assert cursor.fetchone()[0] == 0
    cursor.execute("SELECT COUNT(*) FROM orders WHERE user_id = ?", (user_id,))
    assert cursor.fetchone()[0] == 0


def test_data_validator_multi_table_fk_checks():
    """Verify DataValidator.validate_foreign_key_integrity across multiple synthetic table datasets."""
    users = [{"id": 1}, {"id": 2}, {"id": 3}]
    orders = [
        {"id": 101, "user_id": 1, "store_id": 10},
        {"id": 102, "user_id": 2, "store_id": 20},
        {"id": 103, "user_id": 3, "store_id": 10},
    ]
    stores = [{"id": 10}, {"id": 20}]
    order_items = [
        {"id": 1, "order_id": 101, "product_id": 501},
        {"id": 2, "order_id": 102, "product_id": 502},
        {"id": 3, "order_id": 103, "product_id": 501},
    ]
    products = [{"id": 501}, {"id": 502}]

    # Orders -> Users FK
    res_orders_users = DataValidator.validate_foreign_key_integrity(orders, "user_id", users, "id")
    assert res_orders_users.passed is True

    # Orders -> Stores FK
    res_orders_stores = DataValidator.validate_foreign_key_integrity(orders, "store_id", stores, "id")
    assert res_orders_stores.passed is True

    # Order Items -> Orders FK
    res_items_orders = DataValidator.validate_foreign_key_integrity(order_items, "order_id", orders, "id")
    assert res_items_orders.passed is True

    # Order Items -> Products FK
    res_items_products = DataValidator.validate_foreign_key_integrity(order_items, "product_id", products, "id")
    assert res_items_products.passed is True

    # Orphan order item injection
    bad_items = [{"id": 4, "order_id": 999, "product_id": 501}]
    res_bad = DataValidator.validate_foreign_key_integrity(bad_items, "order_id", orders, "id")
    assert res_bad.passed is False
    assert res_bad.details["orphan_count"] == 1
