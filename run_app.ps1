# Autonomous AI Customer Support System - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Autonomous AI Customer Support System Launcher" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# 1. Check Python Venv
if (-not (Test-Path "$projectRoot\backend\venv")) {
    Write-Host "[1/4] Creating backend virtual environment..." -ForegroundColor Green
    python -m venv "$projectRoot\backend\venv"
    & "$projectRoot\backend\venv\Scripts\pip.exe" install -r "$projectRoot\backend\requirements.txt"
    & "$projectRoot\backend\venv\Scripts\python.exe" "$projectRoot\backend\seed.py"
} else {
    Write-Host "[1/4] Backend environment verified." -ForegroundColor Green
}

# 2. Check Frontend node_modules
if (-not (Test-Path "$projectRoot\frontend\node_modules")) {
    Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Green
    $env:PATH = "C:\Program Files\nodejs;" + $env:PATH
    Set-Location "$projectRoot\frontend"
    & "C:\Program Files\nodejs\npm.cmd" install
    Set-Location $projectRoot
} else {
    Write-Host "[2/4] Frontend dependencies verified." -ForegroundColor Green
}

# 3. Start Backend
Write-Host "[3/4] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 4. Start Frontend
Write-Host "[4/4] Launching React Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; cd '$projectRoot\frontend'; & 'C:\Program Files\nodejs\npm.cmd' run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " System running at http://localhost:5173" -ForegroundColor Green
Write-Host " Swagger API at http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
