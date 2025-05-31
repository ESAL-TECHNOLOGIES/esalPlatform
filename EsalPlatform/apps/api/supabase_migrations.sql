-- Supabase Database Tables for Innovator Portal
-- Execute this script in your Supabase SQL editor

-- Enable RLS (Row Level Security)
-- This ensures users can only access their own data

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

-- Ideas RLS policies
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON ideas
    FOR DELETE USING (auth.uid() = user_id);

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

-- Files RLS policies
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" ON files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON files
    FOR DELETE USING (auth.uid() = user_id);

-- 3. User Profiles Table (extended user information)
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

-- Profiles RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

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
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Create Storage Buckets (execute these separately in Supabase dashboard)
-- These need to be created through the Supabase Storage interface or via SQL:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('idea-files', 'idea-files', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 8. Storage RLS policies (run after creating buckets)
-- Idea files bucket policy
-- CREATE POLICY "Users can upload their own files" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view their own files" ON storage.objects
--     FOR SELECT USING (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own files" ON storage.objects
--     FOR DELETE USING (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars bucket policy (public read, user write)
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
--     FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload their own avatar" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update their own avatar" ON storage.objects
--     FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own avatar" ON storage.objects
--     FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 9. Create functions for stats calculation
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

-- 10. Sample data for testing (optional)
-- You can uncomment these to create some sample data
-- INSERT INTO ideas (user_id, title, description, category, tags, status) VALUES
-- (auth.uid(), 'AI-Powered Learning Platform', 'An intelligent platform that adapts to individual learning styles', 'Education', ARRAY['AI', 'Education', 'Machine Learning'], 'draft'),
-- (auth.uid(), 'Sustainable Energy Monitor', 'IoT device for monitoring and optimizing home energy consumption', 'Environment', ARRAY['IoT', 'Energy', 'Sustainability'], 'active');
