"""
Start script for Supabase-only ESAL Platform API
"""
import uvicorn
import os
import sys

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting ESAL Platform API (Supabase-only mode)...")
    print("📊 Database: Supabase (no local database required)")
    print("🌐 API Documentation: http://localhost:8000/api/docs")
    print("💡 Health Check: http://localhost:8000/health")
    print("")
    
    uvicorn.run(
        "app.main_supabase:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
