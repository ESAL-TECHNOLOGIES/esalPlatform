#!/bin/bash
# Start script for Render deployment
echo "Starting ESAL Platform API..."
echo "Environment: $ENVIRONMENT"
echo "Port: $PORT"

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
