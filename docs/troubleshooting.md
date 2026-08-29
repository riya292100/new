# QuickCart Troubleshooting & Operational Runbook

This runbook provides diagnostic commands and remediation steps for common operational scenarios.

---

## 1. Common Issues & Diagnoses

### 1.1 Backend Fails to Start (Database Connection Refused)
**Symptom**: `HikariPool-1 - Connection is not available, request timed out after 30000ms.`
**Diagnosis**: PostgreSQL is not yet ready or reachable at `SPRING_DATASOURCE_URL`.
**Fix**:
1. Check database container status:
   ```bash
   docker compose ps postgres-db
   docker compose logs postgres-db
   ```
2. Verify connectivity:
   ```bash
   pg_isready -h localhost -p 5432 -U quickcart_user -d quickcart_db
   ```

### 1.2 Frontend Shows Network Error on API Calls
**Symptom**: `[apiClient] NETWORK error: Unable to connect.`
**Diagnosis**: Backend server is not running on configured port or Vite proxy is misconfigured.
**Fix**:
1. Verify backend port:
   ```bash
   curl -I http://localhost:8080/actuator/health
   ```
2. Ensure `VITE_API_BASE_URL` in `.env` matches the backend host:
   ```bash
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

### 1.3 Redis Connection Timeouts
**Symptom**: `RedisConnectionFailureException: Unable to connect to Redis`
**Diagnosis**: Redis container is down or port 6379 is blocked.
**Fix**:
1. Check Redis status:
   ```bash
   docker compose logs redis
   redis-cli -h localhost -p 6379 ping
   ```

### 1.4 Kafka Consumer Rebalance & Outages
**Symptom**: Kafka messages not consumed by background workers.
**Diagnosis**: Kafka KRaft broker initializing or topic not partitioned properly.
**Fix**:
1. Check Kafka topics:
   ```bash
   docker exec -it quickcart-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list
   ```
2. Verify consumer group lag:
   ```bash
   docker exec -it quickcart-kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group quickcart-group
   ```

---

## 2. Health Check Diagnostic Matrix

```bash
# Backend Health
curl -s http://localhost:8080/actuator/health | jq .

# AI Engine Health
curl -s http://localhost:8082/healthz | jq .

# Telemetry Service Health
curl -s http://localhost:8085/healthz | jq .

# Flash Sale Engine Health
curl -s http://localhost:8086/healthz | jq .
```
