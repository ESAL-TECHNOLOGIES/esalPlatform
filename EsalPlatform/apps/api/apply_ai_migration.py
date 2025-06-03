#!/usr/bin/env python3
"""
Apply AI Score Migration Script
This script applies the AI scoring columns to the Supabase database
"""

import os
import sys
from pathlib import Path

# Add parent directory to sys.path to import from app
sys.path.append(str(Path(__file__).parent))

from dotenv import load_dotenv
from supabase import create_client, Client

def apply_ai_migration():
    """Apply the AI score migration to the database"""
    
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    url = os.environ.get('SUPABASE_URL')
    service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not service_key:
        print("❌ Missing Supabase credentials!")
        print("Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env")
        return False
    
    try:
        # Initialize Supabase client with service role key
        supabase: Client = create_client(url, service_key)
        
        print("🔌 Connected to Supabase")
        
        # Read migration file
        migration_file = Path(__file__).parent / "add_ai_score_migration.sql"
        if not migration_file.exists():
            print(f"❌ Migration file not found: {migration_file}")
            return False
            
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        print("📄 Migration file loaded")
        
        # Split migration into individual statements (simple approach)
        statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip() and not stmt.strip().startswith('--')]
        
        print(f"🔧 Applying {len(statements)} migration statements...")
        
        success_count = 0
        for i, statement in enumerate(statements):
            if not statement:
                continue
                
            try:
                # Execute each statement
                result = supabase.rpc('sql', {'query': statement}).execute()
                print(f"✅ Statement {i+1}/{len(statements)} applied successfully")
                success_count += 1
            except Exception as stmt_error:
                # Some statements might fail if columns already exist - that's okay
                if "already exists" in str(stmt_error).lower() or "does not exist" in str(stmt_error).lower():
                    print(f"⚠️  Statement {i+1}/{len(statements)} skipped (already exists or not needed)")
                else:
                    print(f"❌ Error applying statement {i+1}/{len(statements)}: {stmt_error}")
        
        print(f"\n✅ Migration completed! {success_count}/{len(statements)} statements applied successfully")
        
        # Verify migration by checking if columns exist
        try:
            result = supabase.table('ideas').select('ai_score, ai_generated, ai_metadata').limit(1).execute()
            print("✅ AI columns verified - migration successful!")
            return True
        except Exception as verify_error:
            print(f"⚠️  Could not verify migration: {verify_error}")
            print("You may need to apply the migration manually in Supabase Dashboard")
            return False
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        print("\nTroubleshooting steps:")
        print("1. Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
        print("2. Ensure your Supabase project is running")
        print("3. Try applying the migration manually in Supabase Dashboard > SQL Editor")
        return False

if __name__ == "__main__":
    print("🚀 Starting AI Score Migration Application")
    print("=" * 50)
    
    success = apply_ai_migration()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 AI Score Migration completed successfully!")
        print("\nNext steps:")
        print("1. Test the AI endpoints with database integration")
        print("2. Generate ideas and verify they're saved to database")
        print("3. Judge ideas and verify AI scores are saved")
    else:
        print("❌ Migration failed - please check the errors above")
        print("\nAlternative: Apply migration manually in Supabase Dashboard")
        print("Copy the contents of add_ai_score_migration.sql to SQL Editor")
