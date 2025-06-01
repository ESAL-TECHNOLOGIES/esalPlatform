-- Simplified Supabase Database Tables for Innovator Portal (No RLS)
-- Execute this script in your Supabase SQL editor

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

-- 3. Avatars Table (User Profiles - extended structure to support all frontend fields)
CREATE TABLE IF NOT EXISTS avatars (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    bio TEXT,
    expertise VARCHAR(255),
    location VARCHAR(100),
    company VARCHAR(100),
    position VARCHAR(100),
    skills TEXT[], -- Array of skills
    interests TEXT[], -- Array of interests
    website_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    github_url TEXT,
    phone VARCHAR(20),
    avatar_url TEXT,
    experience_years INTEGER DEFAULT 0,
    education TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Comments Table (for idea discussions and feedback)
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id BIGINT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_idea_id ON files(idea_id);
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avatars_updated_at BEFORE UPDATE ON avatars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Create Storage Buckets
-- These need to be created through the Supabase Storage interface or via SQL:

INSERT INTO storage.buckets (id, name, public) 
VALUES ('idea-files', 'idea-files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

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
-- You can uncomment these to create some sample data after you have authenticated users
-- INSERT INTO ideas (user_id, title, description, category, tags, status) VALUES
-- (auth.uid(), 'AI-Powered Learning Platform', 'An intelligent platform that adapts to individual learning styles', 'Education', ARRAY['AI', 'Education', 'Machine Learning'], 'draft'),
-- (auth.uid(), 'Sustainable Energy Monitor', 'IoT device for monitoring and optimizing home energy consumption', 'Environment', ARRAY['IoT', 'Energy', 'Sustainability'], 'active');
