#!/usr/bin/env bash
# ==============================================================================
# QuickCart Production Stack Automated Smoke Test Script
# Validates availability, health endpoints, and core API flows across all services.
# Exits with 0 on success, non-zero on failure.
# ==============================================================================

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:80}"
AI_ENGINE_URL="${AI_ENGINE_URL:-http://localhost:8082}"
TELEMETRY_URL="${TELEMETRY_URL:-http://localhost:8085}"
FLASH_SALE_URL="${FLASH_SALE_URL:-http://localhost:8086}"

PASSED=0
FAILED=0

log_info() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_pass() {
  echo -e "\033[1;32m[PASS]\033[0m $1"
  PASSED=$((PASSED + 1))
}

log_fail() {
  echo -e "\033[1;31m[FAIL]\033[0m $1"
  FAILED=$((FAILED + 1))
}

check_http() {
  local url="$1"
  local expected_code="${2:-200}"
  local desc="$3"

  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

  if [ "$status" -eq "$expected_code" ]; then
    log_pass "$desc (HTTP $status)"
  else
    log_fail "$desc (Expected HTTP $expected_code, got $status from $url)"
  fi
}

echo "=============================================================================="
echo "           🚀 QuickCart Polyglot Monorepo Smoke Test Suite                   "
echo "=============================================================================="

log_info "1. Verifying Spring Boot Backend Health Endpoint..."
check_http "$BACKEND_URL/actuator/health" 200 "Backend Actuator Health (/actuator/health)"

log_info "2. Verifying Backend Swagger / OpenAPI Docs..."
check_http "$BACKEND_URL/swagger-ui.html" 200 "Backend Swagger UI (/swagger-ui.html)"

log_info "3. Verifying Backend Product Catalog API..."
check_http "$BACKEND_URL/api/products/featured" 200 "Backend Featured Products API (/api/products/featured)"

log_info "4. Verifying Backend Categories API..."
check_http "$BACKEND_URL/api/categories" 200 "Backend Categories API (/api/categories)"

log_info "5. Verifying Python AI Demand Engine Health Endpoint..."
check_http "$AI_ENGINE_URL/healthz" 200 "AI Demand Engine Health (/healthz)"

log_info "6. Verifying Go Spatial Telemetry Service Health Endpoint..."
check_http "$TELEMETRY_URL/healthz" 200 "Go Telemetry Service Health (/healthz)"

log_info "7. Verifying Rust Flash Sale Engine Health Endpoint..."
check_http "$FLASH_SALE_URL/healthz" 200 "Rust Flash Sale Engine Health (/healthz)"

log_info "8. Verifying React / Vite Frontend HTTP Server..."
check_http "$FRONTEND_URL" 200 "Frontend Web Client Root (/)"

echo "=============================================================================="
echo "Smoke Test Summary: $PASSED Passed, $FAILED Failed"
echo "=============================================================================="

if [ "$FAILED" -gt 0 ]; then
  log_fail "Smoke tests failed with $FAILED error(s)."
  exit 1
else
  log_pass "All services healthy and responding as expected!"
  exit 0
fi
