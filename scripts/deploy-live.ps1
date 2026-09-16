<#
.SYNOPSIS
  Automated deployment script for QuickCart on Google Firebase Hosting.
.DESCRIPTION
  Checks Firebase login, triggers Google sign-in if needed, compiles the React frontend,
  and deploys to Google Firebase CDN.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId
)

$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  QuickCart - Google Firebase Live Deployment" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Firebase Authentication
Write-Host "[1/3] Checking Google authentication..." -ForegroundColor Yellow
$authCheck = & npx.cmd -y firebase-tools@latest projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Google Firebase. Launching browser login..." -ForegroundColor Magenta
    & npx.cmd -y firebase-tools@latest login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Google authentication was cancelled or failed."
        exit 1
    }
    Write-Host "Successfully authenticated!" -ForegroundColor Green
} else {
    Write-Host "Google account authenticated!" -ForegroundColor Green
}

# 2. Select Project if provided
if ($ProjectId) {
    Write-Host "Setting active project to: $ProjectId" -ForegroundColor Yellow
    & npx.cmd -y firebase-tools@latest use $ProjectId
}

# 3. Build Frontend
Write-Host ""
Write-Host "[2/3] Building production frontend bundle..." -ForegroundColor Yellow
& npm.cmd --prefix frontend run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend production build failed."
    exit 1
}
Write-Host "Frontend build successful!" -ForegroundColor Green

# 4. Deploy Live
Write-Host ""
Write-Host "[3/3] Deploying live to Google Firebase CDN..." -ForegroundColor Yellow
if ($ProjectId) {
    & npx.cmd -y firebase-tools@latest deploy --only hosting --project $ProjectId
} else {
    & npx.cmd -y firebase-tools@latest deploy --only hosting
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "  DEPLOYMENT COMPLETE! QuickCart is live on Google!" -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
}
