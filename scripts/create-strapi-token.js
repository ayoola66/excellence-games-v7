const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

async function createStrapiToken() {
  try {
    console.log("Creating Strapi API token...");

    // Get credentials from command line arguments or use defaults
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error("Please provide email and password as arguments:");
      console.error(
        "node scripts/create-strapi-token.js your-email@example.com your-password"
      );
      process.exit(1);
    }

    console.log(`Using email: ${email}`);
    console.log(`Using password: ${password.replace(/./g, "*")}`);

    // Step 1: Login to Strapi admin
    console.log("\nLogging in to Strapi admin...");
    const loginResponse = await axios.post(`${STRAPI_URL}/admin/login`, {
      email,
      password,
    });

    if (!loginResponse.data.data.token) {
      throw new Error("Failed to get admin token from login response");
    }

    const adminToken = loginResponse.data.data.token;
    console.log(`Admin token received: ${adminToken.substring(0, 10)}...`);

    // Step 2: Create API token
    console.log("\nCreating API token...");
    const apiTokenResponse = await axios.post(
      `${STRAPI_URL}/admin/api-tokens`,
      {
        name: `NextJS Admin Token ${new Date().toISOString()}`,
        description: "Token for NextJS admin dashboard",
        type: "full-access",
        lifespan: null, // Never expire
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    if (!apiTokenResponse.data.data.accessKey) {
      throw new Error("Failed to create API token");
    }

    const apiToken = apiTokenResponse.data.data.accessKey;
    console.log(`API token created: ${apiToken.substring(0, 10)}...`);

    // Step 3: Update .env.local file with the new token
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";

    try {
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");

        // Replace existing STRAPI_ADMIN_TOKEN or add new one
        if (envContent.includes("STRAPI_ADMIN_TOKEN=")) {
          envContent = envContent.replace(
            /STRAPI_ADMIN_TOKEN=.*/,
            `STRAPI_ADMIN_TOKEN=${apiToken}`
          );
        } else {
          envContent += `\nSTRAPI_ADMIN_TOKEN=${apiToken}\n`;
        }
      } else {
        envContent = `NEXT_PUBLIC_STRAPI_API_URL=${STRAPI_URL}\nSTRAPI_ADMIN_TOKEN=${apiToken}\n`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log(`.env.local updated with new token`);

      // Step 4: Test the token
      console.log("\nTesting the new token...");
      const testResponse = await axios.get(`${STRAPI_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });

      console.log("Token test successful!");
      console.log(`User ID: ${testResponse.data.id}`);
      console.log(`Username: ${testResponse.data.username}`);

      return apiToken;
    } catch (error) {
      console.error("Failed to update .env.local file:", error.message);
      console.log("Please manually add this token to your .env.local file:");
      console.log(`STRAPI_ADMIN_TOKEN=${apiToken}`);
      return apiToken;
    }
  } catch (error) {
    console.error("Error creating Strapi token:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    process.exit(1);
  }
}

createStrapiToken();
