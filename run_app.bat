@echo off
title Autonomous AI Customer Support Launcher
echo ========================================================
echo  Autonomous AI Customer Support System
echo  Launcher Script
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Ensure Backend Virtual Environment
if not exist "backend\venv" (
    echo [1/4] Creating Python virtual environment...
    python -m venv backend\venv
    echo Installing backend dependencies...
    backend\venv\Scripts\pip install -r backend\requirements.txt
    echo Seeding database...
    backend\venv\Scripts\python backend\seed.py
) else (
    echo [1/4] Python virtual environment detected.
)

:: 2. Ensure Frontend node_modules
if not exist "frontend\node_modules" (
    echo [2/4] Installing frontend npm dependencies...
    set "PATH=C:\Program Files\nodejs;%PATH%"
    cd frontend
    call npm install
    cd ..
) else (
    echo [2/4] Frontend dependencies detected.
)

:: 3. Start Backend in separate window
echo [3/4] Starting FastAPI Backend on http://127.0.0.1:8000...
start "Backend - FastAPI (Port 8000)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 4. Start Frontend in separate window
echo [4/4] Starting React Vite Frontend on http://localhost:5173...
start "Frontend - Vite React (Port 5173)" cmd /k "cd /d "%~dp0frontend" && set PATH=C:\Program Files\nodejs;%%PATH%% && npm run dev"

echo.
echo ========================================================
echo  Servers are starting!
echo  Frontend : http://localhost:5173
echo  Backend  : http://127.0.0.1:8000
echo  Swagger  : http://127.0.0.1:8000/docs
echo ========================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
