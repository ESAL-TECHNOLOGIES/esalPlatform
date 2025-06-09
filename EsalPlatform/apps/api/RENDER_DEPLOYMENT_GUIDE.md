# ESAL Platform API - Render Deployment Guide

## Pre-Deployment Checklist

### 1. Code Preparation ✅
- [x] Set `DEBUG=False` as default in config.py
- [x] Removed hardcoded defaults for sensitive values
- [x] Updated CORS configuration to use settings
- [x] Added production logging configuration
- [x] Created start.sh script for Render

### 2. Environment Variables Setup

Set these environment variables in your Render service dashboard:

#### Required Variables:
```
ENVIRONMENT=production
DEBUG=False
SUPABASE_URL=your-production-supabase-url
SUPABASE_ANON_KEY=your-production-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-supabase-service-role-key
JWT_SECRET_KEY=your-super-secure-random-jwt-secret-32-chars-minimum
GEMINI_API_KEY=your-production-gemini-api-key
```

#### Site Configuration:
```
SITE_URL=https://your-frontend-domain.com
CONFIRM_EMAIL_REDIRECT_URL=https://your-frontend-domain.com/email-confirmed
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://esal-platform.vercel.app
```

#### Email Configuration (if using):
```
SMTP_USER=your-production-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-production-email@gmail.com
SMTP_FROM_NAME=ESAL Platform
```

#### Optional:
```
OPENAI_API_KEY=your-openai-api-key
VERIFICATION_CODE_EXPIRY_MINUTES=10
JWT_EXPIRATION_TIME=3600
```

### 3. Render Service Configuration

#### Build Settings:
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `bash start.sh`
- **Environment:** Python 3.11

#### Health Check:
- **Health Check Path:** `/health`
- **Health Check Timeout:** 30 seconds

#### Auto-Deploy:
- Enable auto-deploy from your main branch

### 4. Security Considerations

#### JWT Secret Key Generation:
Generate a secure JWT secret key (minimum 32 characters):
```python
import secrets
print(secrets.token_urlsafe(32))
```

#### CORS Origins:
Only include your actual frontend domains in production:
```
ALLOWED_ORIGINS=https://your-frontend.com,https://your-admin.com
```

### 5. Testing Your Deployment

1. **Health Check**: `GET https://your-api.onrender.com/health`
2. **API Docs**: `GET https://your-api.onrender.com/api/docs`
3. **CORS Test**: Make a request from your frontend domain

### 6. Common Issues & Solutions

#### Issue: CORS Errors
- Ensure your frontend domain is in `ALLOWED_ORIGINS`
- Check that HTTPS is used for production domains

#### Issue: Database Connection
- Verify Supabase credentials are correct
- Check that Supabase allows connections from Render IPs

#### Issue: Environment Variables Not Loading
- Verify all required environment variables are set in Render
- Check that variable names match exactly (case-sensitive)

### 7. Monitoring

#### Logs:
- Check Render service logs for startup issues
- Monitor application logs for runtime errors

#### Performance:
- Monitor response times via Render dashboard
- Set up health check alerts

### 8. Post-Deployment Steps

1. Test all API endpoints
2. Verify email functionality (if configured)
3. Test authentication flow
4. Update frontend API endpoints to use production URL
5. Set up monitoring and alerts

## Render Service Settings Summary

```yaml
Name: esal-platform-api
Environment: Python 3.11
Region: Choose closest to your users
Plan: Choose based on your needs

Build:
  Command: pip install -r requirements.txt
  
Deploy:
  Command: bash start.sh
  
Health Check:
  Path: /health
  
Environment Variables:
  [See section 2 above]
```

## Development vs Production

### Development (.env):
```
ENVIRONMENT=development
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,...
SITE_URL=http://localhost:3000
```

### Production (Render Environment Variables):
```
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://your-production-domain.com
SITE_URL=https://your-production-domain.com
```
