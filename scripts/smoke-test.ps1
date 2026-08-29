# ==============================================================================
# QuickCart Production Stack Smoke Test (PowerShell for Windows)
# ==============================================================================

param (
    [string]$BackendUrl = "http://localhost:8080",
    [string]$FrontendUrl = "http://localhost:80",
    [string]$AiEngineUrl = "http://localhost:8082",
    [string]$TelemetryUrl = "http://localhost:8085",
    [string]$FlashSaleUrl = "http://localhost:8086"
)

$passed = 0
$failed = 0

function Check-Endpoint {
    param (
        [string]$Url,
        [int]$ExpectedCode,
        [string]$Description
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $statusCode = [int]$response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        } else {
            $statusCode = 0
        }
    }

    if ($statusCode -eq $ExpectedCode) {
        Write-Host "  [PASS] $Description (HTTP $statusCode)" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "  [FAIL] $Description (Expected HTTP $ExpectedCode, got $statusCode from $Url)" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "           🚀 QuickCart Polyglot Monorepo Smoke Test Suite (PowerShell)        " -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

Write-Host "1. Testing Spring Boot Backend Health Endpoint..."
Check-Endpoint -Url "$BackendUrl/actuator/health" -ExpectedCode 200 -Description "Backend Actuator Health (/actuator/health)"

Write-Host "2. Testing Backend Swagger / OpenAPI Documentation..."
Check-Endpoint -Url "$BackendUrl/swagger-ui.html" -ExpectedCode 200 -Description "Backend Swagger UI (/swagger-ui.html)"

Write-Host "3. Testing Backend Featured Products API..."
Check-Endpoint -Url "$BackendUrl/api/products/featured" -ExpectedCode 200 -Description "Featured Products API (/api/products/featured)"

Write-Host "4. Testing Backend Categories API..."
Check-Endpoint -Url "$BackendUrl/api/categories" -ExpectedCode 200 -Description "Categories API (/api/categories)"

Write-Host "5. Testing Python AI Demand Engine Health Endpoint..."
Check-Endpoint -Url "$AiEngineUrl/healthz" -ExpectedCode 200 -Description "AI Demand Engine Health (/healthz)"

Write-Host "6. Testing Go Spatial Telemetry Service Health Endpoint..."
Check-Endpoint -Url "$TelemetryUrl/healthz" -ExpectedCode 200 -Description "Go Telemetry Service Health (/healthz)"

Write-Host "7. Testing Rust Flash Sale Engine Health Endpoint..."
Check-Endpoint -Url "$FlashSaleUrl/healthz" -ExpectedCode 200 -Description "Rust Flash Sale Engine Health (/healthz)"

Write-Host "8. Testing React / Vite Frontend Server..."
Check-Endpoint -Url "$FrontendUrl" -ExpectedCode 200 -Description "Frontend Web Client Root (/)"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "Smoke Test Summary: $passed Passed, $failed Failed" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host "Smoke tests failed with $failed error(s)." -ForegroundColor Red
    exit 1
} else {
    Write-Host "All services healthy and responding as expected!" -ForegroundColor Green
    exit 0
}
