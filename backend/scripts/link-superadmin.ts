import type { Strapi } from "@strapi/strapi";

export default async ({ strapi }: { strapi: Strapi }) => {
  try {
    // Check if role already exists
    const existingRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "super_admin" },
      });

    if (!existingRole) {
      // Create the Super Admin role
      const role = await strapi.db
        .query("plugin::users-permissions.role")
        .create({
          data: {
            name: "Super Admin",
            description: "Super Admin role with full access",
            type: "super_admin",
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

      console.log("Created Super Admin role:", role);
    } else {
      console.log("Super Admin role already exists");
    }
  } catch (error) {
    console.error("Error setting up Super Admin role:", error);
    throw error;
  }
};
