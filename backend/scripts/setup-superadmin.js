module.exports = {
  async bootstrap({ strapi }) {
    try {
      // Check if super admin already exists
      const existingAdmin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .findOne({
          where: { email: "superadmin@elitegames.com" },
        });

      if (existingAdmin) {
        console.log("Super admin already exists");
        return;
      }

      // Create platform admin
      const admin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .create({
          data: {
            firstName: "Super",
            lastName: "Admin",
            email: "superadmin@elitegames.com",
            password: "SuperAdmin123!",
            adminRole: "Super Admin",
            isActive: true,
          },
        });

      console.log("Successfully created platform admin:", admin);
    } catch (error) {
      console.error("Error creating platform admin:", error);
      throw error;
    }
  },
};
