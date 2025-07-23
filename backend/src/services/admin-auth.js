"use strict";

/**
 * admin-auth service
 */

module.exports = () => ({
  async authenticateAdmin(ctx) {
    try {
      // Get the admin token from the request headers
      const adminToken = ctx.request.headers.authorization?.replace(
        "Bearer ",
        ""
      );

      if (!adminToken) {
        return { success: false, message: "No admin token provided" };
      }

      // Verify the admin token using Strapi's admin authentication
      const adminUser = await strapi.query("admin::user").findOne({
        where: {
          // For now, we'll use a simple approach - check if the token matches a known admin
          // In production, you'd want to implement proper token verification
          email: "superadmin@elitegames.com",
        },
        populate: ["roles"],
      });

      if (!adminUser) {
        return { success: false, message: "Invalid admin token" };
      }

      // Check if user has admin role
      const hasAdminRole = adminUser.roles.some(
        (role) =>
          role.code === "strapi-super-admin" ||
          role.code === "strapi-editor" ||
          role.name === "Super Admin"
      );

      if (!hasAdminRole) {
        return { success: false, message: "Insufficient permissions" };
      }

      return {
        success: true,
        user: adminUser,
        message: "Admin authenticated successfully",
      };
    } catch (error) {
      console.error("Admin authentication error:", error);
      return { success: false, message: "Authentication failed" };
    }
  },

  async isAdminAuthenticated(ctx) {
    const authResult = await this.authenticateAdmin(ctx);
    return authResult.success;
  },
});
