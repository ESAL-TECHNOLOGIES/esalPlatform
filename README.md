# ESAL Platform

A comprehensive platform for ESAL (Entidades Sin Ánimo de Lucro / Non-profit Organizations) management and operations.

## Project Structure

This is a monorepo using Turborepo and pnpm workspaces, consisting of:

- **Web App**: Next.js frontend application
- **API**: FastAPI Python backend
- **Documentation Site**: Next.js based documentation site
- **Shared Packages**: UI components, configuration, and other shared code

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm 10.11.0 or later
- Python 3.9 or later

### Installation

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd esalPlatform
   ```

2. Install JavaScript dependencies
   ```bash
   pnpm install
   ```

3. Install Python dependencies
   ```bash
   pnpm run api:install
   ```

### Development

Run the frontend web app:
```bash
pnpm run dev
```

Run the documentation site:
```bash
pnpm run dev:docs
```

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
