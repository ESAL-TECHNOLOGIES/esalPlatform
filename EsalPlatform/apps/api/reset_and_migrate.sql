-- Supabase RLS (Row Level Security) Setup Script
-- This file is for PostgreSQL/Supabase only
-- Run this script directly in your Supabase SQL Editor
-- OR use the Python script: python setup_rls.py

-- Your Service Role Key (for reference): 
-- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmt1Y2RzcGdvZXFzeHh5ZHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE1OTMzMCwiZXhwIjoyMDYzNzM1MzMwfQ.Tt2F9WnX6Dai3Yi2TBgzfUPK38XR4tIpLLh5rFMlU-s

-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Go to your Supabase Dashboard > SQL Editor
-- 3. Paste and execute this script
-- 4. OR use the Python automation script: python setup_rls.py

-- PART 1: CREATE TABLES (if they don't exist)
-- =====================================================

-- 1. Ideas Table
CREATE TABLE IF NOT EXISTS ideas (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
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
    skills TEXT[], -- Array of skills
    interests TEXT[], -- Array of interests
    experience_years INTEGER,
    education TEXT,
    total_ideas INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_interests INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_idea_id ON files(idea_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 5. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PART 2: ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Clean up existing policies (if any)
DROP POLICY IF EXISTS "ideas_select_own" ON ideas;
DROP POLICY IF EXISTS "ideas_select_public" ON ideas;
DROP POLICY IF EXISTS "ideas_insert_own" ON ideas;
DROP POLICY IF EXISTS "ideas_update_own" ON ideas;
DROP POLICY IF EXISTS "ideas_delete_own" ON ideas;
DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can insert their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can delete their own ideas" ON ideas;

DROP POLICY IF EXISTS "files_select_own" ON files;
DROP POLICY IF EXISTS "files_insert_own" ON files;
DROP POLICY IF EXISTS "files_update_own" ON files;
DROP POLICY IF EXISTS "files_delete_own" ON files;
DROP POLICY IF EXISTS "Users can view their own files" ON files;
DROP POLICY IF EXISTS "Users can insert their own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_others" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Enable RLS on main tables
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

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

-- STORAGE BUCKET SETUP
INSERT INTO storage.buckets (id, name, public) 
VALUES ('idea-files', 'idea-files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
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