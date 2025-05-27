
# ESAL Platform MVP

ESAL Platform is a streamlined solution focused on the innovator journey, helping entrepreneurs to create, refine, and present their pitches with AI assistance.

## Project Structure

This monorepo contains:

- **Web Application** (`/apps/web-vite`): The main innovator portal with all core features
- **API** (`/apps/api`): Backend services including AI analysis and matching
- **Shared Packages** (`/packages`): Reusable components and utilities

## Getting Started

1. **Prerequisites**
   - Node.js 18 or newer
   - PNPM 10 or newer
   - Python 3.10 or newer (for API)

2. **Installation**
   ```bash
   # Install dependencies
   pnpm install

   # Set up API environment
   cd apps/api
   python -m venv .venv
   .\.venv\Scripts\activate  # On Windows
   pip install -r requirements.txt
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
