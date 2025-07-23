const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.error("Please provide a token as an argument:");
  console.error("node scripts/set-token.js YOUR_TOKEN_HERE");
  process.exit(1);
}

console.log(`Setting STRAPI_ADMIN_TOKEN to: ${token.substring(0, 10)}...`);

// Update .env.local file
const envPath = path.join(process.cwd(), ".env.local");
let envContent = "";

try {
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");

    // Replace existing STRAPI_ADMIN_TOKEN or add new one
    if (envContent.includes("STRAPI_ADMIN_TOKEN=")) {
      envContent = envContent.replace(
        /STRAPI_ADMIN_TOKEN=.*/,
        `STRAPI_ADMIN_TOKEN=${token}`
      );
    } else {
      envContent += `\nSTRAPI_ADMIN_TOKEN=${token}\n`;
    }
  } else {
    envContent = `NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337\nSTRAPI_ADMIN_TOKEN=${token}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`.env.local updated with new token`);
} catch (error) {
  console.error("Failed to update .env.local file:", error.message);
}
