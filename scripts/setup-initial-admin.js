const setupAdmin = require("./setup-strapi-admin");

module.exports = {
  async bootstrap({ strapi }) {
    try {
      await setupAdmin({ strapi });
    } catch (error) {
      strapi.log.error("Failed to run setup scripts:", error);
    }
  },
};
