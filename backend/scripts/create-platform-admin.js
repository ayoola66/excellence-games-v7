"use strict";

const bcrypt = require("bcryptjs");
const Strapi = require("@strapi/strapi");

async function createPlatformAdmin() {
  try {
    // Initialize Strapi with database config
    const appContext = await Strapi({
      dir: process.cwd(),
      autoReload: false,
      serveAdminPanel: false,
    }).load();

    const strapi = await appContext.register({
      dir: process.cwd(),
      autoReload: false,
      serveAdminPanel: false,
      config: {
        database: {
          connection: {
            client: "postgres",
            connection: {
              host: process.env.DATABASE_HOST || "127.0.0.1",
              port: parseInt(process.env.DATABASE_PORT || "5432"),
              database: process.env.DATABASE_NAME || "targeted_v2",
              user: process.env.DATABASE_USERNAME || "postgres",
              password: process.env.DATABASE_PASSWORD || "postgres",
              ssl: false,
            },
            debug: false,
          },
        },
      },
    });

    // Start Strapi
    await strapi.start();

    // Check if Frontend_Admin role exists
    const existingRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "Frontend_Admin" },
      });

    if (!existingRole) {
      // Create the Frontend Admin role
      const role = await strapi.query("plugin::users-permissions.role").create({
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
            "plugin::": {
              actions: ["access", "create", "read", "update", "delete"],
            },
          },
        },
      });

      // Create the Platform Admin user
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      const adminUser = await strapi
        .query("plugin::users-permissions.user")
        .create({
          data: {
            username: "platformadmin",
            email: "admin@elitegames.com",
            password: hashedPassword,
            confirmed: true,
            blocked: false,
            role: role.id,
          },
        });

      console.log("Created Frontend Admin role and Platform Admin user:", {
        role: role.id,
        user: adminUser.id,
      });
    } else {
      console.log("Frontend Admin role already exists");
    }

    // Stop Strapi
    await strapi.stop();
    process.exit(0);
  } catch (error) {
    console.error("Error setting up Frontend Admin:", error);
    process.exit(1);
  }
}

module.exports = async ({ strapi }) => {
  try {
    // Find authenticated role
    const authRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "authenticated" },
      });

    if (!authRole) {
      throw new Error("Authenticated role not found");
    }

    // Create Strapi user first
    const user = await strapi.plugins["users-permissions"].services.user.add({
      username: "superadmin@elitegames.com",
      email: "superadmin@elitegames.com",
      password: "SuperAdmin123!", // You should change this password
      role: authRole.id,
      confirmed: true,
      blocked: false,
      provider: "local",
    });

    // Create platform admin
    const admin = await strapi.db
      .query("api::platform-admin.platform-admin")
      .create({
        data: {
          firstName: "Super",
          lastName: "Admin",
          email: "superadmin@elitegames.com",
          password: "SuperAdmin123!", // Same as user password
          adminRole: "Super Admin",
          accessLevel: 1,
          isActive: true,
          permissions: {
            canManageAdmins: true,
            canManageUsers: true,
            canManageContent: true,
            canManageSettings: true,
            canViewAnalytics: true,
            canManageAPI: true,
          },
          user: user.id,
        },
      });

    console.log("Successfully created platform admin:", admin);
  } catch (error) {
    console.error("Error creating platform admin:", error);
    throw error;
  }
};
