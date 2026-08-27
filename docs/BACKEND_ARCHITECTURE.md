# QuickCart Backend Architecture & System Design Guide

## 1. Architectural Overview

QuickCart Backend is an enterprise-grade, high-throughput delivery and fulfillment platform built with **Java 21**, **Spring Boot 3.3.3**, and a layered, domain-driven service architecture.

```
                    ┌────────────────────────────────────────────────────────┐
                    │                   REST API / WebSocket                  │
                    │        (Spring Security, JWT Filter, MDC Logging)      │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                    ┌──────────────────────────▼─────────────────────────────┐
                    │               Application Service Layer                │
                    │  ┌──────────────────┐  ┌─────────────────────────────┐  │
                    │  │   OrderService   │  │   StoreFulfillmentService   │  │
                    │  └────────┬─────────┘  └──────────────┬──────────────┘  │
                    │           │                           │                 │
                    │  ┌────────▼─────────┐  ┌──────────────▼──────────────┐  │
                    │  │ PricingService   │  │   InventoryService (Locks)  │  │
                    │  └────────┬─────────┘  └──────────────┬──────────────┘  │
                    │           │                           │                 │
                    │  ┌────────▼─────────┐  ┌──────────────▼──────────────┐  │
                    │  │ WalletService    │  │   OrderLifecycleHandler     │  │
                    │  └──────────────────┘  └─────────────────────────────┘  │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                    ┌──────────────────────────▼─────────────────────────────┐
                    │                Domain Events & Telemetry               │
                    │  ┌──────────────────────┐  ┌────────────────────────┐  │
                    │  │ DomainEventPublisher │  │ StructuredAuditLogger  │  │
                    │  └──────────────────────┘  └────────────────────────┘  │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                    ┌──────────────────────────▼─────────────────────────────┐
                    │              Persistence & Infrastructure              │
                    │     Spring Data JPA (PostgreSQL/H2), Flyway, Redis     │
                    └────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### A. Authoritative Server-Side Pricing Engine (`PricingService`)
- **Zero Client Trust**: All line items, item MRPs, selling prices, tax slabs, platform fees, and dynamic surge/delivery fees are calculated exclusively on the server.
- **Dynamic Delivery Fees**: Free above ₹199 threshold; distance-based tiered fee below threshold.
- **Coupon Validation**: Validates active dates, usage limits, minimum order values, and maximum discount caps.
- **QuickCash Wallet Deductions**: Verifies wallet balance and limits wallet discounts to eligible payable subtotals.

### B. Transactional Stock Reservation (`InventoryService`)
- **Pessimistic Locking**: `SELECT ... FOR UPDATE` prevents overselling during high-concurrency flash sales.
- **Two-Phase Commit Pattern**:
  1. *Checkout Phase*: Stock is reserved and locked to the order number.
  2. *Fulfillment Phase*: Stock deduction is committed on delivery, or released back to the catalog on order cancellation.

### C. Multi-Store Dark Store Fulfillment (`StoreFulfillmentService`)
- **Haversine Geolocation Engine**: Finds the closest dark store within 15 km serviceable radius.
- **Inventory Availability Check**: Ensures the selected store has adequate stock for all cart items.
- **Load Balancing**: Distributes peak dispatch loads across neighboring fulfillment centers.

### D. Idempotency & Replay Protection (`IdempotencyKeyRepository`)
- All mutating checkout requests accept a unique `idempotencyKey`.
- Replayed identical requests return previously generated order details without double-charging or duplicate inventory deduction.

### E. Structured Audit Logging & Error Tracking (`StructuredAuditLogger`, `ErrorTracker`)
- Emits structured JSON logs containing:
  - `correlationId`: Propagated from HTTP headers across microservices.
  - `userId`: Authenticated actor ID.
  - `eventType`: `ORDER_LIFECYCLE`, `FINANCIAL_LEDGER`, `SECURITY_AUDIT`.
  - `timestamp`: ISO-8601 UTC timestamp.

### F. Enterprise Secret Management (`SecretManagerService`)
- Centralized resolution for JWT secret keys, payment gateway credentials, and database secrets.
- In-memory thread-safe caching with dynamic rotation support.

---

## 3. Order Lifecycle State Machine

```
[PLACED / CONFIRMED]
       │
       ▼
  [PACKING] ──► [OUT_FOR_DELIVERY] ──► [DELIVERED] (Stock Committed, Cashback Credited)
       │                 │
       ▼                 ▼
  [CANCELLED]       [CANCELLED] (Stock Released, Wallet/Gateway Refunded)
```

---

## 4. API Endpoints & Swagger

- **Interactive Swagger UI**: `http://localhost:8081/swagger-ui.html`
- **OpenAPI v3 Spec**: `http://localhost:8081/v3/api-docs`
- **Health Check & Probes**: `http://localhost:8081/healthz`, `/actuator/health`

---

## 5. Code Quality & Linting Standards

- **Checkstyle Configuration**: [`backend/checkstyle.xml`](file:///c:/Users/HP/Desktop/new/backend/checkstyle.xml)
- **Execution Command**:
  ```bash
  cd backend && ./mvnw checkstyle:check
  ```
- **Code Coverage Gate**: Minimum 30% line coverage enforced by `jacoco-maven-plugin`.
