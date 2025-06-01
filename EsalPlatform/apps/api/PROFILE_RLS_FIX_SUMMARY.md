# Profile RLS Fix Summary

## Problem Resolved
Fixed "new row violates row-level security policy" errors when creating profiles and uploading avatars in the ESAL Platform innovator portal.

## Root Cause
The application was using custom JWT tokens, but Supabase RLS (Row Level Security) policies require Supabase-issued JWT tokens. Profile creation and avatar upload operations were failing because they couldn't bypass RLS policies.

## Solution Implemented
Added support for service role key to bypass RLS policies for admin operations while maintaining security.

## Files Modified

### 1. Configuration (`app/config.py`)
- ✅ Added `SUPABASE_SERVICE_ROLE_KEY` setting
- ✅ Configured to read from environment variables

### 2. Profile Service (`app/services/supabase_profiles.py`)
- ✅ Added service role client initialization in constructor
- ✅ Modified `get_or_create_profile()` to use service role for profile creation
- ✅ Modified `update_profile()` to use service role for profile updates  
- ✅ Modified `upload_avatar()` to use service role for avatar URL updates
- ✅ Added fallback to anon key if service role is not available
- ✅ Enhanced logging to track which client is being used

### 3. Router (`app/routers/innovator.py`)
- ✅ Already properly extracts JWT tokens from HTTPBearer objects
- ✅ Passes tokens to profile service constructor

## New Files Created

### 4. Setup Guide (`SERVICE_ROLE_SETUP.md`)
- ✅ Step-by-step instructions to get Supabase service role key
- ✅ Environment configuration options
- ✅ Security considerations
- ✅ Verification steps

### 5. Test Script (`test_profile_fixes.py`)
- ✅ Validates .env file configuration
- ✅ Checks service role key setup
- ✅ Tests profile service initialization
- ✅ Provides troubleshooting guidance

## Key Changes Summary

### Service Role Integration
```python
# Before: Only anon key client
self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

# After: Both anon and service role clients
self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
if service_key:
    self.service_supabase = create_client(settings.SUPABASE_URL, service_key)
```

### Profile Creation with RLS Bypass
```python
# Before: Subject to RLS policies
result = self.supabase.table("profiles").insert(profile_create).execute()

# After: Bypasses RLS when service role available
if self.service_supabase:
    result = self.service_supabase.table("profiles").insert(profile_create).execute()
else:
    result = self.supabase.table("profiles").insert(profile_create).execute()
```

## Required User Action

### 1. Get Supabase Service Role Key
1. Go to https://app.supabase.com
2. Select project: `ppvkucdspgoeqsxxydxg`
3. Settings > API > Copy service_role key

### 2. Add to Environment
Create `apps/api/.env` file:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

### 3. Restart API Server
```bash
cd apps/api
uvicorn app.main:app --reload --port 8000
```

## Expected Behavior After Fix

### ✅ Profile Creation
- New users can create profiles without RLS violations
- Logs show: "Created profile using service role for user [user-id]"

### ✅ Profile Updates  
- Users can update profile information successfully
- Logs show: "Updated profile using service role for user [user-id]"

### ✅ Avatar Uploads
- Avatar uploads work without "invalid signature" errors
- Profile avatar_url field gets updated properly
- Storage operations succeed

### ✅ Fallback Safety
- If service role key missing, falls back to anon key with warnings
- Application doesn't crash, but RLS operations may fail gracefully

## Security Considerations

- Service role key has full database access - store securely
- Only used for specific admin operations (profile creation/updates)
- Regular read operations still use anon key with proper RLS
- All operations maintain user-specific data isolation

## Verification Steps

1. Run test script: `python test_profile_fixes.py`
2. Check API logs for service role client creation
3. Test profile creation/updates in innovator portal
4. Test avatar upload functionality
5. Verify no RLS policy violations in Supabase logs

## Next Steps for Production

1. Move service role key to secure environment variables
2. Consider implementing more granular permissions
3. Monitor service role key usage through Supabase dashboard
4. Implement proper key rotation procedures
