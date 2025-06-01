-- ========================================
-- STORAGE POLICIES SETUP
-- ========================================
-- Run this script in your Supabase SQL Editor after creating the storage buckets
-- This sets up secure access policies for idea-files and avatars buckets

-- ========================================
-- CLEAN UP EXISTING STORAGE POLICIES
-- ========================================

-- Remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "idea_files_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "idea_files_select_own" ON storage.objects;
DROP POLICY IF EXISTS "idea_files_update_own" ON storage.objects;
DROP POLICY IF EXISTS "idea_files_delete_own" ON storage.objects;

DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

-- ========================================
-- IDEA-FILES BUCKET POLICIES (PRIVATE)
-- ========================================

-- Users can upload their own files to idea-files bucket
CREATE POLICY "idea_files_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'idea-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can view their own files in idea-files bucket
CREATE POLICY "idea_files_select_own" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'idea-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can update their own files in idea-files bucket
CREATE POLICY "idea_files_update_own" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'idea-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own files in idea-files bucket
CREATE POLICY "idea_files_delete_own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'idea-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ========================================
-- AVATARS BUCKET POLICIES (PUBLIC READ)
-- ========================================

-- Anyone can view avatars (public bucket)
CREATE POLICY "avatars_select_public" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "avatars_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can update their own avatar
CREATE POLICY "avatars_update_own" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own avatar
CREATE POLICY "avatars_delete_own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check storage buckets exist
SELECT id, name, public FROM storage.buckets 
WHERE id IN ('idea-files', 'avatars', 'uploads')
ORDER BY name;

-- Check storage policies were created
SELECT 
    policyname, 
    cmd as operation,
    CASE 
        WHEN policyname LIKE '%idea_files%' THEN 'idea-files bucket'
        WHEN policyname LIKE '%avatars%' THEN 'avatars bucket'
        ELSE 'other'
    END as bucket_type
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%idea_files%' OR policyname LIKE '%avatars%'
ORDER BY bucket_type, policyname;

-- Success message
SELECT 
    '🎉 STORAGE POLICIES SETUP COMPLETED!' as status,
    'Buckets: idea-files (private), avatars (public)' as buckets_configured,
    'Security: User-isolated file access' as security,
    'Ready: Your storage is now secure!' as next_step;
