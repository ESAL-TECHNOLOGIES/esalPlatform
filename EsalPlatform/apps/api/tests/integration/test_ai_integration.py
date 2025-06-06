#!/usr/bin/env python3
"""
Test AI Integration Script
This script tests the complete AI generator system with database integration
"""

import asyncio
import json
import httpx
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword123"

class AIIntegrationTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.client = httpx.AsyncClient()
        self.access_token = None
        self.headers = {}
        
    async def authenticate(self):
        """Authenticate and get access token"""
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = await self.client.post(
                f"{self.base_url}/auth/login",
                json=login_data
            )
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data["access_token"]
                self.headers = {"Authorization": f"Bearer {self.access_token}"}
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    async def test_ai_generate_idea(self):
        """Test AI idea generation with database storage"""
        print("\n🧠 Testing AI Idea Generation...")
        
        try:
            request_data = {
                "interests": "artificial intelligence, machine learning, healthcare",
                "skills": "python programming, data science, software development",
                "industry": "healthcare",
                "problem_area": "medical diagnosis",
                "target_market": "hospitals and clinics",
                "save_to_database": True
            }
            
            response = await self.client.post(
                f"{self.base_url}/innovator/ai/generate-idea",
                json=request_data,
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ AI idea generated successfully")
                print(f"Response: {data['response_text'][:100]}...")
                
                if data.get('metadata', {}).get('saved_to_database'):
                    idea_id = data['metadata']['saved_idea_id']
                    print(f"✅ Idea saved to database with ID: {idea_id}")
                    return idea_id
                else:
                    print("⚠️  Idea not saved to database")
                    return None
            else:
                print(f"❌ AI idea generation failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ AI idea generation error: {e}")
            return None
    
    async def test_ai_judge_idea(self, idea_id=None):
        """Test AI idea judgment with database storage"""
        print("\n⚖️ Testing AI Idea Judgment...")
        
        try:
            request_data = {
                "idea_id": idea_id or "test-idea-id",
                "title": "AI-Powered Medical Diagnosis Assistant",
                "problem": "Doctors need faster and more accurate diagnosis tools",
                "solution": "An AI system that analyzes medical data to suggest diagnoses",
                "target_market": "Hospitals and medical clinics"
            }
            
            response = await self.client.post(
                f"{self.base_url}/innovator/ai/judge-idea",
                json=request_data,
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ AI idea judgment successful")
                print(f"Overall Score: {data['overall_score']}/10")
                print(f"Strengths: {len(data['strengths'])} items")
                print(f"Weaknesses: {len(data['weaknesses'])} items")
                
                if data.get('metadata', {}).get('saved_to_database'):
                    print(f"✅ AI score saved to database for idea {idea_id}")
                else:
                    print("⚠️  AI score not saved to database")
                    
                return data['overall_score']
            else:
                print(f"❌ AI idea judgment failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ AI idea judgment error: {e}")
            return None
    
    async def test_ai_analytics(self):
        """Test AI analytics endpoint"""
        print("\n📊 Testing AI Analytics...")
        
        try:
            response = await self.client.get(
                f"{self.base_url}/innovator/ai/analytics",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ AI analytics retrieved successfully")
                analytics = data['data']
                print(f"Total Ideas: {analytics.get('total_ideas', 0)}")
                print(f"AI Generated Ideas: {analytics.get('ai_generated_ideas', 0)}")
                print(f"Average AI Score: {analytics.get('average_ai_score', 'N/A')}")
                return True
            else:
                print(f"❌ AI analytics failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ AI analytics error: {e}")
            return False
    
    async def test_view_ideas(self):
        """Test viewing ideas to verify database integration"""
        print("\n📋 Testing View Ideas (Database Integration)...")
        
        try:
            response = await self.client.get(
                f"{self.base_url}/innovator/view-ideas",
                headers=self.headers
            )
            
            if response.status_code == 200:
                ideas = response.json()
                print(f"✅ Retrieved {len(ideas)} ideas from database")
                
                ai_generated_count = sum(1 for idea in ideas if idea.get('ai_generated'))
                ai_scored_count = sum(1 for idea in ideas if idea.get('ai_score') is not None)
                
                print(f"AI Generated Ideas: {ai_generated_count}")
                print(f"AI Scored Ideas: {ai_scored_count}")
                
                if ai_generated_count > 0 or ai_scored_count > 0:
                    print("✅ Database integration working correctly")
                else:
                    print("⚠️  No AI-generated or AI-scored ideas found")
                    
                return True
            else:
                print(f"❌ View ideas failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ View ideas error: {e}")
            return False
    
    async def run_complete_test(self):
        """Run complete AI integration test"""
        print("🚀 Starting Complete AI Integration Test")
        print("=" * 60)
        
        # Authenticate
        if not await self.authenticate():
            return False
        
        # Test AI idea generation
        idea_id = await self.test_ai_generate_idea()
        
        # Test AI idea judgment
        await self.test_ai_judge_idea(idea_id)
        
        # Test AI analytics
        await self.test_ai_analytics()
        
        # Test view ideas (database integration)
        await self.test_view_ideas()
        
        print("\n" + "=" * 60)
        print("🎉 AI Integration Test Completed!")
        
        await self.client.aclose()

async def main():
    """Main test function"""
    tester = AIIntegrationTester()
    await tester.run_complete_test()

if __name__ == "__main__":
    print("AI Integration Test Script")
    print("This script tests the complete AI generator system with database integration")
    print("Make sure the backend server is running on http://localhost:8000")
    print()
    
    asyncio.run(main())
