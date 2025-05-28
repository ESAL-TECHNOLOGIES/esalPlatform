@echo off
echo 🔄 ESAL Platform Backend Startup
echo ========================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Python detected

REM Check if .env file exists
if not exist ".env" (
    if exist ".env.example" (
        echo ⚠️  .env file not found. Creating from .env.example...
        copy ".env.example" ".env"
        echo 📝 Please edit .env with your configuration settings
        pause
    ) else (
        echo ❌ .env file not found and no .env.example available
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file found
)

REM Install dependencies
echo 📦 Installing dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.
echo ========================================

REM Start the server
echo 🚀 Starting ESAL Platform Backend...
echo 📍 Server will be available at:
echo    - API: http://localhost:8000
echo    - Docs: http://localhost:8000/docs
echo    - ReDoc: http://localhost:8000/redoc
echo.
echo 🔄 Starting server... (Press Ctrl+C to stop)
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
