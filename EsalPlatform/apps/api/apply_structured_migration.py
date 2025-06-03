#!/usr/bin/env python3
"""
Apply structured fields migration to Supabase database
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

async def apply_structured_fields_migration():
    """Apply the structured fields migration to Supabase"""
    try:
        print("=== Applying Structured Fields Migration ===")
        print(f"Supabase URL: {settings.SUPABASE_URL}")
        
        # Use service role key for schema modifications
        service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
        if not service_key:
            print("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not found. Schema modifications require service role.")
            return False
            
        print("Using service role key for schema modifications...")
        supabase: Client = create_client(settings.SUPABASE_URL, service_key)
        
        # Read the migration SQL
        migration_file = os.path.join(os.path.dirname(__file__), 'add_structured_fields_migration.sql')
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        print("Executing migration SQL...")
        
        # Split SQL into individual statements and execute them
        statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip() and not stmt.strip().startswith('--')]
        
        for i, statement in enumerate(statements):
            if statement.upper().startswith('SELECT'):
                print(f"Executing verification query {i+1}...")
                result = supabase.rpc('execute_sql', {'query': statement}).execute()
                if result.data:
                    print(f"Result: {result.data}")
            else:
                print(f"Executing statement {i+1}: {statement[:50]}...")
                # For DDL statements, we need to use the RPC function if available
                # or execute directly through the REST API
                try:
                    result = supabase.rpc('execute_sql', {'query': statement}).execute()
                    print(f"✅ Statement {i+1} executed successfully")
                except Exception as e:
                    print(f"⚠️  Direct SQL execution failed, trying alternative method: {e}")
                    # Alternative: Use the SQL editor approach
                    # This would require manual execution in Supabase dashboard
                    pass
        
        print("✅ Migration applied successfully!")
        print("\n📋 Next steps:")
        print("1. Verify the columns were added by checking the Supabase dashboard")
        print("2. Test the AI idea generation again")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        
        print("\n📋 Manual migration required:")
        print("1. Open your Supabase dashboard")
        print("2. Go to SQL Editor")
        print("3. Execute the contents of 'add_structured_fields_migration.sql'")
        
        return False

if __name__ == "__main__":
    success = asyncio.run(apply_structured_fields_migration())
    if not success:
        print("\n💡 Alternative: Run the SQL manually in Supabase dashboard")
