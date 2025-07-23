"use strict";

const setupAdmin = require("../../../scripts/setup-strapi-admin");

module.exports = async ({ strapi }) => {
  try {
    await setupAdmin({ strapi });
  } catch (error) {
    strapi.log.error("Bootstrap failed:", error);
  }
};
