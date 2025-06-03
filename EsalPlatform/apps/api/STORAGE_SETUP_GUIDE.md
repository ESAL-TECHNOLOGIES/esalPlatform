# 📁 Storage Buckets Setup Guide

This guide will help you create the required storage buckets for the Innovator Portal profile functionality.

## 🎯 Required Buckets

1. **`avatars`** - Public bucket for user profile pictures (5MB limit)
2. **`uploads`** - Private bucket for file uploads and attachments (3MB limit)

## 🚀 Setup Methods

### Method 1: Automated Python Script (Recommended)

1. **Install dependencies** (if not already installed):
   ```powershell
   cd EsalPlatform\apps\api
   pip install python-dotenv
   ```

2. **Set environment variables** in your `.env` file:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run the setup script**:
   ```powershell
   python setup_storage_buckets.py
   ```

### Method 2: Manual SQL Setup

If the automated script doesn't work, run the SQL commands manually:

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy and run** the contents of `manual_storage_setup.sql`

### Method 3: Supabase Dashboard UI

1. **Go to Storage** in your Supabase dashboard
2. **Create buckets**:
   - Name: `avatars`, Public: ✅ (checked)
   - Name: `uploads`, Public: ❌ (unchecked)
3. **Set up policies** using the SQL from Method 2

## 🔐 Security Policies

The setup creates the following security policies:

### Avatars Bucket (Public Read)
- ✅ Anyone can view avatar images
- ✅ Users can upload to their own folder
- ✅ Users can update their own avatars
- ✅ Users can delete their own avatars

### Uploads Bucket (Private)
- ✅ Users can only access their own files
- ✅ Users can upload to their own folder
- ✅ Users can view, update, and delete their own files

## 📂 Folder Structure

```
avatars/
├── user_id_1/
│   ├── avatar_uuid1.jpg
│   └── avatar_uuid2.png
└── user_id_2/
    └── avatar_uuid3.jpg

uploads/
├── ideas/
│   └── user_id_1/
│       ├── file_uuid1.pdf
│       └── file_uuid2.docx
└── user_id_2/
    └── document_uuid.pdf
```

## ✅ Verification

After setup, verify everything works:

1. **Check buckets exist**:
   ```sql
   SELECT * FROM storage.buckets WHERE name IN ('avatars', 'uploads');
   ```

2. **Check policies**:
   ```sql
   SELECT policyname, cmd FROM pg_policies 
   WHERE tablename = 'objects' AND schemaname = 'storage';
   ```

3. **Test avatar upload** through the profile page

## 🐛 Troubleshooting

### Error: "bucket does not exist"
- Run the bucket creation commands again
- Check the bucket names are correct (`avatars`, `uploads`)

### Error: "new row violates row-level security policy"
- Ensure RLS policies are created correctly
- Check user authentication is working

### Error: "could not find bucket"
- Verify bucket creation was successful
- Check bucket permissions in Supabase dashboard

### Error: "file upload failed"
- Check file size limits (5MB for avatars, 3MB for uploads)
- Verify file types are allowed (images for avatars)
- Check user authentication token

## 📝 Notes

- Avatar images are publicly accessible (can be viewed without authentication)
- Upload files are private (require authentication and ownership)
- File paths include user ID for security and organization
- All uploads are automatically organized by user and purpose
- Storage policies ensure users can only access their own files

## 🔄 Updates

If you need to modify the setup:

1. **Update bucket settings** in Supabase dashboard → Storage
2. **Modify policies** using SQL editor
3. **Adjust file size limits** in the bucket configuration
4. **Update MIME type restrictions** if needed
