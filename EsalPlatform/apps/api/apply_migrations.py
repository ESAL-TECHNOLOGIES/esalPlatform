"""
Apply Supabase database migrations for the Innovator Portal
"""
import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def apply_migrations():
    """Apply database migrations to Supabase"""
    
    # Get Supabase credentials - prefer service role key for migrations
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    anon_key = os.getenv("SUPABASE_ANON_KEY")
    
    # Use service role key if available, fallback to anon key
    supabase_key = service_key if service_key else anon_key
    key_type = "service role" if service_key else "anon"
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set in .env file")
        return False
    
    try:
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print(f"🔗 Connected to Supabase using {key_type} key")
        print("📋 Database migrations should be applied manually in Supabase SQL editor")
        print("📁 Migration file: supabase_migrations.sql")
        print("")
        print("To apply migrations:")
        print("1. Go to your Supabase dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Copy and paste the contents of supabase_migrations.sql")
        print("4. Execute the SQL")
        print("")
        print("✅ Manual migration guide complete")
          # Test basic connection
        result = supabase.table('idea-files').select("count").execute()
        print("✅ Database connection successful")
        return True
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {str(e)}")
        print("💡 Make sure your Supabase credentials are correct in .env file")
        return False

if __name__ == "__main__":
    success = asyncio.run(apply_migrations())
    if success:
        print("\n🎉 Ready to start the backend!")
        print("Run: python start_supabase.py")
    else:
        print("\n💥 Migration check failed. Please check your configuration.")
