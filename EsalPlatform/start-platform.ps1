#!/usr/bin/env pwsh
# PowerShell script to start the ESAL Platform MVP

Write-Host "Starting ESAL Platform MVP..." -ForegroundColor Green
Write-Host "[NOTE] This platform has been refactored to a simplified MVP." -ForegroundColor Yellow

# Start the API server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\api'; Write-Host 'Starting API server...' -ForegroundColor Cyan; if (Test-Path '.venv\Scripts\activate') { .\.venv\Scripts\activate } else { Write-Host 'Creating virtual environment...' -ForegroundColor Yellow; python -m venv .venv; .\.venv\Scripts\activate; pip install -r requirements.txt }; python run.py"

# Install dependencies and start web application
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'Installing dependencies...' -ForegroundColor Yellow; pnpm install; Write-Host 'Starting web application...' -ForegroundColor Magenta; pnpm run dev:web"

Write-Host "Both servers started in separate windows. Press Ctrl+C in each window to stop them." -ForegroundColor Green