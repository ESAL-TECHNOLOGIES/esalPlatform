#!/usr/bin/env python3
"""Test Supabase connection and ideas table"""

from supabase import create_client
from app.config import settings

def test_supabase():
    try:
        # Test Supabase connection
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        
        # Test if ideas table exists and has data
        result = supabase.table('ideas').select('id, title, user_id').limit(5).execute()
        print(f'Ideas table test successful. Found {len(result.data)} ideas')
        for idea in result.data:
            print(f'  - ID: {idea["id"]}, Title: {idea["title"][:50]}, User: {idea["user_id"]}')
        
        # Test if auth.users exist
        print("\nChecking auth users...")
        users_result = supabase.from_('auth.users').select('*').limit(3).execute()
        print(f"Auth users query result: {users_result}")
        
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_supabase()
