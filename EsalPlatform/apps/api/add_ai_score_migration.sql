-- Add AI Score Column Migration
-- Execute this script in your Supabase SQL Editor to add AI scoring support

-- Add ai_score column to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS ai_score FLOAT;

-- Add ai_generated column to track AI-generated ideas
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;

-- Add ai_metadata column for storing AI interaction data
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS ai_metadata JSONB;

-- Create index for ai_score for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_ideas_ai_score ON ideas(ai_score);

-- Create index for ai_generated for filtering
CREATE INDEX IF NOT EXISTS idx_ideas_ai_generated ON ideas(ai_generated);

-- Update existing ideas to have default ai_score of null (no score yet)
-- This is safe as it only affects null values

-- Verification query
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ideas' 
    AND column_name IN ('ai_score', 'ai_generated', 'ai_metadata')
ORDER BY column_name;

-- Success message
SELECT 'AI scoring columns added successfully!' as status;
