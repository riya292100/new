# ⚡ QuickCart — Enterprise Full-Stack Quick-Commerce Platform

<div align="center">

[![CI/CD Pipeline](https://github.com/riya292100/new/actions/workflows/ci.yml/badge.svg)](https://github.com/riya292100/new/actions/workflows/ci.yml)
[![CodeQL Security](https://github.com/riya292100/new/actions/workflows/codeql.yml/badge.svg)](https://github.com/riya292100/new/actions/workflows/codeql.yml)
[![Latest Release](https://img.shields.io/github/v/release/riya292100/new?color=blue&label=release)](https://github.com/riya292100/new/releases)
[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584.svg?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Go 1.22](https://img.shields.io/badge/Go-1.22-00ADD8.svg?logo=go&logoColor=white)](https://golang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-success.svg)](#-running-automated-tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<p align="center">
  <b>Enterprise-grade, polyglot quick-commerce delivery platform</b><br>
  Built with <b>Java 21 / Spring Boot 3</b> (Core & Ledger), <b>Rust</b> (Flash Sale Allocation & Cryptographic Signing), <b>Python</b> (AI Demand & Dynamic Pricing), <b>Go</b> (Spatial Driver Telemetry), and <b>React 18 / TypeScript</b> (Storefront PWA).
</p>

[Explore API Docs](http://localhost:8081/swagger-ui.html) • [Data Pipeline Architecture](docs/DATA_PIPELINE.md) • [Report Bug](https://github.com/riya292100/new/issues/new?template=bug_report.yml) • [Request Feature](https://github.com/riya292100/new/issues/new?template=feature_request.yml) • [Contributing Guide](CONTRIBUTING.md)

</div>

---

## 🚀 Fresh Clone Quickstart (Zero-Friction Setup)

QuickCart works **immediately out-of-the-box from a fresh clone**. Follow these exact steps:

```bash
# 1. Clone repository
git clone https://github.com/riya292100/new.git quickcart
cd quickcart

# 2. Copy environment template (optional - zero-config defaults are built-in)
cp .env.example .env

# 3. Install dependencies across all workspaces
npm run install:all

# 4. Run the full polyglot stack (Docker Compose or Local)
# Option A: Fullstack via Docker Compose (Recommended)
docker compose up --build

# Option B: Run locally
# In separate terminal tabs:
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev  # Port 8081
cd services/ai-demand-engine && uvicorn app.main:app --port 8082     # Port 8082
cd services/telemetry-service && go run main.go                       # Port 8085
npm run dev                                                           # Port 5173
```

---

## 📦 Deterministic Lockfiles & Package Managers

Every language toolchain and package manager in this monorepo includes a committed lockfile for 100% reproducible installs on clean environments:

| Service / Layer | Package Manager | Manifest File | Lockfile |
|---|---|---|---|
| **Root Monorepo** | `npm 10+` | [`package.json`](package.json) | [`package-lock.json`](package-lock.json) |
| **Frontend PWA** | `npm 10+` | [`frontend/package.json`](frontend/package.json) | [`frontend/package-lock.json`](frontend/package-lock.json) |
| **Core Java Backend** | `Maven 3.9+` | [`backend/pom.xml`](backend/pom.xml) | [`backend/mvnw`](backend/mvnw) / [`backend/mvnw.cmd`](backend/mvnw.cmd) |
| **AI Demand Engine** | `pip` / Python | [`services/ai-demand-engine/requirements.txt`](services/ai-demand-engine/requirements.txt) | [`services/ai-demand-engine/requirements.lock`](services/ai-demand-engine/requirements.lock) |
| **Spatial Telemetry** | `Go Modules` | [`services/telemetry-service/go.mod`](services/telemetry-service/go.mod) | [`services/telemetry-service/go.sum`](services/telemetry-service/go.sum) |
| **Flash Sale Engine** | `Cargo` | [`services/flash-sale-engine/Cargo.toml`](services/flash-sale-engine/Cargo.toml) | [`services/flash-sale-engine/Cargo.lock`](services/flash-sale-engine/Cargo.lock) |

---

## 🧪 Running Automated Tests

All tests run locally and in GitHub Actions CI with zero manual database or service provisioning required (in-memory H2 DB & standalone mocks are built-in).

### 1. Unified Monorepo Test (All Services)
```bash
# Run all frontend, backend, Python, and Go test suites in one command:
npm run test:all

# Or via Makefile:
make test-all
```

### 2. Individual Service Test Commands

#### 🌐 Frontend (React 18 / Vitest / V8 Coverage)
```bash
npm test
# or with coverage report:
npm run test:coverage
```
* **Status**: `70 test files, 135 tests passing (100% PASS)`
* **Enforced Gates**: `Lines >= 70%, Statements >= 70%, Branches >= 60%, Functions >= 70%`

#### ☕ Java Backend (Spring Boot 3 / JUnit 5 / JaCoCo / Checkstyle)
```bash
npm run test:backend
# or standalone (offline-friendly in-memory test profile):
cd backend && ./mvnw -B test -Dspring.profiles.active=test
```
* **Status**: `119 unit & integration tests passing (100% PASS)`
* **Code Quality & Linting**: `Checkstyle` enforced (`backend/checkstyle.xml`, 0 violations)
* **Architecture & Telemetry**: Detailed in [`docs/BACKEND_ARCHITECTURE.md`](docs/BACKEND_ARCHITECTURE.md) (Structured JSON audit logs, MDC correlation tracking, ErrorTracker)
* **Coverage**: JaCoCo report generated automatically at `backend/target/site/jacoco/index.html`

#### 🧠 Python AI Demand Engine (FastAPI / pytest)
```bash
npm run test:python
# or standalone:
cd services/ai-demand-engine && pytest -v
```
* **Status**: `7 / 7 tests passing (100% PASS)`

#### ⚡ Go Spatial Telemetry Service (Golang / go test)
```bash
npm run test:go
# or standalone:
cd services/telemetry-service && go test -v -race ./...
```
* **Status**: `Spatial Indexer, Concurrent GPS Ingestion, and API Tests Passing`

#### 🦀 Rust Flash Sale Engine (Actix-Web / cargo test)
```bash
npm run test:rust
# or standalone:
cd services/flash-sale-engine && cargo test
```
* **Status**: `Atomic CAS Claims & HMAC-SHA256 Token Signing Tests Passing`

---

## 🏛️ Polyglot Microservice Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["🌐 Client & Frontends (React 18 + TypeScript)"]
        PWA["PWA Storefront & Shopping Hub"]
        AdminPortal["Store Manager Command Portal"]
        DriverApp["Rider Live GPS Dispatch Portal"]
    end

    subgraph CoreBackend["☕ Core Gateway & Ledger (Java 21 / Spring Boot 3)"]
        Security["Spring Security 6 + JWT + RBAC"]
        Ledger["Double-Entry Financial Ledger"]
        Inventory["Pessimistic Inventory Locking"]
        StoreFulfillment["Dark Store Geo-Fulfillment Engine"]
    end

    subgraph RustFlashSaleService["🦀 Flash Sale & Signing Engine (Rust / Actix-Web)"]
        CASAllocator["Lock-Free Atomic CAS Stock Allocator"]
        HMACSigner["HMAC-SHA256 Receipt Integrity Signer"]
        RateLimiter["Microsecond Quota & Token Throttle"]
    end

    subgraph PythonAIService["🧠 AI Demand & Pricing Engine (Python / FastAPI)"]
        DemandML["Velocity & Safety Stock Forecaster"]
        SurgeOptimizer["Dynamic Price Elasticity Engine"]
        CoOccurrenceGraph["Cart Recommendation Matrix"]
    end

    subgraph GoTelemetryService["⚡ Rider Telemetry Service (Go 1.22+)"]
        GPSIngestion["High-Frequency Telemetry Ingestion"]
        SpatialRingFinder["Haversine Proximity Ring Index"]
        RiderTracker["Concurrent In-Memory Geo Store"]
    end

    subgraph DataPersistence["💾 Persistence & Event Layer"]
        Postgres[(PostgreSQL 16 / Flyway)]
        Redis[(Redis 7 Cache)]
        Kafka[(Apache Kafka 3.7 Streams)]
    end

    ClientLayer -->|REST / JWT| CoreBackend
    ClientLayer -->|Flash Deals & Receipts| RustFlashSaleService
    ClientLayer -->|Live GPS Telemetry| GoTelemetryService
    CoreBackend -->|REST Analytics| PythonAIService
    RustFlashSaleService -->|HMAC Verified Token| CoreBackend
    GoTelemetryService -->|Spatial Telemetry| Redis
    GoTelemetryService -->|Order Updates| Kafka
    CoreBackend --> Postgres
    CoreBackend --> Redis
    PythonAIService --> Redis
```

---

## 🌐 Polyglot Service Portfolio

| Service | Language & Stack | Port | Purpose / Capabilities |
|---|---|---|---|
| **Core API Gateway** | **Java 21 / Spring Boot 3** | `8080` / `8081` | Authentication, multi-store dark store routing, pessimistic inventory locks, and immutable double-entry ledgers. |
| **Flash Sale Engine** | **Rust 1.80+ / Actix-Web** | `8086` | Sub-millisecond atomic CAS flash sale token reservation and HMAC-SHA256 digital receipt integrity signing. |
| **AI Demand Engine** | **Python 3.12 / FastAPI** | `8082` | Exponential smoothing demand forecasting, safety stock reorder point estimation, dynamic surge price elasticity, and cart co-occurrence recommendations. |
| **Spatial Telemetry** | **Go 1.22+ / Golang** | `8085` | High-throughput concurrent rider GPS ingestion, sub-millisecond Haversine proximity searches, and ETA calculations. |
| **Storefront & PWA** | **React 18 / TypeScript / Vite** | `5173` / `80` | Hyperlocal catalog, cart drawer, QuickCash loyalty, table bookings, customer support tickets, and live driver tracking. |

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Default Password | Capabilities |
|---|---|---|---|
| **Admin** | `admin@quickcart.com` | `Admin@123` | Full administrative control, financial ledger, dark stores, inventory |
| **Store Manager** | `manager@quickcart.com` | `Admin@123` | Store-level inventory updates, dispatch operations, workload management |
| **Support Agent** | `support@quickcart.com` | `Admin@123` | Support tickets, SLA escalation, return inspections, refunds |
| **Delivery Rider** | `driver@quickcart.com` | `Driver@123` | Driver portal, GPS simulator, order acceptance and delivery completion |
| **Customer** | `customer@quickcart.com` | `Customer@123` | Storefront browsing, cart, checkout, QuickCash wallet, table bookings |

---

## 🏗️ Production Build Commands

```bash
# Build all production artifacts in one command:
npm run build:all

# Or individually:
npm run build                                       # Frontend static assets in frontend/dist
cd backend && ./mvnw clean package -DskipTests     # Backend executable JAR in backend/target
cd services/telemetry-service && go build -o server # Go binary
```

---

## 🤝 Contributing & Standards

Contributions, issues, and feature requests are welcome!
Please check [CONTRIBUTING.md](CONTRIBUTING.md) and [CODING_STANDARDS.md](CODING_STANDARDS.md) for conventions.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
