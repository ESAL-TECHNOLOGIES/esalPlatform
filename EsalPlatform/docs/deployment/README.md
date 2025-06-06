# ESAL Platform Deployment Guide

This guide covers deploying the ESAL Platform using **Supabase** (database + auth) and **Render** (hosting) - a modern, cost-effective approach for production deployment.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Supabase Setup](#supabase-setup)
- [Environment Configuration](#environment-configuration)
- [API Deployment on Render](#api-deployment-on-render)
- [Frontend Deployment on Render](#frontend-deployment-on-render)
- [Domain Configuration](#domain-configuration)
- [Production Optimization](#production-optimization)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Overview

**Deployment Architecture:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Supabase      │
│   (Render)      │───▶│   (Render)      │───▶│   (Cloud)       │
│   Static Sites  │    │   FastAPI       │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    │   Auth          │
                                              │   Storage       │
                                              └─────────────────┘
```

**Deployment Stack:**
- **Database & Auth**: Supabase (PostgreSQL + built-in authentication)
- **API Hosting**: Render Web Service (FastAPI backend)
- **Frontend Hosting**: Render Static Sites (React portals)
- **Domain Management**: Render Custom Domains
- **SSL**: Automatic Let's Encrypt certificates

## Prerequisites

Before deploying, ensure you have:

### Accounts Required
- [Supabase Account](https://supabase.com) (Free tier available)
- [Render Account](https://render.com) (Free tier available)
- [GitHub Account](https://github.com) (for code repository)
- Domain name (optional, Render provides free subdomains)

### Local Development Setup
- Git repository with your ESAL Platform code
- Node.js 18+ and pnpm installed locally
- Python 3.9+ for API development

### Code Repository
Ensure your code is pushed to a GitHub repository that Render can access.

## Supabase Setup

### 1. Create New Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `esal-platform-prod`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Database Schema Setup

Once your project is created:

1. Go to **SQL Editor** in Supabase dashboard
2. Run the complete setup script:

```sql
-- Copy and paste the content from: apps/api/complete_supabase_setup.sql
-- This creates all necessary tables, RLS policies, and functions
```

Alternatively, use the Python setup script:

```bash
cd apps/api
python complete_setup.py --supabase-url YOUR_SUPABASE_URL --service-key YOUR_SERVICE_KEY
```

### 3. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `https://your-domain.com` (or Render URL initially)
3. Add **Redirect URLs**:
   ```
   https://your-api-domain.onrender.com/auth/callback
   https://your-frontend-domain.onrender.com/auth/callback
   https://your-domain.com/auth/callback
   ```

4. **Email Templates** (optional):
   - Customize signup confirmation email
   - Customize password recovery email

### 4. Get Supabase Credentials

From your Supabase project settings:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJ...`
   - **service_role secret key**: `eyJ...` (keep this secure!)

## Environment Configuration

### 1. Update Production Secrets

Edit your production environment file:

```bash
# Edit the production environment
nano secrets/environments/.env.production
```

Configure with your Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
DEBUG=false
ENVIRONMENT=production
PROJECT_NAME=ESAL Platform
API_VERSION=v1

# CORS Configuration (update with your Render URLs)
ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-api.onrender.com,https://your-domain.com

# JWT Configuration
JWT_SECRET_KEY=your-super-secure-production-jwt-key-generate-with-openssl
JWT_ALGORITHM=HS256
JWT_EXPIRATION_TIME=3600

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (you can use Supabase's built-in email or configure SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-production-email@gmail.com
SMTP_FROM_NAME=ESAL Platform

# Redis (optional - Render has Redis add-on)
REDIS_URL=redis://username:password@hostname:port
```

### 2. Environment Variables for Render

You'll need these environment variables in Render (we'll set them up in the next sections):

**For API Service:**
- All variables from `.env.production`
- `PYTHON_VERSION=3.9.18`
- `NODE_ENV=production`

**For Frontend Services:**
- `VITE_API_URL=https://your-api.onrender.com`
- `VITE_SUPABASE_URL=https://your-project.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJ...`

## API Deployment on Render

### 1. Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `esal-platform-api`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your production branch)
- **Root Directory**: `apps/api`
- **Runtime**: `Python 3`

**Build & Deploy:**
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

### 2. Configure Environment Variables

In your Render service settings, add all environment variables from your `.env.production` file:

**Essential Variables:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET_KEY=your-secure-key
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-domain.com
GEMINI_API_KEY=your-gemini-key
```

**Python Runtime:**
```
PYTHON_VERSION=3.9.18
```

### 3. Deploy API

1. Click "Create Web Service"
2. Render will automatically:
   - Build your application
   - Install dependencies
   - Start the server
3. Monitor the deployment in the logs
4. Once deployed, you'll get a URL like: `https://esal-platform-api.onrender.com`

### 4. Verify API Deployment

Test your API endpoints:

```bash
# Health check
curl https://your-api.onrender.com/health

# API documentation
curl https://your-api.onrender.com/docs
```

## Frontend Deployment on Render

Deploy each portal as a separate static site for better performance and scalability.

### 1. Landing Page Deployment

**Create Static Site:**
1. Render Dashboard → "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:

**Settings:**
- **Name**: `esal-landing`
- **Branch**: `main`
- **Root Directory**: `apps/landing`
- **Build Command**: 
  ```bash
  pnpm install && pnpm run build
  ```
- **Publish Directory**: `dist`

**Environment Variables:**
```
VITE_API_URL=https://your-api.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. Hub Portal Deployment

**Create Static Site:**
- **Name**: `esal-hub-portal`
- **Root Directory**: `apps/hub-portal`
- **Build Command**: `pnpm install && pnpm run build`
- **Publish Directory**: `dist`

**Environment Variables:** (same as landing page)

### 3. Innovator Portal Deployment

**Create Static Site:**
- **Name**: `esal-innovator-portal`
- **Root Directory**: `apps/innovator-portal`
- **Build Command**: `pnpm install && pnpm run build`
- **Publish Directory**: `dist`

### 4. Investor Portal Deployment

**Create Static Site:**
- **Name**: `esal-investor-portal`
- **Root Directory**: `apps/investor-portal`
- **Build Command**: `pnpm install && pnpm run build`
- **Publish Directory**: `dist`

### 5. Admin Portal Deployment

**Create Static Site:**
- **Name**: `esal-admin-portal`
- **Root Directory**: `apps/admin-portal`
- **Build Command**: `pnpm install && pnpm run build`
- **Publish Directory**: `dist`

### 6. Update CORS Configuration

After deploying all frontends, update your API's `ALLOWED_ORIGINS`:

```bash
# In Render API service environment variables
ALLOWED_ORIGINS=https://esal-landing.onrender.com,https://esal-hub-portal.onrender.com,https://esal-innovator-portal.onrender.com,https://esal-investor-portal.onrender.com,https://esal-admin-portal.onrender.com
```

## Domain Configuration

### 1. Custom Domains (Optional)

**For API:**
1. In Render API service → Settings → Custom Domains
2. Add: `api.yourdomain.com`
3. Configure DNS with your domain provider:
   ```
   CNAME api yourapidomain.onrender.com
   ```

**For Frontend:**
1. In each static site → Settings → Custom Domains
2. Add appropriate subdomains:
   - `www.yourdomain.com` (landing)
   - `hub.yourdomain.com` (hub portal)
   - `innovator.yourdomain.com` (innovator portal)
   - `investor.yourdomain.com` (investor portal)
   - `admin.yourdomain.com` (admin portal)

### 2. Update Supabase URLs

After setting up custom domains, update Supabase:

1. **Authentication** → **Settings** → **Site URL**: `https://www.yourdomain.com`
2. **Redirect URLs**: Add all your custom domain URLs

### 3. Update Environment Variables

Update all services with new domain URLs in their environment variables.

## Production Configuration

### Security Checklist

- [ ] Use HTTPS (SSL/TLS certificates)
- [ ] Set secure JWT secret keys
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Environment variable security

### Performance Optimization

1. **API Optimization**:
   - Enable gzip compression
   - Use connection pooling
   - Implement caching (Redis)
   - Database query optimization

2. **Frontend Optimization**:
   - Code splitting
   - Asset compression
   - CDN for static assets
   - Service worker for caching

### Load Balancing

```nginx
upstream esal_api {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    location /api {
        proxy_pass http://esal_api;
    }
}
```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoints**:
   ```python
   @app.get("/health")
   async def health_check():
       return {"status": "healthy", "timestamp": datetime.utcnow()}
   ```

2. **Logging Configuration**:
   ```python
   import logging
   
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
       handlers=[
           logging.FileHandler('/var/log/esal/api.log'),
           logging.StreamHandler()
       ]
   )
   ```

### Database Monitoring

- Monitor connection pools
- Track query performance
- Set up backup schedules
- Monitor disk usage

### Server Monitoring

Tools to consider:
- **Uptime monitoring**: Pingdom, UptimeRobot
- **Application monitoring**: New Relic, DataDog
- **Server monitoring**: Prometheus + Grafana
- **Log aggregation**: ELK Stack, Fluentd

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy ESAL Platform

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd apps/api
          pip install -r requirements-test.txt
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build frontend
        run: |
          pnpm install
          pnpm run build
      
      - name: Deploy to server
        run: |
          rsync -avz --delete dist/ user@server:/var/www/esal/
          ssh user@server 'sudo systemctl restart esal-api'
```

### Deployment Strategies

1. **Blue-Green Deployment**
2. **Rolling Deployment**
3. **Canary Deployment**

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   ```bash
   # Check database status
   sudo systemctl status postgresql
   
   # Check connection
   psql -h localhost -U esal_user -d esal_platform
   ```

2. **API Server Not Starting**:
   ```bash
   # Check logs
   journalctl -u esal-api -f
   
   # Check port availability
   netstat -tulpn | grep :8000
   ```

3. **Frontend Build Failures**:
   ```bash
   # Clear cache
   pnpm store prune
   rm -rf node_modules
   pnpm install
   ```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# API debug mode
export DEBUG=true
export LOG_LEVEL=debug

# Frontend debug mode
export NODE_ENV=development
```

### Performance Issues

1. **Database Performance**:
   - Check slow query log
   - Analyze query execution plans
   - Optimize indexes

2. **API Performance**:
   - Profile with tools like `py-spy`
   - Monitor memory usage
   - Check for N+1 queries

### Backup and Recovery

1. **Database Backup**:
   ```bash
   # PostgreSQL backup
   pg_dump -h localhost -U esal_user esal_platform > backup.sql
   
   # Restore
   psql -h localhost -U esal_user esal_platform < backup.sql
   ```

2. **File Backup**:
   ```bash
   # Backup uploads and secrets
   tar -czf backup-$(date +%Y%m%d).tar.gz uploads/ secrets/
   ```

## Support

For deployment support:
- Check the [troubleshooting section](#troubleshooting)
- Review application logs
- Check system monitoring
- Contact the development team

---

*This deployment guide is part of the ESAL Platform documentation.*
