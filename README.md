# ⚡ QuickCart — Enterprise Full-Stack Quick-Commerce Platform

[![CI/CD Pipeline](https://github.com/riya292100/new/actions/workflows/ci.yml/badge.svg)](https://github.com/riya292100/new/actions/workflows/ci.yml)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io/)
[![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200.svg)](https://flywaydb.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**QuickCart** is an enterprise-grade, high-performance quick-commerce delivery platform built with **Java 21 / Spring Boot 3** and **React 18 / Vite**. It provides a 10-15 minute grocery, fashion, and dining experience with real-time tracking, multi-store dark store fulfillment, thread-safe inventory locking, double-entry financial ledgers, customer support SLA management, return workflows, PostgreSQL persistence, Redis caching, loyalty cashback rewards, and table dining reservations.

---

## 🌟 Architecture & Enterprise Capabilities

### 🛒 1. Multi-Store Dark Store Fulfillment Engine
- **Geospatial Store Selection**: Automatic routing of customer cart items to the optimal dark store using the Haversine spherical distance formula, store service radiuses, and dynamic workload load balancing.
- **Dark Store Capacity Management**: Real-time tracking of `currentOrderLoad`, `maxCapacityOrdersPerHour`, manager contact info, and active operating hours (`06:00 - 02:00`).
- **Pessimistic Locking & Zero Overselling**: Thread-safe stock reservations utilizing `@Lock(LockModeType.PESSIMISTIC_WRITE)` and `@Version` optimistic controls, verified under 100 concurrent threads.

### 🛡️ 2. Advanced Security & Multi-Role RBAC
- **Account Lockout & Protection**: Automatic brute-force prevention locking accounts after 5 consecutive failed attempts for 15 minutes.
- **Password Reset & Verification Tokens**: Secure cryptographic token generation (`/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password-confirm`, `/api/v1/auth/verify-email`).
- **Comprehensive RBAC**: Granular role enforcement for `ROLE_CUSTOMER`, `ROLE_STORE_MANAGER`, `ROLE_DELIVERY_PARTNER`, `ROLE_SUPPORT_AGENT`, and `ROLE_ADMIN`.

### 💰 3. Immutable Financial Ledger & Double-Entry Bookkeeping
- **Audit-Grade Ledger**: Append-only double-entry ledger (`FinancialLedgerEntry`) tracking all `PAYMENT`, `REFUND`, `WALLET_CREDIT`, `WALLET_DEBIT`, `LOYALTY_CASHBACK`, and `COUPON_DISCOUNT` movements.
- **Compensating Reversals**: Clean financial reversals that never overwrite historical records, guaranteeing audit compliance.
- **Admin Ledger Stream**: High-throughput paginated stream for finance teams at `GET /api/v1/admin/financial-ledger`.

### 📊 4. Data Engineering & Observability Pipelines
- **Hourly Sales Aggregation ETL**: Extracts transactional order streams, calculates dimensional revenue, delivery fees, discounts, and units sold (`HourlySalesAggregate`).
- **Product Demand & Velocity Scoring**: Real-time scoring formula calculating demand momentum across moving 7-day windows (`ProductDemandAggregate`).
- **Automated Data Quality Engine**: Automated rule-based anomaly detection checking for negative stock, pricing variances, and un-reconciled orders (`DataQualityReport`).
- **Automated Payment & Ledger Reconciliation**: Hourly reconciliation batch matching payment gateway transactions with orders, refunds, and double-entry ledgers.
- **Distributed MDC Correlation Tracking**: Automatic injection of `X-Correlation-ID`, `X-Request-ID`, and `X-Response-Time-Millis` across HTTP servlet filters, thread-safe asynchronous task executors, and structured logging outputs.

### 🔄 5. Order State Machine, Audit Timeline & Returns
- **Order State Timeline**: Immutable audit trail (`OrderStateHistory`) capturing timestamps, actor emails, previous states, new states, and transition reasons (`GET /api/v1/orders/{id}/timeline`).
- **Returns & Inspection Workflow**: End-to-end customer return lifecycle (`REQUESTED` ➔ `APPROVED` ➔ `PICKUP_SCHEDULED` ➔ `RECEIVED` ➔ `INSPECTED` ➔ `REFUND_PENDING` ➔ `REFUNDED` / `REJECTED`) with 7-day delivery window validation and automated refund disbursements.

### 🎫 6. Customer Support Ticketing & SLA Engine
- **Priority-Based SLA Tracking**: Auto-calculated resolution SLAs (`URGENT` = 2h, `HIGH` = 6h, `MEDIUM` = 12h, `LOW` = 24h).
- **Threaded Communication**: Interactive ticket conversations supporting both public customer-agent messages and internal staff-only notes.

---

## 🗄️ Database & Migrations

QuickCart utilizes **Flyway** for database version control and zero-downtime DDL schema migrations:
- **Migration Location**: `backend/src/main/resources/db/migration/V1__initial_schema.sql`
- **Tables Provisioned**: 20+ enterprise tables including `users`, `roles`, `products`, `categories`, `orders`, `order_items`, `inventories`, `delivery_partners`, `delivery_assignments`, `wallets`, `wallet_transactions`, `financial_ledger_entries`, `hourly_sales_aggregates`, `data_quality_reports`, and `audit_logs`.
- **Standalone Isolated Migration Testing**:
  Run Flyway tests without requiring external PostgreSQL services:
  ```bash
  cd backend
  ./mvnw test -Dtest=FlywayMigrationTest
  ```

---

## 🧪 Automated Testing & Verification

The project includes thorough unit, integration, and concurrency tests across both backend and frontend layers:

- **Backend Test Suite (Maven / JUnit 5 / Mockito / Testcontainers)**:
  - **95 / 95 tests passing (100% BUILD SUCCESS)**.
  - Concurrency validation: `InventoryConcurrencyTest` (100 concurrent threads reserving limited inventory with 0 overselling).
  - Schema & Migration validation: `FlywayMigrationTest`.
  - Domain tests: `StoreFulfillmentServiceTest`, `FinancialLedgerServiceTest`, `PaymentReconciliationServiceTest`, `DataPipelineServiceTest`, `AnalyticsEtlControllerTest`, `CorrelationIdFilterIntegrationTest`.
- **Frontend Test Suite (Vitest / Testing Library / v8 Coverage)**:
  - **123 / 123 tests passing across 68 test files (100% PASS)**.
  - Full coverage for storefront, cart drawer, checkout, QuickCash loyalty, dining booking, clothes catalog, admin dashboard, and delivery partner portals.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Java 21 JDK** (Eclipse Temurin or OpenJDK 21)
- **Node.js 20+ or 22** and **npm 10+**
- **Docker & Docker Compose** (optional)

### 1. Fresh Clone Verification (End-to-End)
```bash
# Clone the repository
git clone https://github.com/riya292100/new.git quickcart
cd quickcart

# 1. Install & Test Frontend
cd frontend
npm ci
npm run format:check
npm run lint
npm run test
npm run build

# 2. Build & Test Backend
cd ../backend
./mvnw clean test -Dspring.profiles.active=test
```

### 2. Run Full Stack via Docker Compose
```bash
docker compose up --build
```
- **Storefront & PWA**: `http://localhost:5173` (or `http://localhost:80`)
- **Backend API**: `http://localhost:8081` (or `http://localhost:8080`)
- **Swagger / OpenAPI Documentation**: `http://localhost:8081/swagger-ui.html`
- **Actuator Health & Metrics**: `http://localhost:8081/actuator/health`

---

## 🔑 Default Seeded Demo Credentials

Configurable via environment variables or `.env`:

| Role | Email | Default Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `admin@quickcart.com` | `Admin@123` | Full admin control, financial ledger, store management, inventory, coupons, drivers |
| **Store Manager** | `manager@quickcart.com` | `Admin@123` | Dark store inventory adjustments, fulfillment capacity, dispatch operations |
| **Support Agent** | `support@quickcart.com` | `Admin@123` | Customer support ticket resolution, returns inspection, refund approvals |
| **Delivery Rider** | `driver@quickcart.com` | `Driver@123` | Delivery partner portal, live GPS simulator, order accept/reject |
| **Customer** | `customer@quickcart.com` | `Customer@123` | Grocery storefront, fashion hub, QuickCash wallet, table bookings, tickets, returns |

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
