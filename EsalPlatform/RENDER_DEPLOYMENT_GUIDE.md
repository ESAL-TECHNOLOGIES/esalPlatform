# ESAL Platform - Render Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites
1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **Render Account**: Create account at [render.com](https://render.com)
3. **Supabase Project**: Set up at [supabase.com](https://supabase.com)

### Step 1: Prepare Environment Variables

1. Copy the template file:
```powershell
Copy-Item render.env.template render.env.local
```

2. Edit `render.env.local` with your actual values:
   - Supabase URL and keys from your Supabase dashboard
   - Generate JWT secret: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - Add your AI API keys (Gemini, OpenAI)
   - Configure email settings if needed

### Step 2: Deploy API Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `esal-platform-api`
   - **Root Directory**: `apps/api`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: 3.11

5. Add environment variables from your `render.env.local` file (API section)

### Step 3: Deploy Frontend Services

For each frontend service, create a new Static Site:

#### Landing Page
- **Name**: `esal-landing`
- **Root Directory**: Leave empty (uses repo root)
- **Build Command**: `pnpm install && pnpm turbo build --filter=landing`
- **Publish Directory**: `apps/landing/dist`

#### Hub Portal
- **Name**: `esal-hub-portal`
- **Root Directory**: Leave empty
- **Build Command**: `pnpm install && pnpm turbo build --filter=hub-portal`
- **Publish Directory**: `apps/hub-portal/dist`

#### Innovator Portal
- **Name**: `esal-innovator-portal`
- **Root Directory**: Leave empty
- **Build Command**: `pnpm install && pnpm turbo build --filter=innovator-portal`
- **Publish Directory**: `apps/innovator-portal/dist`

#### Investor Portal
- **Name**: `esal-investor-portal`
- **Root Directory**: Leave empty
- **Build Command**: `pnpm install && pnpm turbo build --filter=investor-portal`
- **Publish Directory**: `apps/investor-portal/dist`

#### Admin Portal
- **Name**: `esal-admin-portal`
- **Root Directory**: Leave empty
- **Build Command**: `pnpm install && pnpm turbo build --filter=admin-portal`
- **Publish Directory**: `apps/admin-portal/dist`

### Step 4: Configure Frontend Environment Variables

For each frontend service, add these environment variables:
```
VITE_API_URL=https://esal-platform-api.onrender.com
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ_YOUR_ANON_KEY
VITE_ENVIRONMENT=production
VITE_APP_TITLE=ESAL [Portal Name]
```

### Step 5: Update CORS Configuration

After all frontends are deployed, update the API's `ALLOWED_ORIGINS` environment variable with all your frontend URLs:

```
ALLOWED_ORIGINS=https://esal-landing.onrender.com,https://esal-hub-portal.onrender.com,https://esal-innovator-portal.onrender.com,https://esal-investor-portal.onrender.com,https://esal-admin-portal.onrender.com
```

## 🔧 Using render.yaml Files

### Option 1: Individual Service Deployment
Deploy each service separately using the individual `render.yaml` files in each app directory.

### Option 2: Single Configuration Deployment
Use the main `render.yaml` in the root directory to deploy all services at once.

## 🚨 Security Notes

- Never commit real environment variables to git
- Use Render's environment variable dashboard to set sensitive values
- Regularly rotate JWT secrets and API keys
- Review CORS settings to only allow your domains

## 🔍 Troubleshooting

### Build Issues
- Check that pnpm is available in Render (it should be by default)
- Verify Turbo commands work locally first
- Check build logs for dependency issues

### Environment Variable Issues
- Ensure all required variables are set
- Check variable names match exactly (case-sensitive)
- Verify Supabase keys are correct

### CORS Issues
- Make sure ALLOWED_ORIGINS includes all frontend URLs
- Check that URLs don't have trailing slashes
- Verify protocol (https://) is included

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Static Sites](https://render.com/docs/static-sites)
- [Render Web Services](https://render.com/docs/web-services)
