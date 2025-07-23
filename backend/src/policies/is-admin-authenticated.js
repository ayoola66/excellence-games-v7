"use strict";

/**
 * Policy to check if user is authenticated as admin
 */

module.exports = async (policyContext, config, { strapi }) => {
  try {
    // Use the admin authentication service
    const adminAuthService = strapi.service("admin-auth");
    const isAuthenticated = await adminAuthService.isAdminAuthenticated(
      policyContext
    );

    return isAuthenticated;
  } catch (error) {
    console.error("Admin authentication policy error:", error);
    return false;
  }
};
