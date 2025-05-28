# 🐍 ESAL Platform Backend API

A high-performance FastAPI backend powering the ESAL Innovation Matchmaking Platform, serving Innovators, Hubs, Investors, and Admins.

## 🚀 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Modern, fast web framework for building APIs | Latest |
| **Supabase** | Authentication and PostgreSQL database | Latest |
| **SQLAlchemy** | Python SQL toolkit and ORM | 2.0+ |
| **Pydantic** | Data validation and settings management | V2 |
| **Google Gemini AI** | AI-powered pitch analysis and matching | Latest |
| **JWT** | JSON Web Tokens for secure authentication | Latest |

## 📁 Project Architecture

```
EsalPlatform/apps/api/
├── app/
│   ├── main.py              # 🎯 FastAPI application entry point
│   ├── config.py            # ⚙️ Environment configuration
│   ├── database.py          # 🗄️ Database setup and connection
│   ├── middleware.py        # 🔧 Custom middleware (CORS, logging)
│   ├── models/              # 📊 SQLAlchemy database models
│   │   ├── __init__.py      # User, Idea, Investment models
│   │   ├── user.py          # User entity definitions
│   │   └── idea.py          # Innovation project models
│   ├── schemas/             # 📝 Pydantic request/response schemas
│   │   ├── __init__.py      # API data validation schemas
│   │   ├── user.py          # User API schemas
│   │   └── idea.py          # Idea API schemas
│   ├── routers/             # 🛣️ API route handlers
│   │   ├── auth.py          # 🔐 Authentication endpoints
│   │   ├── innovator.py     # 🚀 Innovator portal endpoints
│   │   ├── hub.py           # 🌐 Hub portal endpoints
│   │   ├── investor.py      # 💰 Investor portal endpoints
│   │   └── admin.py         # 🛠️ Admin portal endpoints
│   ├── services/            # 🔧 Business logic services
│   │   ├── auth_service.py  # Authentication business logic
│   │   ├── ai_service.py    # AI integration and matching
│   │   └── user_service.py  # User management logic
│   └── utils/               # 🛠️ Utility functions
│       ├── security.py      # Password hashing, JWT handling
│       └── helpers.py       # Common utility functions
├── requirements.txt         # 📦 Python dependencies
└── start.py                # 🚀 Application startup script
```
│   │   └── admin.py         # Admin panel endpoints
│   ├── services/            # Business logic layer
│   │   ├── auth.py          # Authentication service
│   │   ├── gemini_ai.py     # AI pitch generation
│   │   └── idea_logic.py    # Idea CRUD operations
│   └── utils/               # Utility functions
│       ├── jwt.py           # JWT token handling
│       └── roles.py         # Role-based access control
├── .env.example             # Environment variables template
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/esal_platform

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Database Setup

The application will automatically create database tables on startup.

### 4. Run the Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🔐 Authentication

The backend uses Supabase for user authentication with JWT tokens:

- **Sign Up**: `POST /auth/signup`
- **Sign In**: `POST /auth/login`  
- **User Info**: `GET /auth/me`

### User Roles

- `innovator` - Submit and manage innovation ideas
- `hub` - View dummy hub dashboard and programs
- `investor` - View dummy investment opportunities
- `admin` - Manage users and system administration

## 🛣️ API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Innovator Portal
- `POST /innovator/submit-idea` - Submit new idea
- `PUT /innovator/update-idea/{id}` - Update existing idea
- `DELETE /innovator/delete-idea/{id}` - Delete idea
- `GET /innovator/view-ideas` - Get user's ideas
- `POST /innovator/pitch-ai` - Generate AI pitch

### Hub Portal
- `GET /hub/dashboard` - Hub dashboard (dummy data)
- `GET /hub/startups` - View connected startups
- `GET /hub/programs` - View active programs

### Investor Portal
- `GET /investor/dashboard` - Investor dashboard (dummy data)
- `GET /investor/opportunities` - View investment opportunities
- `GET /investor/portfolio` - View current portfolio

### Admin Panel
- `GET /admin/dashboard` - System statistics
- `GET /admin/users` - Get all users
- `POST /admin/block-user/{id}` - Block/unblock user
- `GET /admin/users/by-role/{role}` - Get users by role

## 🤖 AI Integration

The platform integrates with Google Gemini AI for generating investment-ready pitches:

```python
# Example AI pitch request
{
  "title": "EcoTech Solutions",
  "problem": "Waste management inefficiencies cost cities millions",
  "solution": "AI-powered optimization for waste collection routes",
  "target_market": "Municipal governments and waste management companies"
}
```

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control
- Supabase integration for user management
- Security headers middleware
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy

## 🧪 Development

### Running Tests

```bash
pytest
```

### Code Quality

The project follows Python best practices:
- Type hints throughout
- Pydantic for data validation
- Structured error handling
- Comprehensive logging

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set in production:

```env
SUPABASE_URL=your-production-supabase-url
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
DATABASE_URL=your-production-database-url
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET_KEY=your-strong-production-secret
DEBUG=False
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📊 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔄 Future Enhancements

- Real-time notifications
- Advanced matchmaking algorithms
- File upload for pitch decks
- Email notifications
- Advanced analytics dashboard
- Integration with more AI models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
