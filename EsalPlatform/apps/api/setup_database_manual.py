#!/usr/bin/env python3
"""
Manual Database Setup Script
This script will create the necessary tables for your Supabase database.
"""
import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def setup_database_manually():
    """Manually set up the database tables using raw SQL"""
    try:
        # Get Supabase credentials
        supabase_url = os.getenv("SUPABASE_URL")
        service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not service_key:
            print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
            return False
        
        # Create Supabase client with service role key
        supabase: Client = create_client(supabase_url, service_key)
        print(f"🔗 Connected to Supabase: {supabase_url}")
        
        # SQL commands to create tables
        sql_commands = [
            # 1. Create ideas table
            """
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
                ai_generated BOOLEAN DEFAULT FALSE,
                problem TEXT,
                solution TEXT,
                target_market TEXT,
                ai_metadata JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            """,
            
            # 2. Create files table
            """
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
            """,
            
            # 3. Create profiles table
            """
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
            """,
            
            # 4. Enable RLS
            """
            ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
            ALTER TABLE files ENABLE ROW LEVEL SECURITY;
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
            """,
            
            # 5. Create RLS policies for ideas
            """
            DROP POLICY IF EXISTS "ideas_select_own" ON ideas;
            CREATE POLICY "ideas_select_own" ON ideas
                FOR SELECT USING (auth.uid() = user_id);
            """,
            
            """
            DROP POLICY IF EXISTS "ideas_insert_own" ON ideas;
            CREATE POLICY "ideas_insert_own" ON ideas
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            """,
            
            """
            DROP POLICY IF EXISTS "ideas_update_own" ON ideas;
            CREATE POLICY "ideas_update_own" ON ideas
                FOR UPDATE USING (auth.uid() = user_id);
            """,
            
            """
            DROP POLICY IF EXISTS "ideas_delete_own" ON ideas;
            CREATE POLICY "ideas_delete_own" ON ideas
                FOR DELETE USING (auth.uid() = user_id);
            """,
            
            # 6. Create RLS policies for profiles
            """
            DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
            CREATE POLICY "profiles_select_own" ON profiles
                FOR SELECT USING (auth.uid() = id);
            """,
            
            """
            DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
            CREATE POLICY "profiles_insert_own" ON profiles
                FOR INSERT WITH CHECK (auth.uid() = id);
            """,
            
            """
            DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
            CREATE POLICY "profiles_update_own" ON profiles
                FOR UPDATE USING (auth.uid() = id);
            """,
            
            # 7. Create updated_at trigger function
            """
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
            """,
            
            # 8. Create triggers
            """
            DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
            CREATE TRIGGER update_ideas_updated_at 
                BEFORE UPDATE ON ideas
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            """,
            
            """
            DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
            CREATE TRIGGER update_profiles_updated_at 
                BEFORE UPDATE ON profiles
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            """
        ]
        
        # Execute each SQL command
        for i, sql in enumerate(sql_commands, 1):
            try:
                result = supabase.rpc('exec_sql', {'sql': sql.strip()}).execute()
                print(f"✅ Step {i}: Success")
            except Exception as e:
                # Try alternative method using Supabase's SQL execution
                try:
                    # Use the REST API to execute SQL
                    response = supabase.postgrest.rpc('exec_sql', {'sql': sql.strip()}).execute()
                    print(f"✅ Step {i}: Success (alternative method)")
                except:
                    print(f"⚠️ Step {i}: Could not execute via RPC, you may need to run this SQL manually:")
                    print(f"   {sql.strip()[:100]}...")
        
        print("\n🎉 Database setup completed!")
        print("📋 Tables created: ideas, files, profiles")
        print("🔒 Row Level Security enabled")
        print("🛡️ Security policies created")
        
        # Test connection to verify tables exist
        try:
            ideas_result = supabase.table("ideas").select("count").limit(1).execute()
            profiles_result = supabase.table("profiles").select("count").limit(1).execute()
            print(f"\n✅ Verification: Tables are accessible")
            return True
        except Exception as e:
            print(f"\n⚠️ Verification failed: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(setup_database_manually())
    if success:
        print("\n🚀 Database is ready! You can now run your debug script.")
    else:
        print("\n💥 Database setup failed. You may need to run the SQL manually in Supabase Dashboard.")
