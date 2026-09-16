@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo   QuickCart - Google Firebase Live Deployment
echo ===================================================
echo.

echo [1/3] Checking Google Firebase authentication...
call npx.cmd -y firebase-tools@latest projects:list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Google sign-in required. A browser window will open now...
    echo Please select your Google account and click Allow.
    echo.
    call npx.cmd -y firebase-tools@latest login
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Google sign-in was cancelled or failed.
        pause
        exit /b 1
    )
)

echo.
echo [2/3] Building production frontend bundle...
call npm.cmd --prefix frontend run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
)

echo.
echo [3/3] Deploying live to Google Firebase CDN...
call npx.cmd -y firebase-tools@latest deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [NOTE] If no project was selected, link your project first with:
    echo        npx.cmd -y firebase-tools@latest use ^<your-project-id^>
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   SUCCESS! QuickCart is officially live on Google!
echo ===================================================
echo.
pause
