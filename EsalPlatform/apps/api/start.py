#!/usr/bin/env python3
"""
ESAL Platform Backend Startup Script
"""
import os
import sys
import subprocess
from pathlib import Path


def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")


def check_env_file():
    """Check if .env file exists"""
    env_file = Path(".env")
    example_file = Path(".env.example")
    
    if not env_file.exists():
        if example_file.exists():
            print("⚠️  .env file not found. Creating from .env.example...")
            example_file.rename(env_file)
            print("📝 Please edit .env with your configuration settings")
            return False
        else:
            print("❌ .env file not found and no .env.example available")
            return False
    
    print("✅ .env file found")
    return True


def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False


def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting ESAL Platform Backend...")
    print("📍 Server will be available at:")
    print("   - API: http://localhost:8000")
    print("   - Docs: http://localhost:8000/docs")
    print("   - ReDoc: http://localhost:8000/redoc")
    print("\n🔄 Starting server... (Press Ctrl+C to stop)")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")


def main():
    """Main startup function"""
    print("🔄 ESAL Platform Backend Startup")
    print("=" * 40)
    
    # Check Python version
    check_python_version()
    
    # Check environment file
    if not check_env_file():
        print("\n⚠️  Please configure your .env file before starting the server")
        return
    
    # Install dependencies
    if not install_dependencies():
        return
    
    print("\n" + "=" * 40)
    
    # Start server
    start_server()


if __name__ == "__main__":
    main()
