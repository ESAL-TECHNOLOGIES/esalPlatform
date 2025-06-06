# Secrets Management

This folder contains environment-specific configuration files with sensitive data that should **NEVER** be committed to version control.

## Structure

```
secrets/
├── .env.template          # Template file (safe to commit)
├── README.md             # This file (safe to commit)
└── environments/         # Environment-specific files (DO NOT COMMIT)
    ├── .env.development  # Development environment secrets
    ├── .env.production   # Production environment secrets
    └── .env.test         # Testing environment secrets
```

## Setup Instructions

1. **Copy the template**: Copy `.env.template` to `environments/.env.{environment}`
   ```bash
   # For development
   cp .env.template environments/.env.development
   
   # For production
   cp .env.template environments/.env.production
   
   # For testing
   cp .env.template environments/.env.test
   ```

2. **Fill in actual values**: Edit each environment file with real API keys, database URLs, and secrets.

3. **Set environment**: The application will load the appropriate file based on the `NODE_ENV` or `ENVIRONMENT` variable.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIza...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `JWT_SECRET_KEY` | JWT signing secret | Random secure string |
| `SMTP_USER` | Email service username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email service password/app password | App-specific password |

## Security Notes

- **Never commit actual secrets**: Only commit template files and this README
- **Use app passwords**: For Gmail, use app-specific passwords, not your main password
- **Rotate keys regularly**: Change API keys and secrets periodically
- **Use different secrets per environment**: Don't reuse production secrets in development

## Loading Environment Variables

The application automatically loads the correct environment file based on:
- `NODE_ENV` (for Node.js/frontend)
- `ENVIRONMENT` (for Python/backend)
- Default fallback to development

## Troubleshooting

1. **Environment not loading**: Check that the file exists and has correct permissions
2. **Invalid secrets**: Verify API keys are active and have correct permissions
3. **Database connection**: Ensure database URL is correct and accessible
4. **Email issues**: Check SMTP settings and app password configuration
