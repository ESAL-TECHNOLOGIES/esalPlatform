#!/usr/bin/env python3
"""
Simple script to check database contents
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

from app.services.supabase_ideas import SupabaseIdeasService

async def check_database():
    """Check what's in the database"""
    try:
        print("=== Checking Database Contents ===")
        
        # Initialize the service
        service = SupabaseIdeasService()
        
        # Use the Supabase client directly to get all ideas (bypassing user filter)
        print("Fetching all ideas from database...")
        result = service.supabase.table("ideas").select("*").execute()
        
        if result.data:
            print(f"Found {len(result.data)} total ideas in database:")
            for i, idea in enumerate(result.data):
                print(f"  {i+1}. ID: {idea.get('id')}")
                print(f"     Title: {idea.get('title', 'N/A')}")
                print(f"     User ID: {idea.get('user_id', 'N/A')}")
                print(f"     Created: {idea.get('created_at', 'N/A')}")
                print()
        else:
            print("No ideas found in database")
            
    except Exception as e:
        print(f"Error checking database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_database())
