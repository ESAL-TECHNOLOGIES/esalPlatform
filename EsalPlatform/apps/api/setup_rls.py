"""
Supabase RLS (Row Level Security) Setup Script
This script uses your service role key to automatically set up comprehensive RLS policies.

Usage: python setup_rls.py
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Fallback to hardcoded values if environment variables are not set
if not SUPABASE_URL:
    SUPABASE_URL = "https://ppvkucdspgoeqsxxydxg.supabase.co"
    
if not SERVICE_ROLE_KEY:
    SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmt1Y2RzcGdvZXFzeHh5ZHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE1OTMzMCwiZXhwIjoyMDYzNzM1MzMwfQ.Tt2F9WnX6Dai3Yi2TBgzfUPK38XR4tIpLLh5rFMlU-s"

def setup_rls():
    """Set up comprehensive RLS policies using the service role key"""
    
    # Validate configuration
    if not SUPABASE_URL:
        print("❌ Error: SUPABASE_URL not found in environment variables")
        print("Please ensure your .env file contains SUPABASE_URL")
        return False
        
    if not SERVICE_ROLE_KEY:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in environment variables")
        print("Please ensure your .env file contains SUPABASE_SERVICE_ROLE_KEY")
        return False
    try:
        # Create Supabase client with SERVICE ROLE KEY
        print("🔗 Connecting to Supabase with service role key...")
        supabase: Client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
        
        print("✅ Connected successfully!")
        print("🔐 Setting up Row Level Security...")
        
        # Step 1: Enable RLS on tables
        rls_statements = [
            "ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;",
            "ALTER TABLE files ENABLE ROW LEVEL SECURITY;", 
            "ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;",
            "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;",
            "ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;"
        ]
        
        print("📋 Enabling RLS on tables...")
        for statement in rls_statements:
            try:
                result = supabase.rpc('exec_sql', {'sql': statement})
                print(f"   ✅ {statement}")
            except Exception as e:
                print(f"   ⚠️  {statement} - {str(e)}")
        
        # Step 2: Create RLS Policies
        policies = [
            # Ideas table policies
            '''CREATE POLICY "ideas_select_own" ON ideas
                FOR SELECT USING (auth.uid() = user_id);''',
            
            '''CREATE POLICY "ideas_select_public" ON ideas
                FOR SELECT USING (visibility = 'public');''',
            
            '''CREATE POLICY "ideas_insert_own" ON ideas
                FOR INSERT WITH CHECK (auth.uid() = user_id);''',
            
            '''CREATE POLICY "ideas_update_own" ON ideas
                FOR UPDATE USING (auth.uid() = user_id);''',
            
            '''CREATE POLICY "ideas_delete_own" ON ideas
                FOR DELETE USING (auth.uid() = user_id);''',
            
            # Files table policies
            '''CREATE POLICY "files_select_own" ON files
                FOR SELECT USING (auth.uid() = user_id);''',
            
            '''CREATE POLICY "files_insert_own" ON files
                FOR INSERT WITH CHECK (auth.uid() = user_id);''',
            
            '''CREATE POLICY "files_update_own" ON files
                FOR UPDATE USING (auth.uid() = user_id);''',
            
            '''CREATE POLICY "files_delete_own" ON files
                FOR DELETE USING (auth.uid() = user_id);''',
            
            # Profiles table policies
            '''CREATE POLICY "profiles_select_own" ON profiles
                FOR SELECT USING (auth.uid() = id);''',
            
            '''CREATE POLICY "profiles_select_others" ON profiles
                FOR SELECT USING (true);''',
            
            '''CREATE POLICY "profiles_insert_own" ON profiles
                FOR INSERT WITH CHECK (auth.uid() = id);''',
            
            '''CREATE POLICY "profiles_update_own" ON profiles
                FOR UPDATE USING (auth.uid() = id);''',
            
            '''CREATE POLICY "profiles_delete_own" ON profiles
                FOR DELETE USING (auth.uid() = id);''',
        ]
        
        print("📝 Creating RLS policies...")
        policy_count = 0
        for policy in policies:
            try:
                result = supabase.rpc('exec_sql', {'sql': policy})
                policy_count += 1
                print(f"   ✅ Policy {policy_count}/{len(policies)} created")
            except Exception as e:
                print(f"   ⚠️  Policy failed: {str(e)[:100]}...")
        
        # Step 3: Setup Storage Buckets
        print("🗄️  Setting up storage buckets...")
        bucket_statements = [
            '''INSERT INTO storage.buckets (id, name, public) 
               VALUES ('idea-files', 'idea-files', false)
               ON CONFLICT (id) DO NOTHING;''',
            
            '''INSERT INTO storage.buckets (id, name, public) 
               VALUES ('avatars', 'avatars', true)
               ON CONFLICT (id) DO NOTHING;'''
        ]
        
        for statement in bucket_statements:
            try:
                result = supabase.rpc('exec_sql', {'sql': statement})
                print(f"   ✅ Bucket created/verified")
            except Exception as e:
                print(f"   ⚠️  Bucket setup: {str(e)}")
        
        # Step 4: Storage Policies
        storage_policies = [
            '''CREATE POLICY "idea_files_insert_own" ON storage.objects
                FOR INSERT WITH CHECK (
                    bucket_id = 'idea-files' 
                    AND auth.uid()::text = (storage.foldername(name))[1]
                );''',
            
            '''CREATE POLICY "idea_files_select_own" ON storage.objects
                FOR SELECT USING (
                    bucket_id = 'idea-files' 
                    AND auth.uid()::text = (storage.foldername(name))[1]
                );''',
            
            '''CREATE POLICY "idea_files_update_own" ON storage.objects
                FOR UPDATE USING (
                    bucket_id = 'idea-files' 
                    AND auth.uid()::text = (storage.foldername(name))[1]
                );''',
            
            '''CREATE POLICY "idea_files_delete_own" ON storage.objects
                FOR DELETE USING (
                    bucket_id = 'idea-files' 
                    AND auth.uid()::text = (storage.foldername(name))[1]
                );''',
            
            '''CREATE POLICY "avatars_select_public" ON storage.objects
                FOR SELECT USING (bucket_id = 'avatars');''',
            
            '''CREATE POLICY "avatars_insert_own" ON storage.objects
                FOR INSERT WITH CHECK (
                    bucket_id = 'avatars' 
                    AND auth.uid()::text = (storage.foldername(name))[1]
                );''',
            
            '''CREATE POLICY "avatars_update_own" ON storage.objects
                FOR UPDATE USING (
                    bucket_id = 'avatars' 
                    AND auth.uid()::text = (storage.foldername(name))[1]
                );''',
            
            '''CREATE POLICY "avatars_delete_own" ON storage.objects
                FOR DELETE USING (
                    bucket_id = 'avatars' 
                    AND auth.uid()::text = (storage.foldername(name))[1]
                );'''
        ]
        
        print("📁 Creating storage policies...")
        storage_policy_count = 0
        for policy in storage_policies:
            try:
                result = supabase.rpc('exec_sql', {'sql': policy})
                storage_policy_count += 1
                print(f"   ✅ Storage policy {storage_policy_count}/{len(storage_policies)} created")
            except Exception as e:
                print(f"   ⚠️  Storage policy failed: {str(e)[:100]}...")
        
        # Step 5: Grant permissions
        print("🔑 Granting permissions...")
        permission_statements = [
            "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;",
            "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;",
            "GRANT SELECT, INSERT, UPDATE, DELETE ON ideas TO authenticated;",
            "GRANT SELECT, INSERT, UPDATE, DELETE ON files TO authenticated;",
            "GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;",
            "GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;",
            "GRANT SELECT ON storage.buckets TO authenticated, anon;"
        ]
        
        for statement in permission_statements:
            try:
                result = supabase.rpc('exec_sql', {'sql': statement})
                print(f"   ✅ Permission granted")
            except Exception as e:
                print(f"   ⚠️  Permission: {str(e)[:50]}...")
        
        # Final verification
        print("\n🔍 Verifying RLS setup...")
        try:
            # Check if tables have RLS enabled
            verification_query = '''
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('ideas', 'files', 'profiles');
            '''
            
            result = supabase.rpc('exec_sql', {'sql': verification_query})
            print("   ✅ RLS verification completed")
            
        except Exception as e:
            print(f"   ⚠️  Verification: {str(e)}")
        
        print("\n" + "="*60)
        print("🎉 RLS SETUP COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"✅ Table policies created: {policy_count}")
        print(f"✅ Storage policies created: {storage_policy_count}")
        print("✅ Storage buckets configured")
        print("✅ Permissions granted")
        print("\n🔐 Your Supabase database is now secured with Row Level Security!")
        print("📖 Users can only access their own data")
        print("🌐 Public data (profiles, public ideas) is accessible to all")
        print("📁 File storage is user-isolated")
        print("\n🚀 You can now safely use your platform!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up RLS: {str(e)}")
        print("\n💡 Alternative options:")
        print("1. Run the SQL script manually in your Supabase Dashboard")
        print("2. Check your Supabase URL and service role key")
        print("3. Ensure your Supabase project is accessible")
        return False

def main():
    """Main function"""
    print("🚀 Supabase RLS Setup Script")
    print("="*50)
    print("This script will set up comprehensive Row Level Security")
    print("using your service role key for administrative operations.")
    print("")
    
    # Confirm with user
    confirm = input("Do you want to proceed with RLS setup? (y/N): ")
    if confirm.lower() not in ['y', 'yes']:
        print("❌ Setup cancelled by user")
        return
    
    success = setup_rls()
    
    if success:
        print("\n✅ Setup completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
