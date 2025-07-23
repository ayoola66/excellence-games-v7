"use strict";

const createPlatformAdmin = require("./create-platform-admin");
const Strapi = require("@strapi/strapi");

async function setupAdmin() {
  try {
    // Initialize Strapi
    const strapi = await Strapi().load();
    await strapi.start();

    // Create the platform admin
    await createPlatformAdmin({ strapi });

    console.log("Platform Admin setup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to setup Platform Admin:", error);
    process.exit(1);
  }
}

setupAdmin();
