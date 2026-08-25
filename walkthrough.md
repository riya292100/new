# 🚀 QuickCart — Enterprise Full-Stack Backend & Architecture Upgrade

## 🌟 Executive Summary
QuickCart has been upgraded from a grocery delivery demo into an enterprise-grade **Java 21 + Spring Boot 3 quick-commerce platform**. The backend now incorporates multi-store dark store geo-fulfillment, thread-safe inventory locking under high concurrency, double-entry financial ledgers, audit timeline state machines, return & refund inspection workflows, customer support SLA management, and intelligent product recommendation engines.

---

## 🛠️ Key Modules Implemented

### 1. Multi-Store Dark Store Fulfillment Engine
- **Geospatial Geo-Allocation**: Implemented `StoreFulfillmentService` using the Haversine spherical distance calculation to automatically rank and assign orders to the optimal regional dark store hub based on customer distance, store service radius, stock availability across all cart items, and dynamic workload load ratios.
- **Dark Store Capacity & Operating Hours**: Modelled `DarkStore` capacity (`maxCapacityOrdersPerHour`, `currentOrderLoad`, `operatingHours`, `managerEmail`).
- **Seeded Regional Hubs**: Added regional dark stores across Delhi Central, Bangalore Koramangala, Bangalore Indiranagar, and Mumbai Bandra.

### 2. Advanced Security & Multi-Role RBAC
- **Account Lockout Protection**: Prevents brute-force attacks by locking accounts after 5 failed password attempts for 15 minutes (`User.recordFailedLogin()`, `User.isAccountLocked()`).
- **Password Reset & Email Verification**: Added token-based password reset flows (`/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password-confirm`) and verification endpoints (`/api/v1/auth/verify-email`, `/api/v1/auth/resend-verification`).
- **Granular RBAC**: Added support for `ROLE_STORE_MANAGER` and `ROLE_SUPPORT_AGENT` alongside `ROLE_CUSTOMER`, `ROLE_DELIVERY_PARTNER`, and `ROLE_ADMIN`.

### 3. Immutable Financial Ledger & Double-Entry Accounting
- **Append-Only Ledger**: Created `FinancialLedgerEntry` and `FinancialLedgerService` capturing double-entry financial movements across `PAYMENT`, `REFUND`, `WALLET_CREDIT`, `WALLET_DEBIT`, `LOYALTY_CASHBACK`, and `COUPON_DISCOUNT`.
- **Compensating Reversals**: Supports `recordCompensatingEntry` ensuring audit compliance without modifying historical transactions.
- **Admin Ledger Stream**: High-performance paginated stream exposed at `GET /api/v1/admin/financial-ledger`.

### 4. Order State Machine & Audit Timeline
- **State Transition Audit**: Implemented `OrderStateHistory` capturing order ID, from-status, to-status, actor username/system, reason, and timestamps.
- **Order Timeline Endpoint**: Exposed `GET /api/v1/orders/{id}/timeline` for real-time customer and staff visibility into order lifecycles.

### 5. Returns & Refunds Inspection Lifecycle
- **End-to-End Return State Machine**: `ReturnRequest` entity supporting `REQUESTED` ➔ `APPROVED` ➔ `PICKUP_SCHEDULED` ➔ `RECEIVED` ➔ `INSPECTED` ➔ `REFUND_PENDING` ➔ `REFUNDED` / `REJECTED`.
- **Validation Rules**: Enforces delivery status validation and a 7-day return window.
- **Automated Refund Disbursement**: Automatically refunds customer wallet balances and triggers payment gateway refunds upon inspection approval.
- **Endpoints**: `POST /api/v1/returns`, `GET /api/v1/returns/my-returns`, `GET /api/v1/returns/admin`, `PATCH /api/v1/returns/admin/{id}/status`.

### 6. Customer Support Ticketing System
- **SLA Engine**: Dynamic SLA calculation based on ticket priority (`URGENT` = 2h, `HIGH` = 6h, `MEDIUM` = 12h, `LOW` = 24h).
- **Threaded Communication**: Supports customer replies and staff-only internal notes (`TicketMessage.isInternalNote`).
- **Endpoints**: `POST /api/v1/support/tickets`, `GET /api/v1/support/tickets/my-tickets`, `GET /api/v1/support/tickets/{id}`, `POST /api/v1/support/tickets/{id}/messages`, `GET /api/v1/support/tickets/admin`, `PATCH /api/v1/support/tickets/admin/{id}/status`.

### 7. Recommendations & Verified Reviews
- **Frequently Bought Together**: Co-occurrence graph analyzing multi-item cart patterns from historical orders (`GET /api/v1/recommendations/frequently-bought-together`).
- **Similar & Trending Items**: Category/brand matching and velocity ranking (`GET /api/v1/recommendations/similar`, `GET /api/v1/recommendations/trending`).
- **Verified Purchase Reviews**: Enforces delivered order verification before review submission.

---

## 🧪 Verification & Testing Results

| Test Suite | Metric | Result |
|---|---|---|
| **Backend Unit & Concurrency Tests (Maven / JUnit 5)** | 88 tests | **88 / 88 PASSED (100% BUILD SUCCESS)** |
| **Inventory Concurrency Stress Test** | 100 threads on 20 stock | **20 Succeeded, 80 Rejected (0 Overselling)** |
| **Frontend Vitest Suite** | 62 test files, 120 tests | **120 / 120 PASSED (100% PASS)** |
| **Frontend Production Build (Vite)** | 1,776 modules transformed | **Built in 8.98s (0 Errors)** |
| **Live Backend API Verification** | Health, Auth, Stores, Tickets, Ledger | **Verified via HTTP / JWT on port 8081** |

---

## 📦 Git Commits & Remote Sync
- **Commit `6d8924c`**: `feat(backend): upgrade to enterprise multi-store fulfillment, double-entry financial ledger, returns, support ticketing & concurrency controls`
- **Pushed to GitHub**: `https://github.com/riya292100/new.git` on branch `main`.
