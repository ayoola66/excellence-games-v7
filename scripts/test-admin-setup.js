const axios = require("axios");
require("dotenv").config({ path: ".env.local" });

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const STRAPI_ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

async function testAdminSetup() {
  console.log("🧪 Testing Admin Setup...\n");

  console.log("Configuration:");
  console.log(`- STRAPI_URL: ${STRAPI_URL}`);
  console.log(
    `- STRAPI_ADMIN_TOKEN: ${STRAPI_ADMIN_TOKEN ? "✅ Set" : "❌ Missing"}`,
  );
  console.log("");

  if (!STRAPI_ADMIN_TOKEN) {
    console.error("❌ STRAPI_ADMIN_TOKEN is not set in .env.local");
    console.log("Run: node scripts/create-strapi-token.js <email> <password>");
    process.exit(1);
  }

  try {
    // Test 1: Backend connectivity
    console.log("1. Testing backend connectivity...");
    try {
      const healthResponse = await axios.get(`${STRAPI_URL}/_health`, {
        timeout: 5000,
      });
      console.log("   ✅ Backend is accessible");
    } catch (error) {
      console.log("   ❌ Backend is not accessible");
      console.log(
        "   💡 Start backend with: cd apps/backend && npm run develop",
      );
      return;
    }

    // Test 2: Admin token validation
    console.log("2. Testing admin token...");
    try {
      const tokenResponse = await axios.get(`${STRAPI_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}` },
        timeout: 5000,
      });
      console.log("   ✅ Admin token is valid");
    } catch (error) {
      console.log("   ❌ Admin token is invalid");
      console.log(
        "   💡 Generate new token with: node scripts/create-strapi-token.js <email> <password>",
      );
      return;
    }

    // Test 3: Stats endpoint
    console.log("3. Testing stats endpoint...");
    try {
      const statsResponse = await axios.get(`${STRAPI_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}` },
        timeout: 5000,
      });
      console.log("   ✅ Stats endpoint is working");
      console.log("   📊 Stats:", JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log("   ❌ Stats endpoint failed");
      console.log("   Error:", error.response?.data || error.message);
    }

    // Test 4: Games endpoint
    console.log("4. Testing games endpoint...");
    try {
      const gamesResponse = await axios.get(
        `${STRAPI_URL}/api/games?pagination[limit]=1`,
        {
          headers: { Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}` },
          timeout: 5000,
        },
      );
      console.log("   ✅ Games endpoint is working");
      console.log(
        `   🎮 Found ${gamesResponse.data.meta?.pagination?.total || 0} games`,
      );
    } catch (error) {
      console.log("   ❌ Games endpoint failed");
      console.log("   Error:", error.response?.data || error.message);
    }

    console.log("\n🎉 Admin setup test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAdminSetup();
