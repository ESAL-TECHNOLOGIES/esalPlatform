# ESAL Platform Monorepo

A comprehensive entrepreneurship and innovation platform built with modern web technologies and microservices architecture.

## Platform Overview

The ESAL Platform consists of multiple specialized portals and services designed to connect innovators, investors, and entrepreneurship hubs in a unified ecosystem.

## What's inside?

This Turborepo includes the following applications and packages:

### Applications

- **`web-vite`**: Main platform application built with React + Vite
- **`innovator-portal`**: Dedicated interface for innovators to manage projects and collaborations
- **`investor-portal`**: Investment platform for discovering and funding opportunities  
- **`hub-portal`**: Community and collaboration hub for entrepreneurship ecosystems
- **`landing-page`**: Public-facing marketing and information site
- **`admin-portal`**: ⭐ **NEW** - Administrative interface for managing all platform portals
- **`docs`**: Documentation site built with Next.js
- **`api`**: Backend API server built with Python/FastAPI

### Packages

- **`@esal/ui`**: Shared React component library with Tailwind CSS
- **`@esal/auth`**: Authentication and authorization utilities
- **`@esal/database`**: Database models and utilities
- **`@esal/ai-client`**: AI integration and client utilities
- **`@esal/config`**: Shared configuration management
- **`@esal/eslint-config`**: ESLint configurations for consistent code quality
- **`@esal/typescript-config`**: Shared TypeScript configurations

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Python 3.8+ (for API services)

### Installation
```sh
# Clone and install dependencies
git clone <repository-url>
cd EsalPlatform
pnpm install
```

### Development

#### Start All Portals
```sh
# Start all applications in development mode
pnpm dev

# Or use the PowerShell script for individual portals
.\run-portal.ps1 -Portal all
```

#### Start Individual Portals
```sh
# Main application
.\run-portal.ps1 -Portal main

# Innovator portal
.\run-portal.ps1 -Portal innovator

# Investor portal  
.\run-portal.ps1 -Portal investor

# Hub portal
.\run-portal.ps1 -Portal hub

# Landing page
.\run-portal.ps1 -Portal landing

# Admin portal (NEW!)
.\run-portal.ps1 -Portal admin

# Start specific portal with pnpm
pnpm run dev:admin    # Admin portal
```

### Portal URLs (Development)
- **Main Portal**: http://localhost:3000
- **Innovator Portal**: http://localhost:3001  
- **Investor Portal**: http://localhost:3002
- **Hub Portal**: http://localhost:3003
- **Landing Page**: http://localhost:3004
- **Admin Portal**: http://localhost:3005 (or auto-assigned port)
- **API Server**: http://localhost:8000

## New: Admin Portal 🚀

The Admin Portal provides centralized management and monitoring for all ESAL Platform portals:

### Key Features
- **📊 Dashboard**: Real-time system overview and portal status monitoring
- **🔧 Portal Manager**: Start, stop, and configure individual portals
- **👥 User Management**: Comprehensive user administration and role management
- **📈 Analytics**: Platform usage statistics and performance insights
- **⚙️ System Settings**: Configuration management and security controls
- **📋 System Metrics**: Real-time monitoring of system resources

### Admin Portal Technology
- **React 18** with TypeScript for robust frontend development
- **Vite 6** for lightning-fast development and builds
- **Tailwind CSS** for modern, responsive design
- **Recharts** for beautiful data visualizations
- **Role-based authentication** with admin-level access control

[📖 Read the full Admin Portal documentation](./apps/admin-portal/README.md)

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
