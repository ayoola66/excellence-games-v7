require("dotenv").config();

console.log("Checking environment variables...");

const variables = [
  "NEXT_PUBLIC_STRAPI_API_URL",
  "STRAPI_ADMIN_TOKEN",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "JWT_SECRET",
];

const results = {};

variables.forEach((variable) => {
  const value = process.env[variable];
  results[variable] = {
    set: !!value,
    value: value ? `${value.substring(0, 5)}...` : "Not set",
    length: value ? value.length : 0,
  };
});

console.table(results);

// Check if STRAPI_ADMIN_TOKEN is set
if (!process.env.STRAPI_ADMIN_TOKEN) {
  console.error("\nSTRAPI_ADMIN_TOKEN is not set!");
  console.error(
    "Please run the generate-strapi-token.js script to create a token."
  );
  console.error("npm install axios dotenv");
  console.error(
    "node scripts/generate-strapi-token.js your-admin@email.com your-password"
  );
} else {
  console.log("\nSTRAPI_ADMIN_TOKEN is set!");

  // Test the token
  const axios = require("axios");
  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

  console.log("Testing token against Strapi API...");

  axios
    .get(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
    })
    .then((response) => {
      console.log("Token is valid! User info:");
      console.log(`- ID: ${response.data.id}`);
      console.log(`- Username: ${response.data.username}`);
      console.log(`- Email: ${response.data.email}`);
      console.log(`- Role: ${response.data.role?.name || "Unknown"}`);
    })
    .catch((error) => {
      console.error("Token validation failed!");
      console.error(`Status: ${error.response?.status || "Unknown"}`);
      console.error(
        `Message: ${error.response?.data?.error?.message || error.message}`
      );

      if (error.response?.status === 401) {
        console.error(
          "\nYour token is invalid or expired. Please generate a new one."
        );
      }
    });
}
