$ErrorActionPreference = "Stop"
Write-Host "Building production frontend bundle..." -ForegroundColor Yellow
& npm.cmd --prefix frontend run build
if ($LASTEXITCODE -ne 0) { exit 1 }

$tempDir = Join-Path $env:TEMP "gh-pages-deploy"
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $tempDir | Out-Null
Copy-Item -Recurse "frontend\dist\*" $tempDir
Copy-Item "frontend\dist\index.html" (Join-Path $tempDir "404.html")
New-Item -ItemType File -Path (Join-Path $tempDir ".nojekyll") | Out-Null

Push-Location $tempDir
try {
    git init
    git checkout -b gh-pages
    git config user.name "QuickCart Bot"
    git config user.email "bot@quickcart.app"
    git add -A
    git commit -m "Deploy QuickCart live to gh-pages"
    git remote add origin "https://github.com/riya292100/new.git"
    git push -f origin gh-pages
    Write-Host "Deployed to gh-pages branch successfully!" -ForegroundColor Green
} finally {
    Pop-Location
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
