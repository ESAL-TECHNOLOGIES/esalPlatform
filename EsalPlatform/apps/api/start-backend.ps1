# ESAL Platform Backend Startup Script for Windows
# PowerShell script to start the FastAPI backend

Write-Host "🔄 ESAL Platform Backend Startup" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "📝 Please edit .env with your configuration settings" -ForegroundColor Yellow
        Write-Host "Press any key to continue after configuring .env..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "❌ .env file not found and no .env.example available" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    python -m pip install -r requirements.txt
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=" * 40 -ForegroundColor Cyan

# Start the server
Write-Host "🚀 Starting ESAL Platform Backend..." -ForegroundColor Green
Write-Host "📍 Server will be available at:" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:8000" -ForegroundColor White
Write-Host "   - Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   - ReDoc: http://localhost:8000/redoc" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Starting server... (Press Ctrl+C to stop)" -ForegroundColor Yellow
Write-Host ""

try {
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} catch {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    exit 1
}
