@echo off
title AI Travel Assistant - Setup
color 0B

echo.
echo =====================================================
echo    AI Travel Assistant - First Time Setup
echo =====================================================
echo.

:: Step 1: Python backend
echo [1/3] Installing Python backend dependencies...
cd /d "%~dp0backend"
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed. Make sure Python is installed.
    pause
    exit /b 1
)
echo Backend dependencies installed OK.
echo.

:: Step 2: Node frontend
echo [2/3] Installing frontend (Node.js) dependencies...
cd /d "%~dp0frontend"
if not exist node_modules (
    npm install
    if errorlevel 1 (
        echo ERROR: npm install failed. Make sure Node.js is installed.
        pause
        exit /b 1
    )
)
echo Frontend dependencies installed OK.
echo.

:: Step 3: Remind about API key
echo [3/3] IMPORTANT: Add your API key!
echo.
echo Open this file and paste your Anthropic API key:
echo   %~dp0config.env
echo.
echo Get your key at: https://console.anthropic.com
echo.
echo =====================================================
echo    Setup Complete! Now run: start.bat
echo =====================================================
echo.
pause
