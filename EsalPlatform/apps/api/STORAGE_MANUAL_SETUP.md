# 🗄️ Supabase Storage Setup Guide

## ⚠️ Important Note
Storage buckets and policies cannot be created through the SQL editor due to permission restrictions. They must be set up through the Supabase Dashboard or using the service role key via API.

## Option 1: Manual Dashboard Setup (Recommended)

### Step 1: Create Storage Buckets

1. **Go to your Supabase Dashboard**
2. **Navigate to Storage**
3. **Create the following buckets:**

#### Bucket 1: idea-files (Private)
- **Name**: `idea-files`
- **Public**: `false` (unchecked)
- **Description**: Private files for user ideas

#### Bucket 2: avatars (Public)
- **Name**: `avatars`  
- **Public**: `true` (checked)
- **Description**: User avatar images

### Step 2: Configure Storage Policies

#### For `idea-files` bucket:
Navigate to Storage > idea-files > Policies and create these policies:

**1. Users can upload their own files**
```sql
CREATE POLICY "idea_files_insert_own" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'idea-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**2. Users can view their own files**
```sql
CREATE POLICY "idea_files_select_own" ON storage.objects
FOR SELECT USING (
    bucket_id = 'idea-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**3. Users can update their own files**
```sql
CREATE POLICY "idea_files_update_own" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'idea-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**4. Users can delete their own files**
```sql
CREATE POLICY "idea_files_delete_own" ON storage.objects
FOR DELETE USING (
    bucket_id = 'idea-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### For `avatars` bucket:
Navigate to Storage > avatars > Policies and create these policies:

**1. Anyone can view avatars**
```sql
CREATE POLICY "avatars_select_public" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

**2. Users can upload their own avatar**
```sql
CREATE POLICY "avatars_insert_own" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**3. Users can update their own avatar**
```sql
CREATE POLICY "avatars_update_own" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**4. Users can delete their own avatar**
```sql
CREATE POLICY "avatars_delete_own" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Option 2: Automated Setup (If you have service role access)

If you have access to the service role key, you can use the Python script:

```powershell
python setup_rls.py
```

This will set up both the database tables and storage buckets automatically.

## Verification

After setting up storage:

1. **Check buckets exist**:
   - Go to Storage in your Supabase Dashboard
   - Verify both `idea-files` and `avatars` buckets are created

2. **Test file upload**:
   - Try uploading a test file to verify permissions work correctly

## File Upload Structure

### For idea files:
```
idea-files/
  └── {user_id}/
      ├── idea_123_document.pdf
      ├── idea_456_image.jpg
      └── ...
```

### For avatars:
```
avatars/
  └── {user_id}/
      └── avatar.jpg
```

## 🔐 Security Benefits

- ✅ **User Isolation**: Each user can only access files in their own folder
- ✅ **Public Avatars**: Avatar images are publicly accessible for displaying profiles
- ✅ **Private Ideas**: Idea files are private and only accessible by the owner
- ✅ **Organized Structure**: Clear folder structure based on user IDs

## Next Steps

After storage setup is complete:
1. Test file uploads from your application
2. Verify user isolation is working
3. Test avatar display functionality
4. Monitor storage usage in Supabase Dashboard

---

**Storage setup complete!** Your Supabase database is now fully configured for secure file handling. 🚀
