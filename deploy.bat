@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title QuickCart - Google Live Deployment

echo ======================================================================
echo           QuickCart - Launching Live on Google Firebase
echo ======================================================================
echo.

:: 1. Authentication Check
echo [Step 1/3] Checking Google sign-in status...
call npx.cmd -y firebase-tools@latest login:list 2>nul | findstr /i "No authorized accounts" >nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Google sign-in required! Opening browser...
    echo Please sign in with your Google account and click "Allow".
    echo.
    call npx.cmd -y firebase-tools@latest login
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Google sign-in failed or was cancelled.
        echo.
        pause
        exit /b 1
    )
) else (
    echo Successfully signed in to Google!
)

:: 2. Project Selection
echo.
echo [Step 2/3] Checking Firebase project configuration...
if not exist ".firebaserc" (
    echo.
    echo Here are your Google Firebase projects:
    echo ----------------------------------------------------------------------
    call npx.cmd -y firebase-tools@latest projects:list
    echo ----------------------------------------------------------------------
    echo.
    set /p PROJ_CHOICE="Enter your Firebase Project ID (or type 'new' to create one): "
    if /i "!PROJ_CHOICE!"=="new" (
        set /p NEW_ID="Enter a unique project ID (e.g. quickcart-live-1234): "
        call npx.cmd -y firebase-tools@latest projects:create !NEW_ID! --display-name "QuickCart"
        call npx.cmd -y firebase-tools@latest use !NEW_ID!
    ) else (
        call npx.cmd -y firebase-tools@latest use !PROJ_CHOICE!
    )
) else (
    echo Firebase project configuration found (.firebaserc).
)

:: 3. Deploy
echo.
echo [Step 3/3] Deploying QuickCart live to Google global CDN...
echo.
call npx.cmd -y firebase-tools@latest deploy --only hosting

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   CONGRATULATIONS! QuickCart is officially live on Google!
    echo ======================================================================
) else (
    echo.
    echo [ERROR] Deployment failed. Please review the message above.
)

echo.
pause
