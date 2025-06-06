# ESAL Platform Test Suite

This directory contains all tests for the ESAL Platform API. Tests are organized by type and functionality.

## Structure

```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for API endpoints
├── e2e/           # End-to-end tests for complete workflows
├── fixtures/      # Test data and fixtures
├── conftest.py    # pytest configuration
└── README.md      # This file
```

## Test Types

### Unit Tests (`unit/`)
- Individual function and class testing
- Mocked dependencies
- Fast execution
- High coverage

### Integration Tests (`integration/`)
- API endpoint testing
- Database integration
- External service mocking
- Authentication flows

### End-to-End Tests (`e2e/`)
- Complete user workflows
- Real database interactions
- Cross-service integration
- Performance testing

## Running Tests

### All Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

### Specific Test Types
```bash
# Unit tests only
pytest tests/unit/

# Integration tests only
pytest tests/integration/

# End-to-end tests only
pytest tests/e2e/
```

### Test Markers
```bash
# Run fast tests only
pytest -m "not slow"

# Run database tests
pytest -m "database"

# Run authentication tests
pytest -m "auth"
```

## Test Configuration

Tests use the test environment configuration from `secrets/environments/.env.test`.

### Environment Setup
1. Ensure test database is available
2. Configure test environment variables
3. Install test dependencies: `pip install -r requirements-test.txt`

### Test Database
- Uses separate test database
- Automatically creates/drops test data
- Isolated from development/production data

## Writing Tests

### Test Naming Convention
- Test files: `test_<module_name>.py`
- Test functions: `test_<functionality>()`
- Test classes: `Test<ClassName>`

### Example Test Structure
```python
import pytest
from app.models import User

class TestUserModel:
    """Test cases for User model"""
    
    def test_create_user(self):
        """Test user creation"""
        # Test implementation
        pass
    
    @pytest.mark.asyncio
    async def test_async_operation(self):
        """Test async operations"""
        # Test implementation
        pass
```

## Test Data

### Fixtures
- Use `tests/fixtures/` for test data
- Create reusable fixtures in `conftest.py`
- Clean up after tests

### Database Fixtures
- User test data
- Startup/investor profiles
- Sample ideas and opportunities

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Scheduled runs (nightly)

### CI Configuration
- GitHub Actions workflow
- Multiple Python versions
- Database migrations
- Security scanning
