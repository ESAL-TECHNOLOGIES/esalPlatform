#!/usr/bin/env python3
"""
Debug script to check why public ideas are not being returned by the AI matching service
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

from app.services.supabase_ideas import SupabaseIdeasService

async def debug_public_ideas():
    """Debug why public ideas are not being returned"""
    print("🔍 DEBUG: Investigating public ideas visibility issue")
    print("="*60)
    
    try:
        # Initialize the service
        service = SupabaseIdeasService()
        print("✅ Service initialized successfully")
        
        # 1. Check all ideas in the database
        print("\n1. Checking ALL ideas in database:")
        all_ideas_result = service.supabase.table("ideas").select("id, title, visibility, status, user_id").execute()
        all_ideas = all_ideas_result.data or []
        print(f"   Total ideas in database: {len(all_ideas)}")
        
        if all_ideas:
            print("   Ideas breakdown:")
            for idea in all_ideas[:10]:  # Show first 10 ideas
                print(f"     - ID: {idea.get('id')}, Title: {idea.get('title')[:50]}..., Visibility: {idea.get('visibility')}, Status: {idea.get('status')}")
            
            # Count by visibility
            visibility_counts = {}
            for idea in all_ideas:
                vis = idea.get('visibility', 'unknown')
                visibility_counts[vis] = visibility_counts.get(vis, 0) + 1
            
            print(f"   Visibility breakdown: {visibility_counts}")
        
        # 2. Test direct query for public ideas
        print("\n2. Testing direct query for public ideas:")
        public_query = service.supabase.table("ideas").select("*").eq("visibility", "public")
        public_result = public_query.execute()
        public_ideas_direct = public_result.data or []
        print(f"   Direct public query returned: {len(public_ideas_direct)} ideas")
        
        if public_ideas_direct:
            print("   Public ideas found:")
            for idea in public_ideas_direct[:5]:
                print(f"     - ID: {idea.get('id')}, Title: {idea.get('title')}, Status: {idea.get('status')}")
        
        # 3. Test get_ideas_list method with visibility filter
        print("\n3. Testing get_ideas_list method with visibility filter:")
        try:
            filtered_ideas = await service.get_ideas_list(
                user_id=None,
                visibility_filter="public",
                limit=None
            )
            print(f"   get_ideas_list returned: {len(filtered_ideas)} ideas")
            
            if filtered_ideas:
                print("   Ideas returned by get_ideas_list:")
                for idea in filtered_ideas[:5]:
                    print(f"     - ID: {idea.get('id')}, Title: {idea.get('title')}, Visibility: {idea.get('visibility')}")
        except Exception as e:
            print(f"   ERROR in get_ideas_list: {e}")
        
        # 4. Test the query logic from get_ideas_list manually
        print("\n4. Testing get_ideas_list query logic manually:")
        try:
            # Replicate the exact query from get_ideas_list
            query = service.supabase.table("ideas").select("*")
            query = query.in_("visibility", ["public", "public_ideas"])
            query = query.order("created_at", desc=True)
            result = query.execute()
            manual_ideas = result.data or []
            print(f"   Manual query returned: {len(manual_ideas)} ideas")
            
            if manual_ideas:
                print("   Ideas from manual query:")
                for idea in manual_ideas[:5]:
                    print(f"     - ID: {idea.get('id')}, Title: {idea.get('title')}, Visibility: {idea.get('visibility')}")
        except Exception as e:
            print(f"   ERROR in manual query: {e}")
        
        # 5. Check RLS policies
        print("\n5. Checking if RLS might be blocking access:")
        try:
            # Try with service role (should bypass RLS)
            service_key = getattr(service.supabase.auth, '_headers', {}).get('apikey', 'unknown')
            if 'service_role' in service_key or len(service_key) > 100:
                print("   ✅ Using service role key (should bypass RLS)")
            else:
                print("   ⚠️  Using anon key (might be affected by RLS)")
        except:
            print("   ❓ Could not determine key type")
        
    except Exception as e:
        print(f"❌ Error during debugging: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_public_ideas())
