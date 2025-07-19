# Getting Started Guide

Welcome to the ESAL Platform! This guide will help you set up and start developing on the platform.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Running the Platform](#running-the-platform)
- [Testing](#testing)
- [Contributing](#contributing)
- [Next Steps](#next-steps)

## Quick Start

Get the ESAL Platform running in 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd EsalPlatform

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp secrets/environments/.env.development.template secrets/environments/.env.development

# 4. Start the database (if using Docker)
docker-compose up -d postgres

# 5. Run migrations
cd apps/api && python apply_migrations.py

# 6. Start all services
pnpm run dev
```

Visit:
- Landing Page: https://esalplatform.onrender.com
- Hub Portal: https://esalplatform.onrender.com/hub
- API Documentation: https://esalplatform-1.onrender.com/docs

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **pnpm** (v8 or later) - Install with `npm install -g pnpm`
- **Python** (v3.8 or later) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### Optional (Recommended)

- **Docker** - For database and containerized development
- **VS Code** - Recommended IDE with extensions:
  - Python
  - TypeScript and JavaScript
  - Tailwind CSS IntelliSense
  - Prettier
  - ESLint

### System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EsalPlatform
```

### 2. Install Dependencies

```bash
# Install all project dependencies
pnpm install

# Or install for specific apps
cd apps/api && pip install -r requirements.txt
cd apps/landing && pnpm install
```

### 3. Environment Setup

The platform uses a centralized secrets management system:

```bash
# Copy development environment template
cp secrets/environments/.env.development.template secrets/environments/.env.development

# Edit the environment file
nano secrets/environments/.env.development
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=sqlite:///./esal_platform.db

# JWT Security
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256

# Supabase (optional for cloud features)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key

# Email (optional for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. Database Setup

**Option A: SQLite (Quick Start)**
```bash
cd apps/api
python apply_migrations.py
```

**Option B: PostgreSQL (Recommended)**
```bash
# Using Docker
docker-compose up -d postgres

# Or install locally
createdb esal_platform
cd apps/api
python apply_migrations.py
```

**Option C: Supabase (Cloud)**
```bash
cd apps/api
python complete_supabase_setup.sql
```

## Project Structure

Understanding the platform architecture:

```
EsalPlatform/
├── apps/                    # Application modules
│   ├── api/                # FastAPI backend
│   │   ├── main.py        # API entry point
│   │   ├── models/        # Database models
│   │   ├── routes/        # API endpoints
│   │   └── tests/         # Centralized tests
│   ├── landing/           # Marketing website
│   ├── hub-portal/        # Main dashboard
│   ├── innovator-portal/  # For innovators
│   ├── investor-portal/   # For investors
│   └── admin-portal/      # Administrative interface
├── docs/                  # Documentation
├── secrets/               # Environment configuration
└── shared/               # Shared utilities
```

### Key Components

- **API**: FastAPI backend with SQLAlchemy ORM
- **Portals**: React/TypeScript frontends with Tailwind CSS
- **Database**: PostgreSQL/SQLite with Alembic migrations
- **Authentication**: JWT-based with role-based access control
- **Testing**: Pytest for backend, Vitest for frontend

## Development Workflow

### Starting Development

1. **Start all services**:
   ```bash
   pnpm run dev
   ```

2. **Start individual services**:
   ```bash
   # API only
   cd apps/api && uvicorn main:app --reload

   # Frontend only
   cd apps/hub-portal && pnpm run dev
   ```

### Development Commands

```bash
# Start all applications
pnpm run dev

# Build all applications
pnpm run build

# Run all tests
pnpm run test

# Lint and format
pnpm run lint
pnpm run format

# Type checking
pnpm run type-check
```

### Hot Reloading

All applications support hot reloading:
- **API**: Automatically reloads on Python file changes
- **Frontends**: Automatically refresh on TypeScript/React changes
- **Database**: Migrations applied automatically in development

## Running the Platform

### Development Mode

```bash
# Start all services (recommended)
pnpm run dev

# Services will be available at:
# - Landing Page: https://esalplatform.onrender.com
# - Hub Portal: https://esalplatform.onrender.com/hub
# - Innovator Portal: https://esalplatform.onrender.com/innovator
# - Investor Portal: https://esalplatform.onrender.com/investor
# - Admin Portal: https://esalplatform.onrender.com/admin
# - API: https://esalplatform-1.onrender.com
# - API Docs: https://esalplatform-1.onrender.com/docs
```

### Individual Services

```bash
# API Server
cd apps/api
uvicorn main:app --reload --port 8000

# Landing Page
cd apps/landing
pnpm run dev

# Hub Portal
cd apps/hub-portal
pnpm run dev --port 3001
```

### Production Mode

```bash
# Build all applications
pnpm run build

# Start production servers
pnpm run start
```

## Testing

The platform has a comprehensive testing setup:

### Running Tests

```bash
# Run all tests
pnpm run test

# Backend tests only
cd apps/api
pytest

# Frontend tests only
cd apps/hub-portal
pnpm run test

# Test with coverage
pytest --cov=. --cov-report=html
```

### Test Categories

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows
- **Component Tests**: Test React components in isolation

### Writing Tests

Tests are organized in `apps/api/tests/`:

```python
# Example unit test
def test_user_creation():
    user = User(email="test@example.com", name="Test User")
    assert user.email == "test@example.com"

# Example integration test
def test_user_registration_endpoint(client):
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "testpass123",
        "name": "Test User"
    })
    assert response.status_code == 201
```

## Contributing

### Development Guidelines

1. **Code Style**:
   - Use TypeScript for frontend code
   - Follow PEP 8 for Python code
   - Use Prettier for formatting
   - Use ESLint for linting

2. **Git Workflow**:
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name

   # Make changes and commit
   git add .
   git commit -m "feat: add user authentication"

   # Push and create PR
   git push origin feature/your-feature-name
   ```

3. **Commit Messages**:
   ```
   feat: add new feature
   fix: bug fix
   docs: documentation update
   style: formatting changes
   refactor: code refactoring
   test: add tests
   chore: maintenance tasks
   ```

### Code Review Process

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Create a pull request
6. Address review feedback
7. Merge when approved

## Next Steps

Now that you have the platform running, here's what to explore:

### For Backend Developers

1. **Review the API documentation**: https://esalplatform-1.onrender.com/docs
2. **Explore the database models**: `apps/api/models/`
3. **Check out the authentication system**: `apps/api/auth/`
4. **Review the test suite**: `apps/api/tests/`

### For Frontend Developers

1. **Explore the component library**: `apps/hub-portal/src/components/`
2. **Review the design system**: `docs/ui/README.md`
3. **Check out the routing**: `apps/*/src/router/`
4. **Understand the state management**: Look for context providers

### For DevOps/Deployment

1. **Review deployment guide**: `docs/deployment/README.md`
2. **Explore CI/CD setup**: `.github/workflows/`
3. **Check Docker configuration**: `docker-compose.yml`
4. **Review environment management**: `secrets/README.md`

### Common Tasks

1. **Add a new API endpoint**:
   - Create route in `apps/api/routes/`
   - Add tests in `apps/api/tests/`
   - Update API documentation

2. **Create a new page**:
   - Add component in `apps/*/src/pages/`
   - Add route in router configuration
   - Create corresponding tests

3. **Add a new database model**:
   - Create model in `apps/api/models/`
   - Generate migration with Alembic
   - Add CRUD operations

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Kill process on port 8000
   lsof -ti:8000 | xargs kill
   ```

2. **Database connection issues**:
   ```bash
   # Reset database
   rm apps/api/esal_platform.db
   cd apps/api && python apply_migrations.py
   ```

3. **Package installation issues**:
   ```bash
   # Clear caches
   pnpm store prune
   rm -rf node_modules
   pnpm install
   ```

### Getting Help

- **Documentation**: Check the `docs/` folder
- **API Reference**: https://esalplatform-1.onrender.com/docs
- **Issues**: Create an issue in the repository
- **Discussion**: Use GitHub Discussions for questions

## Resources

- [API Documentation](../api/README.md)
- [Authentication Guide](../auth/README.md)
- [UI Design System](../ui/README.md)
- [Deployment Guide](../deployment/README.md)
- [Architecture Overview](../architecture/README.md)

---

Happy coding! 🚀

*This getting started guide is part of the ESAL Platform documentation.*
