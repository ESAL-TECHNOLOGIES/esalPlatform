"""
pytest configuration file for ESAL Platform API tests
"""

import pytest
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
api_path = Path(__file__).parent.parent
sys.path.insert(0, str(api_path))

# Set test environment
os.environ["ENVIRONMENT"] = "test"
os.environ["TESTING"] = "true"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_app():
    """Create test FastAPI application instance."""
    from app.main import app
    return app


@pytest.fixture(scope="function")
async def test_client(test_app):
    """Create test client for API testing."""
    from httpx import AsyncClient
    async with AsyncClient(app=test_app, base_url="http://test") as client:
        yield client


@pytest.fixture(scope="function")
def test_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "user_type": "innovator",
        "profile": {
            "name": "Test User",
            "bio": "Test bio",
            "location": "Test City"
        }
    }


@pytest.fixture(scope="function")
def test_startup_data():
    """Sample startup data for testing."""
    return {
        "name": "Test Startup",
        "industry": "Technology",
        "stage": "Seed",
        "description": "A test startup for testing purposes",
        "seeking": "500000",
        "valuation": "2000000"
    }


@pytest.fixture(scope="function")
def test_idea_data():
    """Sample idea data for testing."""
    return {
        "title": "Test Idea",
        "description": "A revolutionary test idea",
        "industry": "Technology",
        "stage": "concept",
        "funding_needed": "100000",
        "problem_statement": "Testing is hard",
        "solution": "Make testing easier"
    }


@pytest.fixture(scope="function")
async def authenticated_user(test_client, test_user_data):
    """Create and authenticate a test user."""
    # Register user
    register_response = await test_client.post("/auth/register", json=test_user_data)
    assert register_response.status_code == 201
    
    # Login user
    login_response = await test_client.post("/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    })
    assert login_response.status_code == 200
    
    token = login_response.json()["access_token"]
    user_id = login_response.json()["user_id"]
    
    return {
        "token": token,
        "user_id": user_id,
        "email": test_user_data["email"],
        "headers": {"Authorization": f"Bearer {token}"}
    }


@pytest.fixture(scope="function")
async def db_session():
    """Create database session for testing."""
    from app.database import get_db_session
    async with get_db_session() as session:
        yield session
        await session.rollback()


# Test markers
pytest.mark.unit = pytest.mark.unit
pytest.mark.integration = pytest.mark.integration
pytest.mark.e2e = pytest.mark.e2e
pytest.mark.slow = pytest.mark.slow
pytest.mark.database = pytest.mark.database
pytest.mark.auth = pytest.mark.auth
pytest.mark.ai = pytest.mark.ai


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "e2e: End-to-end tests")
    config.addinivalue_line("markers", "slow: Slow running tests")
    config.addinivalue_line("markers", "database: Tests requiring database")
    config.addinivalue_line("markers", "auth: Authentication tests")
    config.addinivalue_line("markers", "ai: AI/ML related tests")


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on file location."""
    for item in items:
        # Add markers based on test file location
        test_path = str(item.fspath)
        
        if "/unit/" in test_path:
            item.add_marker(pytest.mark.unit)
        elif "/integration/" in test_path:
            item.add_marker(pytest.mark.integration)
        elif "/e2e/" in test_path:
            item.add_marker(pytest.mark.e2e)
            item.add_marker(pytest.mark.slow)
        
        # Add specific markers based on test name/content
        if "auth" in test_path.lower() or "auth" in item.name.lower():
            item.add_marker(pytest.mark.auth)
        
        if "ai" in test_path.lower() or "gemini" in test_path.lower():
            item.add_marker(pytest.mark.ai)
        
        if "database" in test_path.lower() or "db" in test_path.lower():
            item.add_marker(pytest.mark.database)
