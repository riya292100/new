# QuickCart Polyglot Monorepo Architecture Specification

## 1. System Overview

QuickCart is an enterprise-grade 10-minute hyperlocal full-stack quick-commerce application designed for ultra-low latency grocery fulfillment, dark store order orchestration, rider spatial telemetry, and predictive demand forecasting.

```
                                  ┌───────────────────────────────┐
                                  │      React 18 / Vite SPA      │
                                  │     (PWA, Tailored CSS)       │
                                  └───────────────┬───────────────┘
                                                  │ HTTP / WebSocket (STOMP)
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │   Spring Boot 3.3 (Java 21)   │
                                  │   Virtual Threads (Loom)      │
                                  └─┬─────────────┬─────────────┬─┘
                                    │             │             │
                    ┌───────────────┘             │             └───────────────┐
                    ▼                             ▼                             ▼
       ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
       │   PostgreSQL 16 (DB)    │   │     Redis 7 (Cache)     │   │   Apache Kafka 3.7      │
       │  ACID, Flyway, Spatial  │   │ Session & Fast Locking  │   │  Event-Driven Bus       │
       └─────────────────────────┘   └─────────────────────────┘   └────────────┬────────────┘
                                                                                │
                                ┌───────────────────────────────────────────────┴───────────────────────────────┐
                                ▼                                               ▼                               ▼
                 ┌─────────────────────────────┐                 ┌─────────────────────────────┐ ┌─────────────────────────────┐
                 │ Python AI Demand Engine     │                 │ Go Spatial Telemetry Service│ │ Rust Flash Sale Engine      │
                 │ (FastAPI, Holt-Winters, ROP)│                 │ (Concurrent Haversine Grid) │ │ (Atomic Inventory, SHA-256) │
                 └─────────────────────────────┘                 └─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Microservice & Polyglot Engine Responsibilities

### 2.1 Backend Core (Java 21 / Spring Boot 3.3)
- **Virtual Threads (Project Loom)**: Configured for ultra-high I/O throughput across database and cache interactions.
- **Service Isolation**: Separation of concerns with dedicated domain services (`OrderService`, `OrderLifecycleHandler`, `OrderDtoMapper`, `CartService`, `InventoryService`, `PricingService`, `WalletService`, `SmartDeliveryAssignmentService`).
- **Resilience**: Resilience4j Circuit Breakers and Rate Limiters on payment gateways and order placement endpoints.
- **Event Streaming**: Spring Kafka integration for `order-events` and `delivery-events`.
- **Database Migrations**: Flyway versioned SQL migrations (`classpath:db/migration`).

### 2.2 Frontend Web Client (React 18 / Vite)
- **Component Design System**: Centralized design tokens and reusable components (`Header`, `ClothDetailModal`, `ProductCard`, `CartDrawer`, `LiveRadarMap`, `ErrorBoundary`).
- **Service Layer**: Modularized API clients (`apiClient.js`, `authService.js`, `productService.js`, `cartService.js`, `orderService.js`, `userService.js`).
- **Error Handling**: `errorHandler.js` normalization with correlation IDs, category detection, user-friendly messages, and exponential-backoff retries.

### 2.3 Python AI Demand Forecasting Engine (FastAPI)
- **Demand Forecasting**: Moving Average, Single & Double Exponential Smoothing (Holt-Winters), Safety Stock, and Reorder Point (ROP) algorithms.
- **Dynamic Surge Pricing**: Computes load-based multipliers (1.0x to 2.5x) based on driver capacity and unassigned backlog.
- **Market Basket Recommender**: Frequent itemset co-occurrence recommendations.

### 2.4 Go Real-Time Spatial Telemetry Service
- **Spatial Tracking**: Thread-safe in-memory spatial index tracking driver GPS coordinates.
- **Proximity Search**: Haversine distance algorithm calculating nearby available riders within configured radius (km).
- **Concurrency**: Go goroutines and `sync.RWMutex` for lock contention minimization under heavy telemetry ingestion.

### 2.5 Rust Flash Sale & Cryptographic Receipt Signing Engine (Actix-Web)
- **Atomic Stock Claims**: High-throughput in-memory atomic counter allocations for time-limited flash deals.
- **Cryptographic Receipts**: SHA-256 HMAC cryptographic signing of finalized order receipts with tamper-evident audit trails.

---

## 3. Communication & Data Flow

1. **Order Placement**: Client sends request -> Spring Boot validates via Bean Validation -> Locks inventory in Redis/PostgreSQL -> Emits `OrderPlacedEvent` to Kafka -> Triggers delivery assignment via `SmartDeliveryAssignmentService` -> Returns immediate confirmation.
2. **Delivery Tracking**: Driver mobile client updates GPS -> Go Telemetry Service tracks spatial coordinates -> Spring Boot streams live status to customer via WebSocket STOMP / SSE.
3. **Demand Reordering**: Scheduled batch triggers Python AI Engine -> Calculates sales velocity and safety stock -> Generates replenishment alerts for dark store inventory managers.

---

## 4. Centralized Observability & Structured Error Tracking

QuickCart incorporates end-to-end distributed observability and structured error tracking:

1. **Spring Boot Core Backend**:
   - Integrated with Sentry APM (`io.sentry:sentry-spring-boot-starter-jakarta`) wired via `com.quickcart.config.SentryConfig`.
   - Activated via `SENTRY_DSN` environment variable; automatically disabled in test profiles (`spring.profiles.active=test`) for zero-network test hermeticity.
   - Structured JSON logging via SLF4J / Logback with MDC correlation IDs (`correlationId`, `traceId`, `userId`).

2. **Python AI Demand Engine**:
   - Integrated with `sentry-sdk` in `app/main.py`, guarded by `SENTRY_DSN`.
   - Structured JSON logging with `structlog` propagating `request_id` context vars and duration metrics.

3. **Frontend PWA Client**:
   - Centralized structured logging (`logger.js`) with automatic PII and sensitive token sanitization.
   - Boundary error catching with `ErrorBoundary.jsx` dispatching to Sentry when `VITE_SENTRY_DSN` is configured.
   - Client-side metrics and health monitoring via `metrics.js` capturing Core Web Vitals and API latency percentiles.
   - Client-side boundary schema validation (`validation.js`) enforcing structure and types on all incoming catalog and dining payloads.
