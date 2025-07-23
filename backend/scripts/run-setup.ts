import type { Strapi } from "@strapi/strapi";
import setupSuperAdminRole from "./link-superadmin";

export default async ({ strapi }: { strapi: Strapi }) => {
  try {
    // Set up the Super Admin role
    await setupSuperAdminRole({ strapi });

    console.log("Setup completed successfully");
  } catch (error) {
    console.error("Setup failed:", error);
    throw error;
  }
};
