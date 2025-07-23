const fixPermissions = require("./fix-strapi-permissions");

module.exports = async ({ strapi }) => {
  try {
    // Find or create Frontend_Admin role
    let role = await strapi.query("plugin::users-permissions.role").findOne({
      where: { type: "Frontend_Admin" },
    });

    if (!role) {
      role = await strapi.query("plugin::users-permissions.role").create({
        data: {
          name: "Frontend Admin",
          description: "Frontend admin role with elevated privileges",
          type: "Frontend_Admin",
        },
      });
      console.log("Created Frontend_Admin role");
    }

    // Find or create super admin user
    let user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { email: "superadmin@elitegames.com" },
    });

    if (!user) {
      user = await strapi.plugins["users-permissions"].services.user.add({
        username: "superadmin@elitegames.com",
        email: "superadmin@elitegames.com",
        password: "Passw0rd",
        role: role.id,
        confirmed: true,
        blocked: false,
        provider: "local",
      });
      console.log("Created super admin user");
    }

    // Find or create platform admin
    let platformAdmin = await strapi
      .query("api::platform-admin.platform-admin")
      .findOne({
        where: { user: user.id },
      });

    if (!platformAdmin) {
      platformAdmin = await strapi
        .query("api::platform-admin.platform-admin")
        .create({
          data: {
            firstName: "Super",
            lastName: "Admin",
            email: "superadmin@elitegames.com",
            adminRole: "Super Admin",
            accessLevel: 1,
            isActive: true,
            user: user.id,
            permissions: {
              canManageAdmins: true,
              canManageUsers: true,
              canManageContent: true,
              canManageSettings: true,
              canViewAnalytics: true,
              canManageAPI: true,
            },
          },
        });
      console.log("Created platform admin profile");
    }

    // Fix permissions
    await fixPermissions({ strapi });
    console.log("Setup completed successfully");
  } catch (error) {
    console.error("Setup failed:", error);
  }
};
