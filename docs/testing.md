# QuickCart Testing Strategy & Quality Assurance

QuickCart employs a multi-tiered automated testing pyramid ensuring high confidence, strict regression prevention, and isolated test execution.

---

## 1. Test Execution Commands

### 1.1 Frontend (Vitest & React Testing Library)
```bash
# Run all frontend tests
npm --prefix frontend run test

# Run tests with coverage and threshold enforcement
npm --prefix frontend run coverage

# Run linting and formatting checks
npm --prefix frontend run lint
npm --prefix frontend run format:check
```

**Coverage Enforcement Gate**:
Vitest is configured with hard threshold gates in `frontend/vite.config.js`:
- Lines: ≥ 70%
- Branches: ≥ 60%
- Functions: ≥ 70%
- Statements: ≥ 70%

### 1.2 Backend (JUnit 5, Mockito, JaCoCo, H2)
```bash
cd backend
./mvnw clean test -Dspring.profiles.active=test
```

**Test Isolation Guarantee**:
- All unit and integration tests run against an in-memory H2 PostgreSQL-compatible database.
- Redis, Kafka, and Flyway autoconfigurations are excluded in `application-test.yml` so that tests execute in under 90 seconds without requiring external running containers or network resources.
- External payment providers (`PaymentGatewayService`) and SMS/Email dispatchers (`NotificationService`) use Mockito test doubles.

### 1.3 Python AI Engine & Data Pipeline (Pytest & Pytest-Cov)
```bash
# AI Demand Engine tests
cd services/ai-demand-engine
python -m pytest tests -v --cov=app --cov-report=term-missing

# Data Pipeline validation tests
cd ../data-pipeline
python -m pytest tests -v
```

### 1.4 Go Spatial Telemetry Service
```bash
cd services/telemetry-service
go test -v -race ./...
go vet ./...
```

### 1.5 Rust Flash Sale Engine
```bash
cd services/flash-sale-engine
cargo test --verbose
cargo clippy -- -D warnings
```

---

## 2. Testing Levels & Matrix

| Ecosystem | Framework | Focus Area | Isolation Strategy |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vitest + JSDOM | UI Components, Custom Hooks, Reducers, Services | Mock Service Worker / Vi Spies |
| **Backend** | JUnit 5 + Mockito | Domain Rules, Order Lifecycle, Concurrency | In-Memory H2 DB, Disabled Kafka/Redis |
| **AI Demand**| Pytest + Pydantic | Smoothing math, Reorder Point, Surge Multipliers | Pure unit tests & Mock HTTP clients |
| **Data Pipeline**| Pytest | Schema invariants, NULL checks, Range validation | In-memory data frames & test fixtures |
| **Telemetry**| Go testing | Haversine distance, Concurrent spatial locking | Race detector (`-race`), subtests |
| **Flash Sale**| Rust test | Stock allocation idempotency, HMAC signing | Unit & integration tests |
