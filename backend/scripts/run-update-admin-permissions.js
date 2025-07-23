/*
 * Stand-alone helper to update Frontend_Admin permissions.
 * Usage:
 *   node scripts/run-update-admin-permissions.js
 */

const strapiFactory = require("@strapi/strapi");

// The original TS helper that actually sets the permissions
require("ts-node/register");
const updatePermissions = require("./update-admin-permissions.ts").default;

(async () => {
  const app = await strapiFactory({
    distDir: "dist",
  }).load();

  try {
    console.info("Starting Frontend_Admin permission update …");
    await updatePermissions({ strapi: app });
    console.info("✔ Permissions updated – all done");
  } catch (err) {
    console.error("✖ Failed to update permissions", err);
  } finally {
    await app.destroy();
    process.exit(0);
  }
})();
