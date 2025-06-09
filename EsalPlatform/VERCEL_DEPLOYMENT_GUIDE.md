# ESAL Platform Frontend Deployment Guide - Vercel

## 🚀 Quick Deployment Summary

Your API is already deployed at: **https://esalplatform-1.onrender.com**

Now we need to deploy the frontend applications to Vercel. Each portal is a separate deployment.

## 📁 Frontend Applications Overview

| App | Purpose | Recommended Vercel Project Name |
|-----|---------|--------------------------------|
| `apps/landing/` | Main landing page | `esal-platform` |
| `apps/innovator-portal/` | For entrepreneurs | `esal-innovator-portal` |
| `apps/investor-portal/` | For investors | `esal-investor-portal` |
| `apps/hub-portal/` | For innovation hubs | `esal-hub-portal` |
| `apps/admin-portal/` | For administrators | `esal-admin-portal` |

## 🔧 Vercel Deployment Instructions

### Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Push your code to GitHub (if not already done)

### Option 1: Deploy via Vercel CLI (Recommended)

For each app, navigate to its directory and deploy:

```powershell
# Deploy Landing Page
cd "d:\esalPlatform\EsalPlatform\apps\landing"
vercel --prod

# Deploy Innovator Portal
cd "d:\esalPlatform\EsalPlatform\apps\innovator-portal"
vercel --prod

# Deploy Investor Portal
cd "d:\esalPlatform\EsalPlatform\apps\investor-portal"
vercel --prod

# Deploy Hub Portal
cd "d:\esalPlatform\EsalPlatform\apps\hub-portal"
vercel --prod

# Deploy Admin Portal
cd "d:\esalPlatform\EsalPlatform\apps\admin-portal"
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. For each deployment, configure:

#### Landing Page Deployment
- **Framework Preset**: Vite
- **Root Directory**: `EsalPlatform/apps/landing`
- **Build Command**: `pnpm install && pnpm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

#### Environment Variables (for all deployments):
```
VITE_API_URL=https://esalplatform-1.onrender.com
VITE_SUPABASE_URL=https://ppvkucdspgoeqsxxydxg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmt1Y2RzcGdvZXFzeHh5ZHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNTkzMzAsImV4cCI6MjA2MzczNTMzMH0.6VVpA6qEcjNPJvPvn0dMh7CUNkNTCYGWsMwb6WS0XGE
VITE_APP_TITLE=ESAL Platform
VITE_ENVIRONMENT=production
```

## 🔄 Post-Deployment Steps

### 1. Update API CORS Settings

After deploying, you'll get Vercel URLs like:
- `https://esal-platform.vercel.app` (Landing)
- `https://esal-innovator-portal.vercel.app` (Innovator)
- `https://esal-investor-portal.vercel.app` (Investor)
- etc.

### 2. Redeploy API with Updated CORS

The API configuration has already been updated to include these URLs. If you used different names, update the CORS settings in:

```
apps/api/app/config.py (lines 40-60)
apps/api/.env.production (ALLOWED_ORIGINS)
```

Then redeploy the API on Render.

### 3. Test Each Portal

Visit each deployed URL and test:
- ✅ Page loads correctly
- ✅ API calls work (check browser console)
- ✅ Authentication flows
- ✅ Navigation between portals

## 🎯 Expected Deployment URLs

After deployment, you should have:

| Portal | URL |
|--------|-----|
| Landing | `https://esal-platform.vercel.app` |
| Innovator | `https://esal-innovator-portal.vercel.app` |
| Investor | `https://esal-investor-portal.vercel.app` |
| Hub | `https://esal-hub-portal.vercel.app` |
| Admin | `https://esal-admin-portal.vercel.app` |
| API | `https://esalplatform-1.onrender.com` ✅ |

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that `pnpm install` works locally
   - Verify all dependencies are in `package.json`
   - Check for TypeScript errors

2. **API Calls Fail**
   - Verify `VITE_API_URL` is set correctly
   - Check browser console for CORS errors
   - Ensure API CORS includes your Vercel URLs

3. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Check they're set in Vercel dashboard
   - Redeploy after adding new variables

4. **404 on Refresh**
   - Vercel should handle this with the `vercel.json` rewrites
   - If issues persist, check routing configuration

## 📋 Quick Reference Commands

```powershell
# Build locally to test
cd "d:\esalPlatform\EsalPlatform\apps\landing"
pnpm install
pnpm run build
pnpm run preview

# Deploy specific app
cd "d:\esalPlatform\EsalPlatform\apps\landing"
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

## 🎉 Success Criteria

✅ All 5 frontend apps deployed to Vercel  
✅ API accessible from all frontend apps  
✅ Authentication flows working  
✅ Navigation between portals functional  
✅ No CORS errors in browser console  

Once all deployments are complete, you'll have a fully functional multi-portal platform!
