# ESAL Platform

A comprehensive entrepreneurship and innovation platform connecting innovators, investors, and entrepreneurship hubs in a unified ecosystem.

> **ESAL** - Entidades Sin Ánimo de Lucro (Non-profit Organizations) Platform

## 🚀 Platform Overview

This is a modern monorepo built with Turborepo and pnpm workspaces, featuring:

- **🌐 Multi-Portal Architecture**: Specialized interfaces for different user types
- **🤖 AI-Powered Matching**: Intelligent connections between innovators and investors
- **📊 Analytics Dashboard**: Comprehensive insights and reporting
- **🔐 Secure Authentication**: Role-based access control with Supabase
- **⚡ Modern Tech Stack**: React, FastAPI, TypeScript, and Tailwind CSS

## 📁 Project Structure

### Applications

- **Web App**: React + Vite main platform application
- **API**: FastAPI Python backend with AI integration
- **Admin Portal**: Administrative interface for platform management
- **Documentation**: Next.js based documentation site

### Shared Packages

- **UI Components**: Reusable React component library
- **Authentication**: Supabase integration utilities
- **Configuration**: Shared configs and utilities

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+
- **Python** 3.8+

### 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   git clone [repository-url]
   cd esalPlatform
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   # Configure your API keys and database settings
   ```

3. **Start Development**
   
   **Option A: Start All Services**
   ```bash
   cd EsalPlatform
   pnpm run dev:all
   ```
   
   **Option B: Start Individual Services**
   ```bash
   # Frontend (React + Vite)
   pnpm run dev:web
   
   # Backend API (FastAPI)
   pnpm run dev:api
   
   # Admin Portal
   pnpm run dev:admin
   ```

### 🌐 Access Points

- **Main Platform**: http://localhost:3333
- **API Documentation**: http://localhost:8000/docs
- **Admin Portal**: http://localhost:3001

## 🏗️ Architecture

### Frontend Stack
- **React 18** with **TypeScript**
- **Vite** for lightning-fast development
- **Tailwind CSS** for styling
- **Zustand** for state management

### Backend Stack  
- **FastAPI** for high-performance APIs
- **Supabase** for authentication & database
- **SQLAlchemy** for ORM
- **Google Gemini AI** for intelligent matching

### DevOps & Tools
- **Turborepo** for monorepo management
- **pnpm** for efficient package management
- **ESLint & Prettier** for code quality

## 📚 Documentation

- [Development Guide](./EsalPlatform/README.md)
- [API Documentation](./EsalPlatform/apps/api/README.md)
- [MVP Status](./EsalPlatform/MVP_STATUS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Last Updated**: May 28, 2025

Run the Python API:
```bash
pnpm run dev:api
```

Run both the API and web app together:
```bash
pnpm run dev:all
```

### Building for Production

```bash
pnpm run build
```

## Project Structure

```
EsalPlatform/
├── apps/
│   ├── api/         # FastAPI backend
│   ├── docs/        # Documentation site
│   └── web/         # Main web application
└── packages/
    ├── config/      # Shared configuration
    ├── database/    # Database access layer
    ├── eslint-config/ # ESLint configurations
    ├── typescript-config/ # TypeScript configurations
    └── ui/          # Shared UI components
```

## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## License

See the [LICENSE](./LICENSE) file for details.
