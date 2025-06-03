// Frontend Debugging Script
// Run this in the browser console to diagnose "failed to fetch" issues

console.log("=== ESAL Platform Frontend Debug ===");

// 1. Check if we're on the correct domain
console.log("1. Current URL:", window.location.href);

// 2. Check localStorage for authentication token
const token = localStorage.getItem("access_token");
console.log("2. Auth Token exists:", !!token);
if (token) {
  try {
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    console.log("   Token expiry:", new Date(tokenData.exp * 1000));
    console.log("   Token expired:", Date.now() > tokenData.exp * 1000);
  } catch (e) {
    console.log("   Token parsing error:", e.message);
  }
}

// 3. Test direct API call (innovator endpoint)
async function testApiCall() {
  console.log("\n3. Testing innovator API call...");

  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/innovator/view-ideas",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("   API Response Status:", response.status);
    console.log("   API Response OK:", response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log("   API Response Data:", data);
    } else {
      const errorText = await response.text();
      console.log("   API Error Response:", errorText);
    }
  } catch (error) {
    console.log("   API Fetch Error:", error.message);
    console.log("   Error Type:", error.constructor.name);
    console.log("   Full Error:", error);
  }
}

// 3b. Test specific idea details endpoint (the failing one)
async function testIdeaDetailsCall() {
  console.log("\n3b. Testing idea details API call...");

  // Test with idea ID 4 (from the error)
  const ideaId = 4;

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/ideas/${ideaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("   Idea Details Response Status:", response.status);
    console.log("   Idea Details Response OK:", response.ok);
    console.log(
      "   Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      const data = await response.json();
      console.log("   Idea Details Data:", data);
    } else {
      const errorText = await response.text();
      console.log("   Idea Details Error Response:", errorText);

      // Check if it's a 404 (idea not found) vs authentication issue
      if (response.status === 404) {
        console.log(
          "   💡 This might be normal - idea with ID 4 may not exist"
        );
        console.log("   🔍 Let's check what ideas do exist...");
        await testAvailableIdeas();
      } else if (response.status === 401) {
        console.log(
          "   🔑 Authentication issue - token may be invalid or expired"
        );
      } else if (response.status === 403) {
        console.log("   🚫 Authorization issue - user may not have permission");
      }
    }
  } catch (error) {
    console.log("   Idea Details Fetch Error:", error.message);
    console.log("   Error Type:", error.constructor.name);
    console.log("   Full Error:", error);

    if (error.message.includes("Failed to fetch")) {
      console.log("   🔍 This is the exact error from the frontend!");
      console.log("   🔧 Possible causes:");
      console.log("     1. Backend is down or unreachable");
      console.log("     2. CORS policy blocking the request");
      console.log("     3. Network connectivity issue");
      console.log("     4. Browser cache/security policy");
    }
  }
}

// 3c. Test what ideas actually exist
async function testAvailableIdeas() {
  console.log("\n3c. Testing available ideas...");

  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/innovator/view-ideas",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const ideas = await response.json();
      console.log("   Available Ideas Count:", ideas.length);
      if (ideas.length > 0) {
        console.log(
          "   Available Idea IDs:",
          ideas.map((idea) => idea.id)
        );
        console.log(
          "   First few ideas:",
          ideas.slice(0, 3).map((idea) => ({
            id: idea.id,
            title: idea.title,
            status: idea.status,
          }))
        );

        // Test with the first available idea
        if (ideas[0] && ideas[0].id) {
          await testSpecificIdea(ideas[0].id);
        }
      } else {
        console.log(
          "   📝 No ideas found - user may need to create some ideas first"
        );
      }
    } else {
      console.log("   Error fetching available ideas:", response.status);
    }
  } catch (error) {
    console.log("   Error checking available ideas:", error.message);
  }
}

// 3d. Test with a specific existing idea ID
async function testSpecificIdea(ideaId) {
  console.log(`\n3d. Testing with existing idea ID: ${ideaId}...`);

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/ideas/${ideaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`   Specific Idea ${ideaId} Status:`, response.status);
    console.log(`   Specific Idea ${ideaId} OK:`, response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success! Idea ${ideaId} loaded correctly`);
      console.log("   Idea Title:", data.title);
      console.log("   Idea Status:", data.status);
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed to load idea ${ideaId}:`, errorText);
    }
  } catch (error) {
    console.log(`   ❌ Network error for idea ${ideaId}:`, error.message);
  }
}

// 4. Test CORS preflight for ideas endpoint
async function testCorsPrelight() {
  console.log("\n4. Testing CORS preflight...");

  try {
    // Test OPTIONS for innovator endpoint
    const response1 = await fetch(
      "http://localhost:8000/api/v1/innovator/view-ideas",
      {
        method: "OPTIONS",
      }
    );

    console.log("   Innovator CORS Preflight Status:", response1.status);
    console.log(
      "   Innovator CORS Headers:",
      Object.fromEntries(response1.headers.entries())
    );

    // Test OPTIONS for ideas endpoint
    const response2 = await fetch("http://localhost:8000/api/v1/ideas/4", {
      method: "OPTIONS",
    });

    console.log("   Ideas CORS Preflight Status:", response2.status);
    console.log(
      "   Ideas CORS Headers:",
      Object.fromEntries(response2.headers.entries())
    );
  } catch (error) {
    console.log("   CORS Preflight Error:", error.message);
  }
}

// 4b. Test direct API endpoint without authentication
async function testDirectEndpoint() {
  console.log("\n4b. Testing direct endpoint access...");

  try {
    // Test root endpoint
    const rootResponse = await fetch("http://localhost:8000/");
    console.log("   Root endpoint status:", rootResponse.status);
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log("   Root data:", rootData);
    }

    // Test ideas endpoint without auth (should get 401)
    const ideasResponse = await fetch("http://localhost:8000/api/v1/ideas/4");
    console.log("   Ideas endpoint (no auth) status:", ideasResponse.status);
    if (!ideasResponse.ok) {
      const errorText = await ideasResponse.text();
      console.log("   Ideas endpoint error:", errorText);
    }
  } catch (error) {
    console.log("   Direct endpoint test error:", error.message);
  }
}

// 5. Check network connectivity
async function testNetworkConnectivity() {
  console.log("\n5. Testing network connectivity...");

  try {
    // Test if backend is reachable
    const response = await fetch("http://localhost:8000/docs", {
      method: "HEAD",
    });
    console.log("   Backend reachable:", response.ok);
  } catch (error) {
    console.log("   Backend connectivity error:", error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testNetworkConnectivity();
  await testDirectEndpoint();
  await testCorsPrelight();
  await testApiCall();
  await testIdeaDetailsCall();

  console.log("\n=== Debug Complete ===");
  console.log(
    "If you see this script, copy and paste it into your browser's developer console"
  );
  console.log(
    "Then navigate to http://localhost:3001, login, and run the tests"
  );
}

// Auto-run if we have a token, otherwise provide instructions
if (token) {
  runAllTests();
} else {
  console.log("\nNo auth token found. Please:");
  console.log("1. Navigate to http://localhost:3001");
  console.log("2. Login to the application");
  console.log("3. Run this script again by calling: runAllTests()");
}

// Make functions available globally for manual testing
window.debugEsal = {
  testApiCall,
  testIdeaDetailsCall,
  testAvailableIdeas,
  testSpecificIdea,
  testCorsPrelight,
  testDirectEndpoint,
  testNetworkConnectivity,
  runAllTests,
};

console.log("\nDebug functions available as: window.debugEsal.*");
