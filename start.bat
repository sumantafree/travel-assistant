@echo off
title AI Travel Assistant
color 0B

echo.
echo =====================================================
echo    AI Travel Assistant - Starting...
echo =====================================================
echo.

:: Kill any existing instances on ports 8001 and 3002
echo Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001 "') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3002 "') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

:: Check config.env for API key
findstr /C:"your_anthropic_api_key_here" "%~dp0config.env" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: You have not set your Anthropic API key yet!
    echo Open config.env and replace "your_anthropic_api_key_here" with your real key.
    echo Get it at: https://console.anthropic.com
    echo.
    echo The app will start but AI features won't work without a key.
    echo.
    timeout /t 4 /nobreak >nul
)

:: Start backend (no --reload since G: drive file watching doesn't work)
echo Starting Backend (FastAPI on port 8001)...
start "TravelAI Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --port 8001 --host 0.0.0.0"

:: Wait for backend
echo Waiting for backend to start...
timeout /t 4 /nobreak >nul

:: Start frontend
echo Starting Frontend (React on port 3002)...
start "TravelAI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait for frontend
echo Waiting for frontend to build...
timeout /t 6 /nobreak >nul

:: Open browser
echo Opening browser...
start http://localhost:3002

echo.
echo =====================================================
echo    AI Travel Assistant is running!
echo.
echo    App:      http://localhost:3002
echo    API Docs: http://localhost:8001/docs
echo.
echo    Close the two terminal windows to stop the app.
echo =====================================================
echo.
pause
