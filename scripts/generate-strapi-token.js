const axios = require("axios");
const fs = require("fs");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
require("dotenv").config();

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const TOKENS_FILE = "STRAPI_PLATFORM_ADMIN_TOKENS.json";

// Define available token scopes
const TOKEN_SCOPES = {
  "full-access": "Full access to all endpoints",
  "read-only": "Read-only access to all endpoints",
  "custom": "Custom permissions (specified via --permissions)"
};

// Setup CLI arguments
const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 --email [email] --password [password] [options]")
  .option("email", {
    alias: "e",
    describe: "Admin email address",
    type: "string",
    demandOption: true
  })
  .option("password", {
    alias: "p",
    describe: "Admin password",
    type: "string",
    demandOption: true
  })
  .option("scope", {
    alias: "s",
    describe: "Token scope",
    choices: Object.keys(TOKEN_SCOPES),
    default: "full-access"
  })
  .option("permissions", {
    describe: "Custom permissions (comma-separated)",
    type: "string",
    default: ""
  })
  .option("store", {
    describe: "Store token in JSON file",
    type: "boolean",
    default: false
  })
  .option("validate", {
    describe: "Validate existing token for email",
    type: "boolean",
    default: false
  })
  .help()
  .argv;

async function validateToken(email, token) {
  try {
    const response = await axios.get(`${STRAPI_URL}/admin/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.email === email;
  } catch (error) {
    return false;
  }
}

async function loadStoredTokens() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8"));
    }
    return {};
  } catch (error) {
    console.error("Error loading tokens file:", error.message);
    return {};
  }
}

async function storeToken(email, token, scope) {
  try {
    const tokens = await loadStoredTokens();
    tokens[email] = { token, scope, created: new Date().toISOString() };
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    console.log(`Token stored in ${TOKENS_FILE} for ${email}`);
  } catch (error) {
    console.error("Error storing token:", error.message);
  }
}

async function generateStrapiToken() {
  try {
    console.log("Generating Strapi admin token...");

    const { email, password, scope, permissions, store, validate } = argv;

    // First check if validation is requested
    if (validate) {
      const tokens = await loadStoredTokens();
      if (tokens[email]) {
        const isValid = await validateToken(email, tokens[email].token);
        console.log(`Token for ${email} is ${isValid ? "valid" : "invalid"}`);
        return isValid ? tokens[email].token : null;
      }
      console.log(`No stored token found for ${email}`);
      return null;
    }

    console.log(`Generating token for ${email} with scope: ${scope}`);

    // Login to Strapi admin
    const loginResponse = await axios.post(`${STRAPI_URL}/admin/login`, {
      email,
      password,
    });

    if (!loginResponse.data.data.token) {
      throw new Error("Failed to get admin token from login response");
    }

    const adminToken = loginResponse.data.data.token;
    console.log(`Admin token generated: ${adminToken.substring(0, 10)}...`);

    // Create API token with specified scope
    const tokenConfig = {
      name: `Platform Admin Token - ${email} - ${new Date().toISOString()}`,
      description: `Scoped token for ${email} (${scope})`,
      type: scope,
      lifespan: null, // Never expire
    };

    // Add custom permissions if scope is custom
    if (scope === "custom" && permissions) {
      tokenConfig.permissions = permissions.split(",").map(p => p.trim());
    }

    const apiTokenResponse = await axios.post(
      `${STRAPI_URL}/admin/api-tokens`,
      tokenConfig,
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

    // Store token if requested
    if (store) {
      await storeToken(email, apiToken, scope);
    } else {
      // Output token to stdout for piping or manual use
      console.log("\nGenerated API Token:");
      console.log(apiToken);
      console.log("\nTo save this token, rerun with --store flag");
    }

    return apiToken;
  } catch (error) {
    console.error("Error generating Strapi token:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
}

// Only run if executed directly
if (require.main === module) {
  generateStrapiToken();
}

module.exports = {
  generateStrapiToken,
  validateToken,
  loadStoredTokens
};
