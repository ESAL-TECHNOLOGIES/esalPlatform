-- ========================================
-- INVESTOR MATCHING TABLES MIGRATION
-- ========================================
-- SQL script to add investor matching preferences and history tables
-- Execute this in your Supabase SQL Editor

-- ========================================
-- STEP 1: CREATE INVESTOR PREFERENCES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS investor_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences_name VARCHAR(100) DEFAULT 'Default',
    industries TEXT[] DEFAULT '{}',
    stages TEXT[] DEFAULT '{}',
    min_funding_amount DECIMAL(15,2),
    max_funding_amount DECIMAL(15,2),
    geographic_preferences TEXT[] DEFAULT '{}',
    risk_tolerance VARCHAR(20) DEFAULT 'medium',
    investment_timeline VARCHAR(20) DEFAULT '6_months',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 2: CREATE MATCHING HISTORY TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS matching_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences_used JSONB NOT NULL,
    total_matches_found INTEGER DEFAULT 0,
    high_quality_matches INTEGER DEFAULT 0,
    average_score DECIMAL(4,3),
    ai_confidence DECIMAL(4,3),
    processing_time_seconds DECIMAL(8,3),
    startup_ids_matched TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 3: CREATE CONNECTION REQUESTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS connection_requests (
    id BIGSERIAL PRIMARY KEY,
    investor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    startup_idea_id BIGINT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    startup_owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    
    -- Ensure unique connection requests
    UNIQUE(investor_user_id, startup_idea_id)
);

-- ========================================
-- STEP 4: CREATE STARTUP VIEWS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS startup_views (
    id BIGSERIAL PRIMARY KEY,
    viewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    startup_idea_id BIGINT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    view_source VARCHAR(50) DEFAULT 'browse', -- browse, matching, search
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 5: CREATE INDEXES
-- ========================================

-- Investor preferences indexes
CREATE INDEX IF NOT EXISTS idx_investor_preferences_user_id ON investor_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_preferences_is_default ON investor_preferences(is_default);

-- Matching history indexes
CREATE INDEX IF NOT EXISTS idx_matching_history_user_id ON matching_history(user_id);
CREATE INDEX IF NOT EXISTS idx_matching_history_created_at ON matching_history(created_at DESC);

-- Connection requests indexes
CREATE INDEX IF NOT EXISTS idx_connection_requests_investor ON connection_requests(investor_user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_startup_owner ON connection_requests(startup_owner_user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_startup_idea ON connection_requests(startup_idea_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

-- Startup views indexes
CREATE INDEX IF NOT EXISTS idx_startup_views_viewer ON startup_views(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_startup_views_startup ON startup_views(startup_idea_id);
CREATE INDEX IF NOT EXISTS idx_startup_views_viewed_at ON startup_views(viewed_at DESC);

-- ========================================
-- STEP 6: CREATE TRIGGERS
-- ========================================

-- Updated at trigger for investor preferences
CREATE TRIGGER update_investor_preferences_updated_at
    BEFORE UPDATE ON investor_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE investor_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_views ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 8: CREATE RLS POLICIES
-- ========================================

-- INVESTOR PREFERENCES POLICIES
-- Users can view their own preferences
CREATE POLICY "investor_preferences_select_own" ON investor_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "investor_preferences_insert_own" ON investor_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "investor_preferences_update_own" ON investor_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "investor_preferences_delete_own" ON investor_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- MATCHING HISTORY POLICIES
-- Users can view their own matching history
CREATE POLICY "matching_history_select_own" ON matching_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own matching history
CREATE POLICY "matching_history_insert_own" ON matching_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CONNECTION REQUESTS POLICIES
-- Investors can view their own connection requests
CREATE POLICY "connection_requests_select_investor" ON connection_requests
    FOR SELECT USING (auth.uid() = investor_user_id);

-- Startup owners can view connection requests for their startups
CREATE POLICY "connection_requests_select_startup_owner" ON connection_requests
    FOR SELECT USING (auth.uid() = startup_owner_user_id);

-- Investors can create connection requests
CREATE POLICY "connection_requests_insert_investor" ON connection_requests
    FOR INSERT WITH CHECK (auth.uid() = investor_user_id);

-- Startup owners can update connection request status
CREATE POLICY "connection_requests_update_startup_owner" ON connection_requests
    FOR UPDATE USING (auth.uid() = startup_owner_user_id);

-- STARTUP VIEWS POLICIES
-- Users can view their own view history
CREATE POLICY "startup_views_select_own" ON startup_views
    FOR SELECT USING (auth.uid() = viewer_user_id);

-- Users can insert their own views
CREATE POLICY "startup_views_insert_own" ON startup_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_user_id);

-- ========================================
-- STEP 9: UTILITY FUNCTIONS
-- ========================================

-- Function to get investor matching statistics
CREATE OR REPLACE FUNCTION get_investor_matching_stats(investor_uuid UUID)
RETURNS TABLE(
    total_matches_run INTEGER,
    avg_matches_per_run DECIMAL,
    total_connections_made INTEGER,
    pending_connections INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_matches_run,
        COALESCE(AVG(total_matches_found), 0)::DECIMAL as avg_matches_per_run,
        (SELECT COUNT(*)::INTEGER FROM connection_requests WHERE investor_user_id = investor_uuid) as total_connections_made,
        (SELECT COUNT(*)::INTEGER FROM connection_requests WHERE investor_user_id = investor_uuid AND status = 'pending') as pending_connections
    FROM matching_history 
    WHERE user_id = investor_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get startup connection statistics
CREATE OR REPLACE FUNCTION get_startup_connection_stats(startup_idea_id_param BIGINT)
RETURNS TABLE(
    total_interest_expressions INTEGER,
    pending_connections INTEGER,
    accepted_connections INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_interest_expressions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER as pending_connections,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END)::INTEGER as accepted_connections
    FROM connection_requests 
    WHERE startup_idea_id = startup_idea_id_param;
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
WHERE tablename IN ('investor_preferences', 'matching_history', 'connection_requests', 'startup_views')
ORDER BY tablename;

-- Check that policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname
FROM pg_policies 
WHERE tablename IN ('investor_preferences', 'matching_history', 'connection_requests', 'startup_views')
ORDER BY tablename, policyname;

-- Success message
SELECT 
    '🎉 INVESTOR MATCHING TABLES SETUP COMPLETED!' as status,
    'Tables: investor_preferences, matching_history, connection_requests, startup_views' as tables_created,
    'RLS enabled with appropriate policies' as security,
    'Utility functions created for statistics' as functions;
