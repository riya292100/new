# QuickCart Data Lineage & End-to-End Pipeline Graph

## 1. End-to-End Lineage Flow

```mermaid
graph TD
    subgraph OperationalSources["1. Operational Transactional Sources (OLTP)"]
        PG_Orders[("PostgreSQL: orders")]
        PG_Items[("PostgreSQL: order_items")]
        PG_Inv[("PostgreSQL: inventories")]
        PG_Stores[("PostgreSQL: dark_stores")]
        PG_Users[("PostgreSQL: users")]
        Go_GPS["Go Telemetry: Live Rider GPS (Protobuf)"]
    end

    subgraph IngestionStreaming["2. Ingestion & Change Data Capture (CDC)"]
        Debezium["Debezium WAL CDC Connector"]
        Kafka_Orders["Kafka: quickcart.orders.lifecycle"]
        Kafka_Inv["Kafka: quickcart.inventory.updates"]
        Kafka_GPS["Kafka: quickcart.telemetry.gps"]
    end

    subgraph MedallionBronze["3. Bronze Storage (Immutable Raw Logs)"]
        S3_RawOrders["Bronze: Raw Order JSON"]
        S3_RawInv["Bronze: Raw Inventory Events"]
        S3_RawGPS["Bronze: Raw GPS Telemetry"]
    end

    subgraph DBTStaging["4. Silver Layer (dbt Staging Views & Cleaned Entities)"]
        stg_orders["stg_orders (View)"]
        stg_order_items["stg_order_items (View)"]
        stg_products["stg_products (View)"]
        stg_stores["stg_stores (View)"]
    end

    subgraph DBTMarts["5. Gold Layer (dbt Analytical Marts & Feature Store)"]
        fct_order_fulfillment["fct_order_fulfillment (Table)"]
        fct_hourly_demand["fct_hourly_demand (Table)"]
        dim_products["dim_products (Table)"]
        dim_customers["dim_customers (Table)"]
    end

    subgraph DownstreamConsumers["6. Analytical & Operational Consumers"]
        FastAPI_AI["Python AI Engine: Demand Forecaster & Surge Optimizer"]
        Redis_FeatureStore[("Redis: Real-time Feature Store")]
        BI_Dashboards["Executive SLA & Operations Dashboards"]
        Inventory_Alerts["Automated Dark Store Reorder Dispatcher"]
    end

    PG_Orders -->|WAL Stream| Debezium
    PG_Items -->|WAL Stream| Debezium
    PG_Inv -->|WAL Stream| Debezium
    Debezium --> Kafka_Orders
    Debezium --> Kafka_Inv
    Go_GPS --> Kafka_GPS

    Kafka_Orders --> S3_RawOrders
    Kafka_Inv --> S3_RawInv
    Kafka_GPS --> S3_RawGPS

    S3_RawOrders --> stg_orders
    S3_RawOrders --> stg_order_items
    S3_RawInv --> stg_products
    PG_Stores --> stg_stores

    stg_orders --> fct_order_fulfillment
    stg_order_items --> fct_order_fulfillment
    stg_stores --> fct_order_fulfillment

    stg_orders --> fct_hourly_demand
    stg_order_items --> fct_hourly_demand

    stg_products --> dim_products

    fct_hourly_demand --> Redis_FeatureStore
    Redis_FeatureStore --> FastAPI_AI
    fct_order_fulfillment --> BI_Dashboards
    dim_products --> Inventory_Alerts
```

---

## 2. Model & Table Dictionary

| Layer | Object Name | Type | Primary Key | Description | Data Tests Enforced |
|---|---|---|---|---|---|
| **Staging** | `stg_orders` | View | `order_id` | Standardized order records | `unique`, `not_null` |
| **Staging** | `stg_order_items` | View | `order_item_id` | Granular basket line items | `unique`, `not_null`, `relationships` |
| **Staging** | `stg_products` | View | `product_id` | Catalog items and prices | `unique`, `not_null` |
| **Staging** | `stg_stores` | View | `store_id` | Dark store hubs and geolocations | `unique`, `not_null` |
| **Marts** | `fct_order_fulfillment` | Table | `order_id` | Delivery SLA duration, revenue, compliance | `unique`, `not_null` |
| **Marts** | `fct_hourly_demand` | Table | `order_hour, store_id, product_id` | Aggregated sales velocity per hour | `not_null` on composite grain |
| **Marts** | `dim_products` | Table | `product_id` | Product dimension enriched with stock health | `unique`, `not_null`, `accepted_values` |

---

## 3. Data Quality & Gating Invariants

All transformations run through the [`DataValidator`](file:///c:/Users/HP/Desktop/new/services/data-pipeline/data_validator.py) engine:
1. **Zero-Null Invariants**: Mandatory fields (`order_number`, `total_amount`, `store_id`, `product_id`) must have 0% null records.
2. **Referential Integrity**: 100% of order items must map to existing orders and products.
3. **Numeric Bounds Check**: Product selling prices and order totals must be > 0.00 and <= upper anomaly thresholds.
4. **Enum Conformance**: Order statuses strictly match `['CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']`.

---

## 4. Orchestration & Scheduling

- **Orchestrator**: [`PipelineOrchestrator`](file:///c:/Users/HP/Desktop/new/services/data-pipeline/orchestrator.py) & [`Airflow DAG`](file:///c:/Users/HP/Desktop/new/services/data-pipeline/dags/quickcart_etl_dag.py).
- **Execution Interval**: Hourly (`@hourly`) with automated dependency resolution, retry policies (3 retries, exponential jitter), and telemetry logging.
