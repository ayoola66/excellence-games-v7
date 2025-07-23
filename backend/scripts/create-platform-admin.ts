import type { Strapi } from "@strapi/strapi";

export default async ({ strapi }: { strapi: Strapi }) => {
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
