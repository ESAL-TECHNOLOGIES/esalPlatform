"""
Create email_verifications table for 6-digit code verification
"""

CREATE_EMAIL_VERIFICATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    UNIQUE(user_id, code)
);

-- Add RLS policies
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own verification records
CREATE POLICY "Users can view own verification codes" ON email_verifications
    FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to manage all verification records
CREATE POLICY "Service role can manage all verification codes" ON email_verifications
    FOR ALL USING (auth.role() = 'service_role');
"""

if __name__ == "__main__":
    import asyncio
    from supabase import create_client
    import sys
    import os
    
    # Add parent directory to path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    from app.config import settings
    
    async def create_email_verifications_table():
        """Create the email_verifications table in Supabase"""
        try:
            # Use service role key for admin operations
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            
            # Execute the SQL
            result = supabase.rpc('exec_sql', {'sql': CREATE_EMAIL_VERIFICATIONS_TABLE}).execute()
            
            print("✅ Email verifications table created successfully!")
            print("Table includes:")
            print("- id (UUID, primary key)")
            print("- user_id (UUID, foreign key to auth.users)")
            print("- email (text)")
            print("- code (text, 6-digit verification code)")
            print("- expires_at (timestamp)")
            print("- is_used (boolean)")
            print("- created_at (timestamp)")
            print("- verified_at (timestamp)")
            print("- RLS policies for security")
            
        except Exception as e:
            print(f"❌ Error creating email_verifications table: {e}")
            print("You may need to run this SQL manually in Supabase Dashboard:")
            print(CREATE_EMAIL_VERIFICATIONS_TABLE)
    
    # Run the migration
    asyncio.run(create_email_verifications_table())
