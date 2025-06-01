-- ========================================
-- FRESH SUPABASE DATABASE SETUP
-- ========================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- Run it after deleting all existing tables

-- ========================================
-- STEP 1: CREATE TABLES
-- ========================================

-- 1. Ideas Table
CREATE TABLE ideas (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'private',
    view_count INTEGER DEFAULT 0,
    interest_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Files Table  
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id BIGINT REFERENCES ideas(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    company VARCHAR(100),
    position VARCHAR(100),
    location VARCHAR(100),
    website_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    github_url TEXT,
    phone VARCHAR(20),
    skills TEXT[],
    interests TEXT[],
    experience_years INTEGER,
    education TEXT,
    total_ideas INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_interests INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 2: CREATE INDEXES
-- ========================================

CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_category ON ideas(category);
CREATE INDEX idx_ideas_visibility ON ideas(visibility);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_idea_id ON files(idea_id);
CREATE INDEX idx_profiles_username ON profiles(username);

-- ========================================
-- STEP 3: CREATE FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_ideas_updated_at 
    BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles  
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY; 
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 5: CREATE RLS POLICIES
-- ========================================

-- IDEAS TABLE POLICIES
-- Users can view their own ideas
CREATE POLICY "ideas_select_own" ON ideas
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view public ideas from others
CREATE POLICY "ideas_select_public" ON ideas  
    FOR SELECT USING (visibility = 'public');

-- Users can insert their own ideas
CREATE POLICY "ideas_insert_own" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own ideas
CREATE POLICY "ideas_update_own" ON ideas
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own ideas  
CREATE POLICY "ideas_delete_own" ON ideas
    FOR DELETE USING (auth.uid() = user_id);

-- FILES TABLE POLICIES
-- Users can view their own files
CREATE POLICY "files_select_own" ON files
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own files
CREATE POLICY "files_insert_own" ON files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own files
CREATE POLICY "files_update_own" ON files
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "files_delete_own" ON files
    FOR DELETE USING (auth.uid() = user_id);

-- PROFILES TABLE POLICIES  
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Anyone can view other users' profiles (for discovery)
CREATE POLICY "profiles_select_others" ON profiles
    FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- ========================================
-- STEP 6: CREATE STORAGE BUCKETS
-- ========================================

-- Create bucket for idea files (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('idea-files', 'idea-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for avatars (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STEP 7: ENABLE STORAGE RLS
-- ========================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 8: CREATE STORAGE POLICIES
-- ========================================

-- IDEA FILES BUCKET POLICIES (Private Files)
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

-- AVATARS BUCKET POLICIES (Public Read, User Upload)
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
-- STEP 9: GRANT PERMISSIONS
-- ========================================

-- Grant sequence permissions for auto-increment
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ideas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- Grant storage permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated, anon;

-- ========================================
-- STEP 10: UTILITY FUNCTIONS
-- ========================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_idea_stats(user_uuid UUID)
RETURNS TABLE(
    total_ideas INTEGER,
    active_ideas INTEGER,
    total_views INTEGER,
    total_interests INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_ideas,
        COUNT(CASE WHEN status IN ('active', 'published') THEN 1 END)::INTEGER as active_ideas,
        COALESCE(SUM(view_count), 0)::INTEGER as total_views,
        COALESCE(SUM(interest_count), 0)::INTEGER as total_interests
    FROM ideas 
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check that tables were created
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('ideas', 'files', 'profiles')
ORDER BY tablename;

-- Check that policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname
FROM pg_policies 
WHERE tablename IN ('ideas', 'files', 'profiles')
ORDER BY tablename, policyname;

-- Check storage buckets
SELECT id, name, public FROM storage.buckets;

-- Check storage policies
SELECT 
    policyname, 
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- Success message
SELECT 
    '🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!' as status,
    'Tables: ideas, files, profiles' as tables_created,
    'RLS enabled on all tables' as security,
    'Storage buckets: idea-files, avatars' as storage;
