# ESAL Platform Deployment Quick Reference

## 🚀 Quick Deploy Checklist

### 1. Supabase Setup (5 min)
- [ ] Create Supabase project
- [ ] Copy Project URL & API Keys
- [ ] Run SQL setup script in Supabase SQL Editor
- [ ] Configure auth settings & redirect URLs

### 2. Environment Configuration (2 min)
- [ ] Update `secrets/environments/.env.production`
- [ ] Set Supabase credentials
- [ ] Configure JWT secret key
- [ ] Add AI API keys (Gemini/OpenAI)

### 3. API Deployment on Render (3 min)
- [ ] Create Web Service from GitHub repo
- [ ] Set root directory: `apps/api`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables from `.env.production`

### 4. Frontend Deployments on Render (10 min)
Deploy each portal as Static Site:

**Landing Page:**
- [ ] Root directory: `apps/landing`
- [ ] Build: `pnpm install && pnpm run build`
- [ ] Publish: `dist`

**Hub Portal:**
- [ ] Root directory: `apps/hub-portal`
- [ ] Build: `pnpm install && pnpm run build`
- [ ] Publish: `dist`

**Innovator Portal:**
- [ ] Root directory: `apps/innovator-portal`
- [ ] Build: `pnpm install && pnpm run build`
- [ ] Publish: `dist`

**Investor Portal:**
- [ ] Root directory: `apps/investor-portal`
- [ ] Build: `pnpm install && pnpm run build`
- [ ] Publish: `dist`

**Admin Portal:**
- [ ] Root directory: `apps/admin-portal`
- [ ] Build: `pnpm install && pnpm run build`
- [ ] Publish: `dist`

### 5. Final Configuration (2 min)
- [ ] Update CORS origins with all Render URLs
- [ ] Test API health endpoint
- [ ] Test frontend portals
- [ ] Configure custom domains (optional)

## 🔑 Essential Environment Variables

**Supabase:**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Application:**
```bash
DEBUG=false
ENVIRONMENT=production
JWT_SECRET_KEY=your-secure-key
ALLOWED_ORIGINS=https://your-sites.onrender.com
```

**Frontend (all portals):**
```bash
VITE_API_URL=https://your-api.onrender.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 🔗 Useful URLs

**After Deployment:**
- API Docs: `https://your-api.onrender.com/docs`
- Health Check: `https://your-api.onrender.com/health`
- Supabase Dashboard: `https://supabase.com/dashboard/project/xxx`
- Render Dashboard: `https://dashboard.render.com`

## 🚨 Common Issues & Fixes

**Build Failures:**
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

**CORS Errors:**
- Check `ALLOWED_ORIGINS` includes all frontend URLs
- Update Supabase redirect URLs

**Database Connection:**
- Verify Supabase credentials
- Check Supabase project status
- Confirm RLS policies are set up

**API Not Starting:**
- Check Render logs for errors
- Verify Python dependencies in requirements.txt
- Confirm start command is correct

## 📞 Support Resources

- [Main Deployment Guide](./README.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Render Documentation](https://render.com/docs)
- [Project Repository Issues](https://github.com/your-repo/issues)

---

**Total deployment time: ~20 minutes**

> 💡 **Pro Tip**: Deploy in this exact order to avoid CORS and authentication issues.
