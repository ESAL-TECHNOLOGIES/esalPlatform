-- Complete Supabase Database Setup Script
-- Copy and paste this entire script into your Supabase SQL Editor and execute

-- ========================================
-- PART 1: CREATE TABLES
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

-- 3. User Profiles Table
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
-- PART 2: CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_idea_id ON files(idea_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ========================================
-- PART 3: CREATE FUNCTIONS AND TRIGGERS
-- ========================================

-- Updated timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create triggers
CREATE TRIGGER update_ideas_updated_at 
    BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 4: ENABLE RLS
-- ========================================

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PART 5: CREATE RLS POLICIES
-- ========================================

-- IDEAS TABLE POLICIES
CREATE POLICY "ideas_select_own" ON ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ideas_select_public" ON ideas
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "ideas_insert_own" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ideas_update_own" ON ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ideas_delete_own" ON ideas
    FOR DELETE USING (auth.uid() = user_id);

-- FILES TABLE POLICIES
CREATE POLICY "files_select_own" ON files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "files_insert_own" ON files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "files_update_own" ON files
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "files_delete_own" ON files
    FOR DELETE USING (auth.uid() = user_id);

-- PROFILES TABLE POLICIES
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_others" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- ========================================
-- PART 6: CREATE STORAGE BUCKETS
-- ========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('idea-files', 'idea-files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PART 7: STORAGE RLS POLICIES
-- ========================================

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Idea files bucket policies
CREATE POLICY "idea_files_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'idea-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "idea_files_select_own" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'idea-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "idea_files_update_own" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'idea-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "idea_files_delete_own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'idea-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Avatars bucket policies
CREATE POLICY "avatars_select_public" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_update_own" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_delete_own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check that tables exist
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('ideas', 'files', 'profiles');

-- Check policies exist
SELECT 
    schemaname, 
    tablename, 
    policyname 
FROM pg_policies 
WHERE tablename IN ('ideas', 'files', 'profiles');

-- Check storage buckets
SELECT id, name, public FROM storage.buckets;

-- Success message
SELECT 'Database setup completed successfully!' as status;
