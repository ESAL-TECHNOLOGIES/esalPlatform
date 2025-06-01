# 🔐 Complete Database & RLS Setup Guide

## Overview
This guide helps you set up your complete Supabase database including tables and Row Level Security (RLS) using your service role key.

## Quick Start Options

### Option 1: Automated Python Script (Recommended)
Run the complete setup script:
```powershell
python complete_setup.py
```

### Option 2: Manual SQL Execution  
Copy and paste [`complete_setup.sql`](./complete_setup.sql) into your Supabase SQL Editor.

## Option 1: Automated Python Script (Recommended)

### Prerequisites
- Python environment with `supabase` package installed
- Environment variables configured (see Environment Setup below)

### Environment Setup
Make sure your environment variables are properly configured:

1. **Copy the environment template**:
   ```powershell
   cp .env.example .env
   ```

2. **Update your `.env` file** with actual values:
   ```env
   SUPABASE_URL=https://ppvkucdspgoeqsxxydxg.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmt1Y2RzcGdvZXFzeHh5ZHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE1OTMzMCwiZXhwIjoyMDYzNzM1MzMwfQ.Tt2F9WnX6Dai3Yi2TBgzfUPK38XR4tIpLLh5rFMlU-s
   ```

### Steps
1. **Install dependencies** (if not already installed):
   ```powershell
   pip install supabase python-dotenv
   ```

2. **Run the RLS setup script**:
   ```powershell
   python setup_rls.py
   ```

3. **Follow the prompts** and confirm when asked

## Option 2: Manual SQL Execution

### Steps
1. **Open your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy the contents** of `reset_and_migrate.sql`
4. **Paste and execute** the SQL script
5. **Verify** that policies were created successfully

## What Gets Set Up

### 🛡️ Table Security
- **ideas**: Users can only access their own ideas + public ideas from others
- **files**: Users can only access their own files
- **profiles**: Users can access their own profile + view others' profiles

### 📁 Storage Security
- **idea-files bucket**: Private files, user-isolated folders
- **avatars bucket**: Public read access, user-controlled uploads

### 🔑 Policies Created
- **15 table policies** for comprehensive data protection
- **8 storage policies** for file isolation
- **Proper permissions** for authenticated and anonymous users

## Verification

After setup, you can verify RLS is working by:

1. **Check in Supabase Dashboard**: Go to Authentication > Policies
2. **Run verification query**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('ideas', 'files', 'profiles');
   ```

## Security Benefits

✅ **Data Isolation**: Users can only access their own data  
✅ **Public Content**: Controlled access to public ideas and profiles  
✅ **File Security**: Storage buckets with user-based folder isolation  
✅ **Admin Control**: Service role key allows administrative operations  
✅ **Best Practices**: Following Supabase security recommendations  

## Troubleshooting

### If Python script fails:
1. Check your `SUPABASE_URL` in `.env`
2. Verify your service role key is correct
3. Ensure Supabase project is accessible
4. Try the manual SQL approach instead

### If policies already exist:
- The script handles conflicts gracefully
- Existing policies may need to be dropped first
- Check Supabase Dashboard for existing policies

## Next Steps

After RLS is set up:
1. **Test authentication flow** with your application
2. **Create test users** and verify data isolation
3. **Test file uploads** to storage buckets
4. **Monitor security** in Supabase logs

## Important Notes

⚠️ **Service Role Key**: Only use for administrative setup, not in client applications  
⚠️ **Security**: RLS policies are enforced at the database level  
⚠️ **Testing**: Always test with multiple users to verify isolation  

---

Your database is now ready for secure multi-user operation! 🚀
