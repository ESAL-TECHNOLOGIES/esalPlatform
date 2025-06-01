# Supabase Service Role Key Setup

## Problem
The application is encountering "new row violates row-level security policy" errors because profile creation and avatar upload operations require bypassing RLS (Row Level Security) policies.

## Solution
Add your Supabase service role key to the environment configuration to allow the application to bypass RLS for admin operations.

## Steps to Get Your Service Role Key

1. **Go to your Supabase Dashboard**
   - Visit https://app.supabase.com
   - Select your project: `ppvkucdspgoeqsxxydxg`

2. **Navigate to Project Settings**
   - Click on the "Settings" icon in the left sidebar
   - Go to "API" section

3. **Find Your Service Role Key**
   - Look for the "Project API keys" section
   - Copy the **service_role** key (NOT the anon/public key)
   - ⚠️ **Important**: This is a secret key - keep it secure!

4. **Add to Your Environment**

   **Option A: Environment Variables (Recommended)**
   ```bash
   # Add this to your .env file in apps/api/
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   **Option B: Direct Configuration (For Testing)**
   ```python
   # In apps/api/app/config.py, update the line:
   SUPABASE_SERVICE_ROLE_KEY: str = "your-service-role-key-here"
   ```

5. **Restart Your API Server**
   ```bash
   # Stop the current server (Ctrl+C) and restart
   cd apps/api
   uvicorn app.main:app --reload --port 8000
   ```

## What This Fixes

✅ **Profile Creation**: New users can create profiles without RLS policy violations
✅ **Profile Updates**: Users can update their profile information  
✅ **Avatar Uploads**: Users can upload and update their profile pictures
✅ **Storage Operations**: Files can be uploaded to Supabase storage buckets

## Security Note

The service role key bypasses ALL RLS policies and has full database access. In production:
- Store it securely in environment variables
- Never commit it to version control
- Consider using more granular permissions if possible
- Monitor its usage through Supabase logs

## Verification

After adding the service role key, you should see these logs in your API server:
```
INFO: Service role client created for RLS bypass
INFO: Created profile using service role for user [user-id]
INFO: Updated profile using service role for user [user-id]
```

If you see warnings like:
```
WARNING: No service role key available - some operations may fail
WARNING: Created profile using anon key for user [user-id] - may fail due to RLS
```

Then the service role key is not properly configured.
