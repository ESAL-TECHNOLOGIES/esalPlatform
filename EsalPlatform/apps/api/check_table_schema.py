#!/usr/bin/env python3
"""
Check the actual database schema for the ideas table
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

from app.services.supabase_ideas import SupabaseIdeasService

async def check_table_schema():
    """Check the actual columns in the ideas table"""
    try:
        print("=== Checking Ideas Table Schema ===")
        
        # Initialize the service
        service = SupabaseIdeasService()
        
        # Get one idea to see the actual columns
        result = service.supabase.table("ideas").select("*").limit(1).execute()
        
        if result.data and len(result.data) > 0:
            idea = result.data[0]
            print("Actual columns in ideas table:")
            for column, value in idea.items():
                print(f"  - {column}: {type(value).__name__} = {value}")
        else:
            print("No ideas found to check schema")
            
    except Exception as e:
        print(f"Error checking schema: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_table_schema())
