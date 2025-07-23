"use strict";

module.exports = async ({ strapi }) => {
  try {
    // First check if Frontend_Admin role exists
    const role = await strapi.query("plugin::users-permissions.role").findOne({
      where: { type: "Frontend_Admin" },
    });

    if (!role) {
      // Create Frontend_Admin role if it doesn't exist
      const newRole = await strapi
        .query("plugin::users-permissions.role")
        .create({
          data: {
            name: "Frontend Admin",
            description: "Frontend administrator role with platform access",
            type: "Frontend_Admin",
            permissions: {
              "admin::": {
                actions: ["access", "create", "read", "update", "delete"],
              },
              "api::": {
                actions: ["access", "create", "read", "update", "delete"],
              },
            },
          },
        });
      console.log("Created Frontend_Admin role:", newRole);
    }

    // Check if superadmin user already exists
    const existingUser = await strapi
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email: "superadmin@elitegames.com" },
      });

    if (existingUser) {
      console.log("Superadmin user already exists");
      return;
    }

    // Create the user
    const user = await strapi.plugins["users-permissions"].services.user.add({
      username: "superadmin@elitegames.com",
      email: "superadmin@elitegames.com",
      password: "Passw0rd",
      role: role.id,
      confirmed: true,
      blocked: false,
      provider: "local",
    });

    // Create the platform admin
    const platformAdmin = await strapi
      .query("api::platform-admin.platform-admin")
      .create({
        data: {
          firstName: "Super",
          lastName: "Admin",
          email: "superadmin@elitegames.com",
          password: "Passw0rd",
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

    console.log("Successfully created Platform Admin:", platformAdmin);
  } catch (error) {
    console.error("Error creating Platform Admin:", error);
    throw error;
  }
};
