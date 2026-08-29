# Changelog

All notable changes to the **QuickCart** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-08-29

### Added
- **Centralized Enterprise Error Handler** (`frontend/src/utils/errorHandler.js`):
  - Structured categorization (`NETWORK`, `AUTHENTICATION`, `AUTHORIZATION`, `VALIDATION`, `NOT_FOUND`, `SERVER`, `CLIENT`, `UNKNOWN`).
  - Correlation ID generation and tracking (`ERR-XXXX-XXXX`).
  - Safe, user-friendly error messages that prevent leaking raw stack traces.
  - `withRetry` exponential-backoff wrapper for safe and idempotent operations.
  - Comprehensive Vitest unit test suite (`frontend/src/utils/__tests__/errorHandler.test.js`).
- **Modular Frontend Service Layer** (`frontend/src/services/`):
  - `apiClient.js`: Centralized Axios client with request/response interceptors, automatic JWT injection, and unified error handling.
  - `authService.js`: Authentication, registration, token management, and profile retrieval.
  - `productService.js`: Product catalog queries, categories, suggestions, and customer reviews.
  - `cartService.js`: Cart operations, line-item quantity adjustments, and coupon validation.
  - `orderService.js`: Order placement, history, tracking, payment initiation, and payment verification.
  - `userService.js`: Address management, QuickCash wallet balance, and transaction history.
  - Backwards-compatible `api.js` re-exporting all service operations.
- **Polyglot Service Health & Readiness Probes**:
  - Registered `/health`, `/healthz`, `/ready`, `/readyz` endpoints across Go Spatial Telemetry Service (`services/telemetry-service/main.go`).
  - Registered `/health`, `/healthz`, `/ready`, `/readyz` endpoints across Rust Flash Sale Engine (`services/flash-sale-engine/src/main.rs`).
- **Automated Smoke Testing Suite**:
  - `scripts/smoke-test.sh`: POSIX bash script validating health probes, catalog endpoints, and frontend availability across all containers.
  - `scripts/smoke-test.ps1`: Windows PowerShell equivalent for native Windows local verification.
- **Comprehensive Documentation Suite**:
  - `docs/architecture.md`: Complete polyglot microservice architecture, data flows, and concurrency models.
  - `docs/development.md`: Local development guide for clean clones.
  - `docs/testing.md`: QA strategy, coverage threshold gates, and test isolation architecture.
  - `docs/deployment.md`: Container topology, multi-stage Docker builds, and deployment instructions.
  - `docs/security.md`: Authentication, JWT security, password hashing, rate limiting, and log masking.
  - `docs/troubleshooting.md`: Operational runbook, diagnostics matrix, and failure recovery.
  - `docs/data-engineering.md`: Demand forecasting mathematics, safety stock models, and data pipeline invariants.

### Fixed
- **Docker Hardening**:
  - Removed `|| true` workaround from `services/telemetry-service/Dockerfile`.
  - Added non-root unprivileged execution user (`appuser:appgroup`) to Go telemetry container.
- **Frontend Test Suite Expansion**:
  - Expanded frontend unit tests to 73 test suites and 169 passing tests (100% PASS).

---

## [1.9.0] - 2026-08-28

### Added
- **Structured Client-Side Logging Engine** (`frontend/src/utils/logger.js`):
  - Structured output payload `{ timestamp, level, module, message, context }` with ISO-8601 timestamps.
  - Automated recursive redaction for sensitive keys (`password`, `token`, `secret`, `creditCard`, `cvv`, `apiKey`, `authorization`, `pin`).
  - Safe Error object serialization (`name`, `message`, `stack`, `errorMessage`, `errorName`) and circular reference protection.
  - Comprehensive unit test suite (`frontend/src/utils/__tests__/logger.test.js`).
- **Declarative Schema Validation Engine** (`frontend/src/utils/validation.js`):
  - Standardized validation schemas: `loginSchema`, `registerSchema`, `addressSchema`, `checkoutSchema`, `couponSchema`, `tableBookingSchema`, and `reviewSchema`.
  - Validators for RFC 5322 email, alphanumeric passwords, E.164 / 10-digit phone, postal pincode, positive numbers, and HTML/XSS sanitization.
  - Unit test suite (`frontend/src/utils/__tests__/validation.test.js`) verifying positive, negative, and edge validation cases.
- **Resilient ErrorBoundary** (`frontend/src/components/ErrorBoundary.jsx`):
  - Captures uncaught component render exceptions and reports structured telemetry to `logger.error`.
  - Configurable custom fallback render prop and recovery reset actions (`Reload Page`, `Back to Store`).
  - Optional telemetry monitoring integration (`VITE_SENTRY_DSN`) behind safe environment configuration.
  - Unit test suite (`frontend/src/components/__tests__/ErrorBoundary.test.jsx`).
- **Backend Health & Actuator Security Hardening**:
  - Configured explicit Spring Security `requestMatchers` in `WebSecurityConfig.java` to permit `/health`, `/api/health`, `/health/liveness`, `/health/readiness`, `/actuator/health`, and `/actuator/info`.
  - Hardened Actuator endpoint exposure and set `show-details: when-authorized` for production safety.
- **Design Tokens & Component CSS Modularization**:
  - Declared full design token system in `frontend/src/styles/tokens.css` (color scales, spacing units, border radii, elevation shadows, transitions).
  - Enriched `frontend/src/styles/components.css` with reusable component classes (`.qc-card`, `.qc-modal-container`, `.qc-drawer-header`, `.qc-drawer-footer`, `.qc-address-form-container`, `.qc-error-boundary-wrap`).
  - Refactored `ProfilePage.jsx` into modular subcomponents: `AddressForm.jsx` and `AddressBookList.jsx`.
- **Enforced Frontend & Backend Quality Gates**:
  - Frontend: 72 test suites, 158 tests passing (100% PASS), ESLint 0 errors, Prettier 100% compliant, V8 coverage passing (Statements: 84.8%, Lines: 84.8%, Branches: 68.9%, Functions: 50.6%).
  - Backend: 119 unit & integration tests passing (100% PASS) with JaCoCo code coverage report generation.
  - CI/CD workflow (`.github/workflows/ci.yml`) updated with unified, detectable test and coverage steps.
  - Dependabot (`.github/dependabot.yml`) configured for root npm, frontend npm, backend Maven, and GitHub Actions.

---

## [1.8.0] - 2026-08-26

### Added
- **Rust Flash Sale & Cryptographic Receipt Engine** (`services/flash-sale-engine`):
  - High-performance, zero-garbage-collection Rust microservice built on **Actix-Web** and **Tokio**.
  - **Lock-Free Atomic CAS Inventory Claiming**: Sub-millisecond atomic token allocation and remaining stock decrementing (`src/allocator.rs`).
  - **Per-User Quota & Anti-Bot Throttle**: Thread-safe per-user claim limits preventing stock monopolization.
  - **HMAC-SHA256 Cryptographic Receipt Signing**: Digital invoice integrity signer producing tamper-proof signature proofs (`src/signer.rs`).
  - **Pre-Seeded Flash Sale Catalog**: Seeded 80% discount flash deals with automated expiration timelines.
  - **Unit Test Suite**: Full cargo test suite verifying atomic claims, quota enforcement, and cryptographic verification (`src/tests.rs`).
  - **Multi-Stage Docker & CI/CD**: Optimized Alpine container image and GitHub Actions `rust-ci` workflow running `cargo test --verbose` and `cargo check`.

---

## [1.7.0] - 2026-08-26

### Added
- **Polyglot Microservice Architecture**:
  - **Python 3.12 / FastAPI AI Demand Engine** (`services/ai-demand-engine`):
    - Moving Average, Holt-Winters Exponential Smoothing, Safety Stock calculation, and Reorder Point (ROP) estimation.
    - Real-time dynamic surge pricing elasticity multiplier.
    - Market basket frequent co-occurrence recommender.
  - **Go 1.22+ Spatial Telemetry Service** (`services/telemetry-service`):
    - Thread-safe in-memory rider GPS telemetry store.
    - Sub-millisecond Haversine distance proximity searches for nearby couriers.
