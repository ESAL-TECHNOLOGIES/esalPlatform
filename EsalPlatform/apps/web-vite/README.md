# ESAL Platform Web (Vite)

This is the frontend React application for the ESAL Platform, built with Vite.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root of this directory with the following variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:8000
```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/context` - React context providers
- `/src/routes` - Application routes/pages
- `/src/services` - API and external service integrations
- `/src/assets` - Static assets including fonts and images
