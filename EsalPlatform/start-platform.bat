@echo off
echo Starting ESAL Platform MVP...
echo [NOTE] This platform has been refactored to a simplified MVP.

:: Start API server
start "ESAL API Server" cmd /k "cd %~dp0\apps\api && if exist .venv\Scripts\activate.bat (.venv\Scripts\activate.bat) else (python -m venv .venv && .venv\Scripts\activate.bat && pip install -r requirements.txt) && python run.py"

:: Install dependencies and start web application
start "ESAL Web Application" cmd /k "cd %~dp0 && pnpm install && pnpm run dev:web"

echo Both servers started in separate windows. Close the windows to stop the servers.