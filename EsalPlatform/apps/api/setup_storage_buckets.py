#!/usr/bin/env python3
"""
Setup Storage Buckets for Supabase
This script creates the required storage buckets and policies for the innovator portal.
"""

import os
import sys
import logging
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_supabase_admin_client():
    """Get Supabase client with admin privileges"""
    try:
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_service_key:
            raise ValueError(
                "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.\n"
                "Please set these in your .env file or environment."
            )
        
        # Create admin client with service role key
        client = create_client(
            supabase_url, 
            supabase_service_key,
            options=ClientOptions(
                postgrest_client_timeout=10,
                storage_client_timeout=10
            )
        )
        
        logger.info("✅ Connected to Supabase with admin privileges")
        return client
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to Supabase: {e}")
        raise

def create_storage_bucket(supabase: Client, bucket_name: str, public: bool = False):
    """Create a storage bucket"""
    try:
        # Check if bucket already exists
        existing_buckets = supabase.storage.list_buckets()
        bucket_names = [bucket.name for bucket in existing_buckets]
        
        if bucket_name in bucket_names:
            logger.info(f"✅ Bucket '{bucket_name}' already exists")
            return True
        
        # Create bucket
        result = supabase.storage.create_bucket(bucket_name, public=public)
        
        if result:
            logger.info(f"✅ Created bucket '{bucket_name}' (public: {public})")
            return True
        else:
            logger.error(f"❌ Failed to create bucket '{bucket_name}'")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error creating bucket '{bucket_name}': {e}")
        return False

def setup_storage_policies(supabase: Client):
    """Setup RLS policies for storage buckets"""
    try:
        # Storage policies need to be created via SQL
        policies_sql = """
        -- Avatars bucket policies (public read, user write)
        DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
        CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
            FOR SELECT USING (bucket_id = 'avatars');

        DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
        CREATE POLICY "Users can upload their own avatar" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

        DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
        CREATE POLICY "Users can update their own avatar" ON storage.objects
            FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

        DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
        CREATE POLICY "Users can delete their own avatar" ON storage.objects
            FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

        -- Uploads bucket policies (private files)
        DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
        CREATE POLICY "Users can upload their own files" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

        DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
        CREATE POLICY "Users can view their own files" ON storage.objects
            FOR SELECT USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

        DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
        CREATE POLICY "Users can update their own files" ON storage.objects
            FOR UPDATE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

        DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
        CREATE POLICY "Users can delete their own files" ON storage.objects
            FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
        """
        
        # Execute policies
        result = supabase.rpc('exec_sql', {'sql': policies_sql})
        logger.info("✅ Storage policies created successfully")
        return True
        
    except Exception as e:
        # Try alternative method with direct SQL execution
        try:
            # Split policies and execute one by one
            policies = policies_sql.strip().split(';')
            for policy in policies:
                if policy.strip():
                    supabase.postgrest.rpc('exec_sql', {'sql': policy.strip() + ';'}).execute()
            
            logger.info("✅ Storage policies created successfully (alternative method)")
            return True
            
        except Exception as e2:
            logger.warning(f"⚠️  Could not automatically create storage policies: {e2}")
            logger.info("📝 Please run the following SQL manually in your Supabase SQL editor:")
            print("\n" + "="*60)
            print(policies_sql)
            print("="*60 + "\n")
            return False

def main():
    """Main setup function"""
    try:
        print("🚀 Setting up Supabase Storage Buckets...")
        print("="*50)
        
        # Get admin client
        supabase = get_supabase_admin_client()
        
        # Create buckets
        buckets_to_create = [
            ("avatars", True),   # Public bucket for avatar images
            ("uploads", False),  # Private bucket for file uploads
        ]
        
        success_count = 0
        for bucket_name, is_public in buckets_to_create:
            if create_storage_bucket(supabase, bucket_name, is_public):
                success_count += 1
        
        if success_count == len(buckets_to_create):
            logger.info("✅ All storage buckets created successfully")
        else:
            logger.warning(f"⚠️  Only {success_count}/{len(buckets_to_create)} buckets created")
        
        # Setup policies
        logger.info("🔐 Setting up storage policies...")
        setup_storage_policies(supabase)
        
        print("\n" + "="*50)
        print("✅ Storage setup completed!")
        print("\nBuckets created:")
        print("  - avatars (public) - for user profile pictures")
        print("  - uploads (private) - for file uploads and attachments")
        print("\n🔧 If policies weren't created automatically, please run the SQL")
        print("   commands shown above in your Supabase SQL editor.")
        
    except Exception as e:
        logger.error(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
