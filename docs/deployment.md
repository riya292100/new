# QuickCart Deployment & Infrastructure Guide

## 1. Containerization & Multi-Stage Builds

Every service in the QuickCart monorepo utilizes optimized multi-stage Docker builds designed for:
- **Minimal attack surface**: Minimal base images (`alpine`, `debian-slim`, `temurin-jre-alpine`).
- **Non-root execution**: Running as unprivileged application users (`spring`, `appuser`).
- **No baked-in secrets**: All credentials and keys are strictly injected via runtime environment variables.
- **Automated Health Checks**: Each container features a native `HEALTHCHECK` instruction.

---

## 2. Docker Compose Topology

| Service | Container Name | Base Image | Port | Health Check Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| `postgres-db` | `quickcart-postgres` | `postgres:16-alpine` | `5432` | `pg_isready -U quickcart_user` |
| `redis` | `quickcart-redis` | `redis:7-alpine` | `6379` | `redis-cli ping` |
| `kafka` | `quickcart-kafka` | `apache/kafka:3.7.0` | `9092` | `kafka-topics.sh --list` |
| `backend` | `quickcart-backend` | `eclipse-temurin:21-jre-alpine` | `8080` | `GET /actuator/health` |
| `frontend` | `quickcart-frontend` | `nginx:1.27-alpine` | `80`, `5173` | `GET /` |
| `ai-demand-engine` | `quickcart-ai-demand-engine` | `python:3.12-slim` | `8082` | `GET /healthz` |
| `telemetry-service` | `quickcart-telemetry-service` | `alpine:3.19` | `8085` | `GET /healthz` |
| `flash-sale-engine` | `quickcart-flash-sale-engine` | `debian:bookworm-slim` | `8086` | `GET /healthz` |

---

## 3. Production Deployment Commands

### 3.1 Build & Start
```bash
# 1. Provide production secrets in .env
# 2. Build images cleanly without stale cache
docker compose build --no-cache

# 3. Spin up services in daemon mode
docker compose up -d

# 4. Verify healthy status of all containers
docker compose ps
```

### 3.2 Automated Smoke Test Validation
```bash
bash scripts/smoke-test.sh
```

---

## 4. Remote Cloud & Sandbox Preview Environments

For remote testing and sandbox previews:
- **Emergent Cloud IDE Preview**: [https://vscode-e01a03eb-31ea-4fd5-b789-791eee6ee17c.preview.emergentagent.com/](https://vscode-e01a03eb-31ea-4fd5-b789-791eee6ee17c.preview.emergentagent.com/)
- **Session ID / Key**: `a45cbc27`
