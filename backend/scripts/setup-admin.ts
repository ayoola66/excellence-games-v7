import createSuperAdmin from "./create-superadmin";

export default async ({ strapi }: { strapi: any }) => {
  try {
    console.log("Starting admin setup...");

    // Create super admin
    await createSuperAdmin();

    console.log("Admin setup completed successfully");
  } catch (error) {
    console.error("Error during admin setup:", error);
  }
};
