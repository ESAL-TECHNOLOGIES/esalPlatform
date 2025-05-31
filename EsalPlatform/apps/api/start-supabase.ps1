# PowerShell script to start ESAL Platform API (Supabase-only)
Write-Host "🚀 Starting ESAL Platform API (Supabase-only mode)..." -ForegroundColor Green
Write-Host "📊 Database: Supabase (no local database required)" -ForegroundColor Cyan
Write-Host "🌐 API Documentation: http://localhost:8000/api/docs" -ForegroundColor Yellow
Write-Host "💡 Health Check: http://localhost:8000/health" -ForegroundColor Yellow
Write-Host ""

# Navigate to API directory
Set-Location "d:\esalPlatform\EsalPlatform\apps\api"

# Check if Python is available
try {
    python --version
    Write-Host "✅ Python found" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "✅ Activating virtual environment..." -ForegroundColor Green
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "⚠️  No virtual environment found. Installing dependencies globally..." -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pip install -r requirements.txt

# Start the Supabase-only API
Write-Host "🚀 Starting API server..." -ForegroundColor Green
python start_supabase.py
