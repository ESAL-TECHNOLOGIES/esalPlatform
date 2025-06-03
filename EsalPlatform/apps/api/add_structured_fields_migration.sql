-- Add Structured Idea Fields Migration
-- Execute this script in your Supabase SQL Editor to add structured fields for AI-generated ideas

-- Add problem column to store the problem statement
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS problem TEXT;

-- Add solution column to store the proposed solution
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS solution TEXT;

-- Add target_market column to store target market information
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS target_market TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_problem ON ideas USING GIN (to_tsvector('english', problem));
CREATE INDEX IF NOT EXISTS idx_ideas_solution ON ideas USING GIN (to_tsvector('english', solution));
CREATE INDEX IF NOT EXISTS idx_ideas_target_market ON ideas USING GIN (to_tsvector('english', target_market));

-- Verification query
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ideas' 
    AND column_name IN ('problem', 'solution', 'target_market')
ORDER BY column_name;

-- Success message
SELECT 'Structured idea fields added successfully!' as status;
