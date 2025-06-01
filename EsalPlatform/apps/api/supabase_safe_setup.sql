-- ========================================
-- SUPABASE SAFE DATABASE SETUP
-- ========================================
-- This script can be safely run in the Supabase SQL Editor
-- It excludes storage operations that require service role permissions

-- ========================================
-- STEP 1: CREATE TABLES
-- ========================================

-- 1. Ideas Table
CREATE TABLE IF NOT EXISTS ideas (
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
CREATE TABLE IF NOT EXISTS files (
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
CREATE TABLE IF NOT EXISTS profiles (
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

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_visibility ON ideas(visibility);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_idea_id ON files(idea_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

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
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
CREATE TRIGGER update_ideas_updated_at 
    BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
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

-- Clean up existing policies first
DROP POLICY IF EXISTS "ideas_select_own" ON ideas;
DROP POLICY IF EXISTS "ideas_select_public" ON ideas;
DROP POLICY IF EXISTS "ideas_insert_own" ON ideas;
DROP POLICY IF EXISTS "ideas_update_own" ON ideas;
DROP POLICY IF EXISTS "ideas_delete_own" ON ideas;

DROP POLICY IF EXISTS "files_select_own" ON files;
DROP POLICY IF EXISTS "files_insert_own" ON files;
DROP POLICY IF EXISTS "files_update_own" ON files;
DROP POLICY IF EXISTS "files_delete_own" ON files;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_others" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

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
-- STEP 6: UTILITY FUNCTIONS
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

-- Success message
SELECT 
    '🎉 BASIC DATABASE SETUP COMPLETED!' as status,
    'Tables: ideas, files, profiles' as tables_created,
    'RLS enabled on all tables' as security,
    'Next: Setup storage buckets manually' as next_step;
