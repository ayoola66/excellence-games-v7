const axios = require("axios");
require("dotenv").config();

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const STRAPI_ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

async function testToken() {
  console.log("Testing Strapi API token...");
  console.log(`API URL: ${STRAPI_URL}`);

  if (!STRAPI_ADMIN_TOKEN) {
    console.error("STRAPI_ADMIN_TOKEN is not set in environment variables");
    process.exit(1);
  }

  console.log(`Token length: ${STRAPI_ADMIN_TOKEN.length}`);
  console.log(`Token prefix: ${STRAPI_ADMIN_TOKEN.substring(0, 10)}...`);

  try {
    // Test 1: Get current user
    console.log("\nTest 1: Getting current user...");
    const userResponse = await axios.get(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
    });

    console.log("✅ User test successful!");
    console.log(`User ID: ${userResponse.data.id}`);
    console.log(`Username: ${userResponse.data.username}`);

    // Test 2: List games
    console.log("\nTest 2: Listing games...");
    const gamesResponse = await axios.get(`${STRAPI_URL}/api/games`, {
      headers: {
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
    });

    console.log("✅ Games test successful!");
    console.log(`Found ${gamesResponse.data.data.length} games`);

    // Test 3: Create a test game
    console.log("\nTest 3: Creating a test game...");
    const testGameData = {
      data: {
        name: `Test Game ${new Date().toISOString()}`,
        description: "This is a test game created by the token test script",
        type: "STRAIGHT",
        status: "DRAFT",
        isActive: false,
      },
    };

    const createResponse = await axios.post(
      `${STRAPI_URL}/api/games`,
      testGameData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
        },
      }
    );

    console.log("✅ Game creation test successful!");
    console.log(`Created game with ID: ${createResponse.data.data.id}`);

    // Test 4: Delete the test game
    console.log("\nTest 4: Deleting the test game...");
    const deleteResponse = await axios.delete(
      `${STRAPI_URL}/api/games/${createResponse.data.data.id}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
        },
      }
    );

    console.log("✅ Game deletion test successful!");

    console.log(
      "\n🎉 All tests passed! Your token is valid and has the correct permissions."
    );
    return true;
  } catch (error) {
    console.error("❌ Token test failed!");

    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${JSON.stringify(error.response.data)}`);

      if (error.response.status === 401) {
        console.error("\nYour token is invalid or expired.");
        console.error(
          "Please generate a new token using the create-strapi-token.js script."
        );
      } else if (error.response.status === 403) {
        console.error("\nYour token does not have sufficient permissions.");
        console.error(
          "Please check the permissions for your token in the Strapi admin panel."
        );
      }
    } else {
      console.error(`Error: ${error.message}`);
    }

    return false;
  }
}

testToken();
