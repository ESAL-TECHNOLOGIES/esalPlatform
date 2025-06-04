#!/usr/bin/env python3
"""
Apply investor matching tables migration to Supabase database
"""
import sys
import os
import asyncio
import logging

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.config import settings
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def apply_investor_matching_migration():
    """Apply the investor matching migration to Supabase"""
    print("🚀 Applying Investor Matching Tables Migration...")
    print(f"📊 Supabase URL: {settings.SUPABASE_URL}")
    print("")

    try:
        # Use service role key for database operations
        service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
        if not service_key:
            print("❌ SUPABASE_SERVICE_ROLE_KEY not found in config")
            print("💡 Please add your service role key to the config.py file")
            return False

        # Create Supabase client
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            service_key
        )
        
        print("✅ Connected to Supabase with service role")

        # Read the migration SQL file
        migration_file = os.path.join(os.path.dirname(__file__), 'investor_matching_tables.sql')
        
        if not os.path.exists(migration_file):
            print(f"❌ Migration file not found: {migration_file}")
            return False

        with open(migration_file, 'r', encoding='utf-8') as f:
            migration_sql = f.read()

        print("📄 Migration SQL loaded successfully")

        # Execute the migration in chunks (split by major sections)
        sql_sections = migration_sql.split('-- ========================================')
        
        for i, section in enumerate(sql_sections):
            section = section.strip()
            if not section or section.startswith('--'):
                continue
                
            try:
                print(f"🔄 Executing migration section {i+1}...")
                result = supabase.rpc('sql', {'query': section}).execute()
                print(f"✅ Section {i+1} completed successfully")
            except Exception as e:
                error_msg = str(e)
                # Some operations might fail if they already exist - that's okay
                if any(phrase in error_msg.lower() for phrase in ['already exists', 'duplicate', 'relation exists']):
                    print(f"⚠️  Section {i+1}: {error_msg} (continuing...)")
                else:
                    print(f"❌ Section {i+1} failed: {error_msg}")
                    return False

        print("")
        print("🎉 Investor Matching Migration Applied Successfully!")
        print("")
        print("📋 Tables created:")
        print("   - investor_preferences")
        print("   - matching_history") 
        print("   - connection_requests")
        print("   - startup_views")
        print("")
        print("🔒 RLS policies enabled for data security")
        print("🛠️  Utility functions created for statistics")
        print("")
        print("✅ Ready to test investor matching features!")
        
        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(apply_investor_matching_migration())
    if not success:
        print("\n💡 Alternative: Run the SQL manually in Supabase dashboard")
        print("   1. Copy the contents of investor_matching_tables.sql")
        print("   2. Go to your Supabase Dashboard > SQL Editor")
        print("   3. Paste and execute the script")
        sys.exit(1)
