# Portal Routing Fix Guide

## Issue
The portal URLs were returning 404 errors when accessing `/login` routes directly from the landing page.

## Root Cause
The Render deployments may not be properly configured for SPA (Single Page Application) routing, or the services were configured manually in the dashboard rather than using the `render.yaml` files.

## Applied Fix
Updated the landing page (`apps/landing/src/pages/LandingPage.tsx`) to redirect to root portal URLs instead of `/login` endpoints:

### Before:
```typescript
innovator: "https://innovator-portal.onrender.com/login"
investor: "https://investor-portal-vz2e.onrender.com/login" 
admin: "https://esal-admin-portal.onrender.com/login"
```

### After:
```typescript
innovator: "https://innovator-portal.onrender.com"
investor: "https://investor-portal-vz2e.onrender.com"
admin: "https://esal-admin-portal.onrender.com"
```

## How It Works Now
1. User clicks "Join as [Role]" on landing page
2. Gets redirected to portal root URL (e.g., `https://innovator-portal.onrender.com/`)
3. Portal's `ProtectedRoute` component checks for authentication
4. If not authenticated, automatically redirects to `/login` within the portal
5. User sees the login page

## Verification Steps
1. Test landing page "Join As" buttons
2. Verify redirection to portal root URLs
3. Confirm automatic redirect to login pages within portals
4. Test the full authentication flow

## Long-term Solution
To fully resolve the SPA routing issue on Render:

1. Ensure each portal service has the correct rewrite rule in Render dashboard:
   ```
   Source: /*
   Destination: /index.html
   ```

2. Or redeploy using the `render.yaml` files which already have the correct configuration:
   ```yaml
   routes:
     - type: rewrite
       source: /*
       destination: /index.html
   ```

## Portal URLs Summary
- **Innovator Portal**: https://innovator-portal.onrender.com
- **Investor Portal**: https://investor-portal-vz2e.onrender.com  
- **Hub Portal**: https://esal-hub-portal.onrender.com
- **Admin Portal**: https://esal-admin-portal.onrender.com
- **Landing Page**: https://esalplatform.onrender.com
- **API**: https://esalplatform-1.onrender.com

All URLs are now correctly configured in environment variables and application code.
