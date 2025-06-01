# Supabase Database Setup Guide (Simplified - No RLS)

## Overview
This guide will help you set up the required Supabase database tables and storage buckets for the ESAL Platform. RLS (Row Level Security) has been disabled for easier setup.

## Current Backend Configuration
The backend has been updated to use the **`avatars`** table structure (not `profiles`) to match your existing Supabase setup.

## Tables Required

### 1. `ideas` Table
- Stores user innovation ideas
- Fields: id, user_id, title, description, category, tags, status, visibility, view_count, interest_count, created_at, updated_at

### 2. `files` Table  
- Stores file uploads associated with ideas
- Fields: id, user_id, idea_id, filename, original_filename, file_path, file_size, content_type, description, created_at

### 3. `avatars` Table
- Stores user profile information (simplified structure)
- Fields: id, user_id, full_name, bio, expertise, location, website_url, linkedin_url, twitter_url, avatar_url, is_verified, created_at, updated_at

### 4. `comments` Table
- Stores comments and feedback on ideas
- Fields: id, user_id, idea_id, content, created_at, updated_at

### 5. Storage Buckets
- `idea-files` - For file uploads (private)
- `avatars` - For profile pictures (public read)

## Deployment Steps

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor

### Step 2: Execute Migration Script
1. Copy the contents of `supabase_migrations_simple.sql`
2. Paste into the SQL Editor
3. Click "Run" to execute the script

### Step 3: Verify Tables Created
1. Go to "Table Editor" in Supabase dashboard
2. Verify these tables exist:
   - `ideas`
   - `files` 
   - `avatars`

### Step 4: Verify Storage Buckets
1. Go to "Storage" in Supabase dashboard
2. Verify these buckets exist:
   - `idea-files` (private)
   - `avatars` (public)

### Step 5: Test Backend Connection
1. Start your backend server
2. Try to register a new user
3. Try to update a user profile
4. Check that data appears in the `avatars` table

## Backend Code Changes Made

The following files have been updated to use the correct table structure:

### `supabase_profiles.py`
- ✅ Changed from `profiles` table to `avatars` table
- ✅ Updated field mappings to match `avatars` table structure
- ✅ Fixed `get_profile()` to use `user_id` field
- ✅ Fixed `update_profile()` to use upsert with `user_id`
- ✅ Updated stats methods to use `ideas` table (not `idea-files`)
- ✅ Fixed activity methods to use correct table names

### Key Field Mappings
```python
# avatars table fields that backend now uses:
{
    "full_name": "full_name",
    "bio": "bio", 
    "expertise": "expertise",
    "location": "location",
    "website_url": "website_url",
    "linkedin_url": "linkedin_url",
    "twitter_url": "twitter_url", 
    "avatar_url": "avatar_url"
}
```

## Testing Checklist

After deployment, test these endpoints:

- [ ] `POST /auth/register` - Creates user and avatar profile
- [ ] `GET /profile/me` - Retrieves user profile from avatars table
- [ ] `PUT /profile/me` - Updates user profile in avatars table
- [ ] `POST /files/upload` - Uploads files to idea-files bucket
- [ ] `POST /ideas` - Creates ideas in ideas table
- [ ] `GET /dashboard` - Gets stats from ideas table

## Row Level Security (RLS)

RLS has been **disabled** for simplified setup. All authenticated users can access all data. You can enable RLS later if needed for security.

## Troubleshooting

### If tables already exist
The migration script uses `CREATE TABLE IF NOT EXISTS` so it won't fail if tables already exist. However, you may need to manually add missing columns.

### If storage buckets already exist
The script uses `ON CONFLICT DO NOTHING` for bucket creation.

### If you get permission errors
Make sure you're running the script as the database owner or with sufficient privileges.

## Next Steps

1. Execute the migration script
2. Test the backend endpoints
3. Verify data is being stored correctly
4. Test file uploads to storage buckets
5. Confirm RLS policies are working

The backend is now correctly configured to use the `avatars` table structure and should work properly once the database schema is deployed.
