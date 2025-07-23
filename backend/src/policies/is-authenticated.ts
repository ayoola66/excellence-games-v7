export default (policyContext, config, { strapi }) => {
  return async (ctx) => {
    try {
      // Check if there's a valid session token
      if (!ctx.state.auth) {
        return false;
      }

      const { id } = ctx.state.auth;
      if (!id) {
        return false;
      }

      // Verify the user exists and is a platform admin
      const admin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .findOne({
          where: { user: id },
          select: ["id", "isActive"],
        });

      if (!admin || !admin.isActive) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Authentication check failed:", error);
      return false;
    }
  };
};
