export default (policyContext, config, { strapi }) => {
  const { permission } = config;

  return async (ctx) => {
    try {
      const { id } = ctx.state.user;

      // Find the admin user
      const admin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .findOne({
          where: { id },
          select: ["permissions", "accessLevel", "isActive"],
        });

      if (!admin) {
        return false;
      }

      if (!admin.isActive) {
        return false;
      }

      // If no specific permission is required, just check if user is an active admin
      if (!permission) {
        return true;
      }

      // Check if admin has the required permission
      return admin.permissions[permission] === true;
    } catch (error) {
      console.error("Check admin permission error:", error);
      return false;
    }
  };
};
