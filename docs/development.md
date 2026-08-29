# QuickCart Local Development Guide

This guide describes how to run and test QuickCart services locally on a fresh clone.

---

## 1. Prerequisites

- **Java**: OpenJDK 21 (Temurin / JetBrains Runtime)
- **Node.js**: Node 20+ / Node 22 (with npm)
- **Python**: Python 3.12+ (with pip)
- **Go**: Go 1.22+ (optional for native telemetry development)
- **Rust**: Cargo 1.80+ (optional for native flash-sale development)
- **Docker & Docker Compose**: Optional for full containerized stack

---

## 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Generate secure secrets for local development:
```bash
# JWT Secret
openssl rand -hex 32

# DB Password
openssl rand -base64 24
```

---

## 3. Running Services Locally

### 3.1 Frontend (React / Vite)
```bash
cd frontend
npm ci
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 3.2 Backend (Spring Boot / Java 21)
```bash
cd backend
./mvnw clean spring-boot:run
```
Backend API will be accessible at `http://localhost:8080`. Swagger documentation is available at `http://localhost:8080/swagger-ui.html`.

### 3.3 Python AI Demand Engine
```bash
cd services/ai-demand-engine
python -m pip install -r requirements.lock
uvicorn app.main:app --host 0.0.0.0 --port 8082 --reload
```

### 3.4 Go Spatial Telemetry Service
```bash
cd services/telemetry-service
go run main.go
```

### 3.5 Rust Flash Sale Engine
```bash
cd services/flash-sale-engine
cargo run
```

---

## 4. Running with Docker Compose

To spin up the entire polyglot stack including PostgreSQL, Redis, and Kafka:

```bash
docker compose build --no-cache
docker compose up -d
docker compose ps
```

Verify service health via the automated smoke test script:
```bash
# POSIX (Linux / macOS)
bash scripts/smoke-test.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
```
