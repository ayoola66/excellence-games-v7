import { Strapi } from "../../types/strapi";

export default async ({ strapi }: { strapi: Strapi }) => {
  // Only run this in development mode
  if (process.env.NODE_ENV === "development") {
    try {
      // Create admin role if it doesn't exist
      const adminRole = await strapi.admin.services.role.createRole({
        name: "Super Admin",
        description: "Super admin role",
        code: "super-admin",
      });

      // Create admin user if it doesn't exist
      await strapi.admin.services.user.create({
        firstname: "Admin",
        lastname: "User",
        email: "admin@example.com",
        roles: [adminRole.id],
        password: "Admin123!",
      });

      strapi.log.info("Bootstrap script completed successfully");
    } catch (error) {
      strapi.log.error(`Bootstrap script failed: ${error}`);
    }
  }
};
