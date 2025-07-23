import createFrontendAdminRole from "../src/create-frontend-admin-role";

export default async ({ strapi }) => {
  try {
    console.log("Updating Frontend_Admin role permissions...");
    await createFrontendAdminRole({ strapi });
    console.log("Frontend_Admin role permissions updated successfully");
  } catch (error) {
    console.error("Error updating Frontend_Admin role permissions:", error);
  }
};
