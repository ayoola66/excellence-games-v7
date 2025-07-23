export default {
  command: "create-platform-admin",
  description: "Create a new platform admin user",
  async run({ strapi }) {
    try {
      // First create a regular user
      const usersPermissionsService =
        strapi.plugins["users-permissions"].services.user;
      const roleService = strapi.plugins["users-permissions"].services.role;

      // Get the authenticated role
      const { id: roleId } = await roleService.findOne({
        type: "authenticated",
      });

      if (!roleId) {
        throw new Error("Authenticated role not found");
      }

      // Create the associated user first
      const user = await usersPermissionsService.add({
        username: "superadmin@elitegames.com",
        email: "superadmin@elitegames.com",
        password: "Passw0rd",
        role: roleId,
        confirmed: true,
        blocked: false,
        provider: "local",
      });

      // Now create the platform admin
      const platformAdmin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .create({
          data: {
            firstName: "Super",
            lastName: "Admin",
            email: "superadmin@elitegames.com",
            password: "Passw0rd",
            adminRole: "Super Admin",
            accessLevel: 1,
            permissions: {
              canManageAdmins: true,
              canManageUsers: true,
              canManageContent: true,
              canManageSettings: true,
              canViewAnalytics: true,
              canManageAPI: true,
            },
            isActive: true,
            user: user.id, // Link to the created user
          },
        });

      console.log("Platform Admin created successfully:", platformAdmin);
    } catch (error) {
      console.error("Failed to create Platform Admin:", error);
      throw error;
    }
  },
};
