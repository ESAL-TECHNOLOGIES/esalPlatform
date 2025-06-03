"""
Test script to debug Gemini API integration
"""
import os
import sys
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# Load environment variables
load_dotenv()

async def test_gemini_api():
    """Test Gemini API directly"""
    print("🔧 DEBUG: Testing Gemini API integration...")
    
    # Check environment variable
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"🔧 DEBUG: API Key from env: {api_key[:10]}...{api_key[-5:] if api_key and len(api_key) > 15 else 'NOT_SET'}")
    print(f"🔧 DEBUG: API Key length: {len(api_key) if api_key else 0}")
    print(f"🔧 DEBUG: API Key valid format: {api_key.startswith('AIza') if api_key else False}")
    
    if not api_key or api_key == 'your-gemini-api-key':
        print("🚨 ERROR: Gemini API key not properly configured!")
        return False
    
    try:
        # Configure Gemini
        print("🔧 DEBUG: Configuring Gemini API...")
        genai.configure(api_key=api_key)
        
        # Create model
        print("🔧 DEBUG: Creating Gemini model...")
        model = genai.GenerativeModel('gemini-pro')
        
        # Test simple request
        print("🔧 DEBUG: Sending test request...")
        prompt = "Hello, can you respond with just 'API working correctly'?"
        response = model.generate_content(prompt)
        
        print(f"✅ SUCCESS: Gemini API response: {response.text}")
        return True
        
    except Exception as e:
        print(f"🚨 ERROR: Gemini API test failed - {str(e)}")
        print(f"🚨 ERROR: Exception type: {type(e).__name__}")
        import traceback
        print(f"🚨 ERROR: Full traceback:\n{traceback.format_exc()}")
        return False

async def test_ai_service():
    """Test the AI service class"""
    print("\n🔧 DEBUG: Testing GeminiAIService class...")
    
    try:
        from app.config import settings
        from app.services.gemini_ai import GeminiAIService
        from app.schemas import AIGenerateIdeaRequest
        
        print(f"🔧 DEBUG: Settings API Key: {settings.GEMINI_API_KEY[:10]}...{settings.GEMINI_API_KEY[-5:] if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 15 else 'NOT_SET'}")
        
        # Create service
        ai_service = GeminiAIService()
        
        # Create test request
        test_request = AIGenerateIdeaRequest(
            interests="artificial intelligence, sustainability",
            skills="Python programming, data analysis",
            industry="technology",
            problem_area="climate change",
            target_market="small businesses",
            save_to_database=False
        )
        
        print("🔧 DEBUG: Testing generate_new_idea method...")
        response = await ai_service.generate_new_idea(test_request)
        
        print(f"✅ SUCCESS: AI Service response received")
        print(f"📄 Response length: {len(response.response_text)} characters")
        print(f"🎯 Confidence: {response.confidence_score}")
        print(f"📊 Metadata: {response.metadata}")
        print(f"📝 Response preview: {response.response_text[:200]}...")
        
        # Check if it's fallback or real API
        if response.metadata and response.metadata.get('source') == 'fallback':
            print("⚠️  WARNING: Using fallback response (API failed)")
            return False
        else:
            print("✅ SUCCESS: Real Gemini API response received")
            return True
            
    except Exception as e:
        print(f"🚨 ERROR: AI Service test failed - {str(e)}")
        import traceback
        print(f"🚨 ERROR: Full traceback:\n{traceback.format_exc()}")
        return False

async def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 GEMINI API INTEGRATION DEBUG TESTS")
    print("=" * 60)
    
    # Test 1: Direct API test
    api_test = await test_gemini_api()
    
    # Test 2: AI Service test
    service_test = await test_ai_service()
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Direct API Test: {'✅ PASS' if api_test else '❌ FAIL'}")
    print(f"AI Service Test: {'✅ PASS' if service_test else '❌ FAIL'}")
    
    if api_test and service_test:
        print("🎉 ALL TESTS PASSED - Gemini API is working correctly!")
    elif api_test and not service_test:
        print("⚠️  API works but service has issues - Check AI service implementation")
    elif not api_test:
        print("🚨 API KEY ISSUE - Check your Gemini API key configuration")
    
    return api_test and service_test

if __name__ == "__main__":
    asyncio.run(main())
