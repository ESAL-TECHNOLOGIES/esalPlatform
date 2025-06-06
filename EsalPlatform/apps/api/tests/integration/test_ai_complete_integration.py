#!/usr/bin/env python3
"""
Complete AI Integration Test Script
Tests all AI endpoints with database integration
"""

import asyncio
import json
import sys
from pathlib import Path
import os

# Add parent directory to sys.path to import from app
sys.path.append(str(Path(__file__).parent))

from dotenv import load_dotenv
import httpx

# Load environment variables
load_dotenv()

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "TestPassword123!"

class AIIntegrationTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.client = httpx.AsyncClient(timeout=30.0)
        self.access_token = None
        self.user_id = None
        
    async def setup(self):
        """Setup test user and authentication"""
        print("🔧 Setting up test environment...")
        
        # Try to login first
        login_success = await self.login()
        if not login_success:
            # Register new user if login fails
            await self.register()
            await self.login()
    
    async def register(self):
        """Register a test user"""
        print("👤 Registering test user...")
        
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "full_name": "AI Test User",
            "role": "innovator"
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/auth/register",
                json=register_data
            )
            
            if response.status_code == 201:
                print("✅ Test user registered successfully")
                return True
            else:
                print(f"⚠️  Registration response: {response.status_code} - {response.text}")
                return True  # User might already exist
                
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return False
    async def login(self):
        """Login test user"""
        print("🔐 Logging in test user...")
        
        login_data = {
            "username": TEST_USER_EMAIL,  # Login endpoint expects 'username' field
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/auth/login",
                data=login_data  # Use form data instead of JSON
            )
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data["access_token"]
                self.user_id = data["user"]["id"]
                print(f"✅ Login successful! User ID: {self.user_id}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def get_headers(self):
        """Get authorization headers"""
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    async def test_ai_generate_idea(self):
        """Test AI idea generation with database storage"""
        print("\n🧠 Testing AI idea generation...")
        
        request_data = {
            "interests": "sustainable technology, renewable energy",
            "skills": "software development, data analysis, environmental science",
            "industry": "cleantech",
            "problem_area": "carbon emissions",
            "target_market": "small businesses",
            "save_to_database": True
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/innovator/ai/generate-idea",
                json=request_data,
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ AI idea generation successful!")
                print(f"📝 Generated idea: {data['response_text'][:100]}...")
                
                if data.get('metadata', {}).get('saved_to_database'):
                    print(f"💾 Idea saved to database with ID: {data['metadata']['saved_idea_id']}")
                    return data['metadata']['saved_idea_id']
                else:
                    print("⚠️  Idea not saved to database")
                    
                return None
            else:
                print(f"❌ AI generation failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ AI generation error: {e}")
            return None
    
    async def test_ai_judge_idea(self, idea_id=None):
        """Test AI idea judging with score storage"""
        print("\n⚖️  Testing AI idea judging...")
        
        request_data = {
            "idea_id": idea_id or "1",  # Use generated idea or test ID
            "title": "Smart Carbon Tracker for Small Businesses",
            "problem": "Small businesses struggle to track and reduce their carbon footprint",
            "solution": "AI-powered app that automatically tracks business activities and suggests carbon reduction strategies",
            "target_market": "Small to medium enterprises focused on sustainability"
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/innovator/ai/judge-idea",
                json=request_data,
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ AI idea judging successful!")
                print(f"⭐ Overall Score: {data['overall_score']}/10")
                print(f"💪 Strengths: {len(data['strengths'])} identified")
                print(f"⚠️  Weaknesses: {len(data['weaknesses'])} identified")
                print(f"💡 Suggestions: {len(data['improvement_suggestions'])} provided")
                
                if data.get('metadata', {}).get('saved_to_database'):
                    print(f"💾 AI score saved to database for idea {data['metadata']['idea_id']}")
                else:
                    print("⚠️  AI score not saved to database")
                    
                return data['overall_score']
            else:
                print(f"❌ AI judging failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ AI judging error: {e}")
            return None
    
    async def test_ai_fine_tune(self):
        """Test AI idea fine-tuning"""
        print("\n🔧 Testing AI idea fine-tuning...")
        
        request_data = {
            "idea_id": "1",
            "current_content": "Smart Carbon Tracker for Small Businesses",
            "improvement_focus": "market_analysis",
            "additional_context": "Focus on the competitive landscape and market opportunity"
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/innovator/ai/fine-tune",
                json=request_data,
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ AI fine-tuning successful!")
                print(f"🔍 Fine-tuned analysis: {data['response_text'][:100]}...")
                return True
            else:
                print(f"❌ AI fine-tuning failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ AI fine-tuning error: {e}")
            return False
    
    async def test_ai_recommendations(self):
        """Test AI recommendations"""
        print("\n📋 Testing AI recommendations...")
        
        request_data = {
            "user_id": self.user_id,
            "current_ideas": [
                "Smart Carbon Tracker for Small Businesses",
                "AI-powered Waste Management System"
            ],
            "focus_area": "funding"
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/innovator/ai/recommendations",
                json=request_data,
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ AI recommendations successful!")
                print(f"💡 Recommendations: {data['response_text'][:100]}...")
                return True
            else:
                print(f"❌ AI recommendations failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ AI recommendations error: {e}")
            return False
    
    async def test_ai_analytics(self):
        """Test AI analytics endpoint"""
        print("\n📊 Testing AI analytics...")
        
        try:
            response = await self.client.get(
                f"{self.base_url}/api/v1/innovator/ai/analytics",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ AI analytics successful!")
                analytics = data.get('data', {})
                print(f"📈 Total AI-generated ideas: {analytics.get('total_ai_generated_ideas', 0)}")
                print(f"⭐ Average AI score: {analytics.get('average_ai_score', 'N/A')}")
                print(f"🎯 AI score distribution: {analytics.get('score_distribution', {})}")
                return True
            else:
                print(f"❌ AI analytics failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ AI analytics error: {e}")
            return False
    
    async def test_idea_storage_bucket(self):
        """Test file upload to idea-files bucket"""
        print("\n📁 Testing file upload to idea-files bucket...")
        
        # Create a test file
        test_content = b"This is a test file for idea attachments"
        
        try:
            files = {
                'file': ('test_idea_attachment.txt', test_content, 'text/plain')
            }
            data = {
                'idea_id': '1',
                'description': 'Test attachment for AI-generated idea'
            }
            
            # Remove Content-Type from headers for file upload
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            response = await self.client.post(
                f"{self.base_url}/api/v1/innovator/upload-file",
                files=files,
                data=data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ File upload to idea-files bucket successful!")
                print(f"📎 File ID: {data['file']['id']}")
                return data['file']['id']
            else:
                print(f"❌ File upload failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ File upload error: {e}")
            return None
    
    async def cleanup(self):
        """Cleanup test resources"""
        print("\n🧹 Cleaning up...")
        await self.client.aclose()
    
    async def run_all_tests(self):
        """Run all AI integration tests"""
        print("🚀 Starting Complete AI Integration Tests")
        print("=" * 60)
        
        # Setup
        await self.setup()
        if not self.access_token:
            print("❌ Cannot proceed without authentication")
            return False
        
        # Run tests
        results = {}
        
        # Test AI idea generation with database storage
        generated_idea_id = await self.test_ai_generate_idea()
        results['ai_generate'] = generated_idea_id is not None
        
        # Test AI idea judging with score storage
        ai_score = await self.test_ai_judge_idea(generated_idea_id)
        results['ai_judge'] = ai_score is not None
        
        # Test AI fine-tuning
        results['ai_fine_tune'] = await self.test_ai_fine_tune()
        
        # Test AI recommendations
        results['ai_recommendations'] = await self.test_ai_recommendations()
        
        # Test AI analytics
        results['ai_analytics'] = await self.test_ai_analytics()
        
        # Test file storage bucket
        file_id = await self.test_idea_storage_bucket()
        results['file_storage'] = file_id is not None
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        total_tests = len(results)
        passed_tests = sum(results.values())
        
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} {test_name.replace('_', ' ').title()}")
        
        print(f"\n🎯 Overall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED - AI Integration is fully functional!")
        else:
            print("⚠️  Some tests failed - check the logs above for details")
        
        await self.cleanup()
        return passed_tests == total_tests

async def main():
    """Main test function"""
    tester = AIIntegrationTester()
    
    try:
        success = await tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n❌ Tests interrupted by user")
        await tester.cleanup()
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error during testing: {e}")
        await tester.cleanup()
        return 1

if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
