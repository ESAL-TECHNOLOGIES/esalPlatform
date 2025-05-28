
# 🚀 ESAL Platform MVP

**Version**: 1.0.0 | **Status**: ✅ **Production Ready** | **Updated**: May 28, 2025

A streamlined entrepreneurship platform focused on the innovator journey, empowering entrepreneurs to create, refine, and present their ideas with AI-powered assistance.

## 🎯 MVP Focus

The ESAL Platform MVP concentrates on delivering core value through:

- **🚀 Innovator-Centric Design**: Streamlined user experience for entrepreneurs
- **🤖 AI-Powered Insights**: Intelligent pitch analysis and improvement suggestions  
- **💡 Idea Development**: Comprehensive tools for refining business concepts
- **📊 Smart Matching**: AI-driven connections with potential investors
- **📈 Progress Tracking**: Analytics and metrics for business development

## 📁 Project Architecture

### Core Applications

```
📦 ESAL Platform MVP
├── 🌐 web-vite/          # Main innovator platform (Port 3333)
├── 🛠️ admin-portal/      # Administrative interface (Port 3001)  
├── 🔧 api/               # FastAPI backend services (Port 8000)
└── 📚 docs/              # Platform documentation
```

### Shared Resources

```
📦 packages/
├── 🎨 ui/                # Shared React components
├── 🔐 auth/              # Authentication utilities
├── 🗄️ database/          # Database models & utilities
├── 🤖 ai-client/         # AI integration services
└── ⚙️ config/            # Shared configuration
```

## 🛠️ Quick Start Guide

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+  
- **Python** 3.8+

### Installation & Setup

```powershell
# 1. Clone and install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys and configuration

# 3. Setup Python API environment
cd apps/api
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# 4. Start the platform
pnpm run dev:all
```

3. **Development**
   ```bash
   # Run the web application only
   pnpm run dev:web

   # Run the API only
   pnpm run dev:api

   # Run both web and API
   pnpm run dev:all
   ```

## Core Features

- **Innovator Dashboard**: Overview of projects and key metrics
- **Pitch Builder**: Create and refine pitch decks with AI assistance
- **Partner Matching**: Connect with investors matched by AI
- **Profile Management**: Manage innovator profile and settings

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: FastAPI, Python, SQLite/PostgreSQL
- **Auth**: Supabase
- **AI Services**: API integration for pitch analysis and matching

## Development Notes

See [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) for details on the MVP refactoring process.

See [MVP_STATUS.md](./MVP_STATUS.md) for the current status of the MVP.

See [DEPENDENCY_FIXES.md](./DEPENDENCY_FIXES.md) for details on resolved dependency issues.
