# QuickCart Data Pipeline Architecture & Engineering Specification

This document details the end-to-end data pipeline, streaming topologies, ingestion flows, storage tiers, and data governance policies powering the QuickCart 10-minute hyperlocal delivery ecosystem.

---

## 1. High-Level Data Architecture

```
[ Customer Apps / Web ]       [ Rider GPS App ]
          │                           │
          ▼                           ▼
[ Spring Boot API (8081) ]   [ Go Spatial Service (8085) ]
          │                           │
   Transactional                      │ Real-time Stream
   Outbox / Events                    ▼
          ▼                    [ Apache Kafka ]
  ┌───────────────────────────────────┴───────────────────────────────────┐
  │                                                                       │
  ▼                                                                       ▼
[ topic: order-events ]                                         [ topic: telemetry-events ]
  │                                                                       │
  ├───────────────────────────────────┬───────────────────────────────────┤
  ▼                                   ▼                                   ▼
[ Python AI Engine (8082) ]  [ Real-Time Analytics / Redis ]     [ Data Lake / Warehouse ]
  - Demand Forecasting          - Live Heatmaps                     - Bronze / Silver / Gold
  - Dynamic Pricing             - SLA Monitors                      - Historical BI
```

---

## 2. Event Topics & Schema Contracts

| Topic Name | Producer | Partition Key | Schema / Serialization | Consumer Groups |
|---|---|---|---|---|
| `quickcart.orders.lifecycle` | Spring Boot Backend | `orderId` | JSON / Avro (`OrderEventDTO`) | `quickcart-ai-demand`, `quickcart-notifications`, `quickcart-dwh-sink` |
| `quickcart.telemetry.gps` | Go Spatial Service | `riderId` | Protobuf (`RiderLocation`) | `quickcart-spatial-indexer`, `quickcart-eta-calculator` |
| `quickcart.inventory.updates` | Spring Boot Backend | `darkStoreId:sku` | JSON (`InventoryEventDTO`) | `quickcart-search-syncer`, `quickcart-reorder-engine` |
| `quickcart.pricing.signals` | Python AI Engine | `darkStoreId` | JSON (`SurgeMultiplierSignal`) | `quickcart-pricing-gateway` |

---

## 3. Transactional Outbox & CDC (Change Data Capture) Pattern

To ensure **Dual-Write Consistency** between PostgreSQL and Apache Kafka:
1. **Outbox Table**: Whenever an order status changes or a payment succeeds, the transaction writes to the operational table and the `outbox_events` table within a single ACID transaction.
2. **Debezium CDC Connector**: Reads PostgreSQL Write-Ahead Logs (`pg_wal`) and streams changes directly into Kafka with zero application-level polling latency.
3. **Idempotent Consumers**: Every consumer verifies event uniqueness using `eventId` + Redis deduplication cache with a 24-hour TTL.

---

## 4. Dead-Letter Queue (DLQ) & Resilience Policy

Failure handling follows a multi-tier exponential backoff and isolation topology:

```
[ Ingest Event ] ──▶ [ Processing ] ──(Success)──▶ [ Commit Offset ]
                           │
                        (Failure)
                           ▼
                    [ Retry Topic ] (Backoff: 1s, 5s, 25s; Max 3 retries)
                           │
                     (Exhausted)
                           ▼
                    [ *.DLQ Topic ]
                           │
                  [ Alert & DLQ Replay Service ]
```

- **Retry Policy**: 3 automatic retries with exponential jitter backoff.
- **DLQ Routing**: Unrecoverable serialization or invariant errors route immediately to `${topic}.DLQ`.
- **Alerting**: Metrics exposed via Prometheus Actuator (`quickcart_dlq_messages_total`) trigger alerting thresholds.

---

## 5. Medallion Storage Tiering (Bronze / Silver / Gold)

```
Kafka Streams / CDC
        │
        ▼
[ Bronze Layer (Raw Storage) ]
  - Raw JSON/Protobuf payload dumps in Object Storage (S3/GCS/MinIO)
  - Append-only, partitioned by `year=YYYY/month=MM/day=DD/hour=HH`
        │
        ▼
[ Silver Layer (Cleaned & Conformed) ]
  - De-duplicated, schema-validated, PII-masked tabular format (Delta Lake / Parquet)
  - Fact & Dimension tables (`fact_orders`, `dim_products`, `dim_dark_stores`)
        │
        ▼
[ Gold Layer (Aggregated Business Data Marts) ]
  - Pre-aggregated metric tables optimized for BI and ML model training
  - `hourly_darkstore_demand_matrix`, `rider_sla_performance_daily`
```

---

## 6. Real-Time Demand Forecasting & Dynamic Surge Engine

The Python AI Demand Engine (`services/ai-demand-engine`) consumes real-time and historical signals:
1. **Feature Extraction**: Weather conditions, active order velocity per square kilometer, dark store inventory availability, and historical day-of-week seasonality.
2. **Inference Loop**: Predicts 15-minute forward order volumes per Dark Store Hub.
3. **Surge Feedback**: Adjusts dynamic pricing multipliers ($1.0\times$ to $1.8\times$) to balance delivery partner capacity with customer demand.

---

## 7. Data Governance, Security & Privacy

- **PII Redaction**: Customer phone numbers and exact street addresses are tokenized before emitting to analytical Kafka topics.
- **Role-Based Access Control (RBAC)**: Fine-grained access control on database replicas and data lake tables.
- **Data Retention**:
  - Operational GPS telemetry: 7 days hot in Redis/Kafka; aggregated to centroid coordinates for long-term analytics.
  - Financial & Order Records: 7 years compliance archive with immutable audit trails.
