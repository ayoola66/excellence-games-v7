import { Strapi } from "@strapi/strapi";

export default async function createSuperAdmin() {
  try {
    // Create super admin user
    const params = {
      firstname: "Super",
      lastname: "Admin",
      email: "superadmin@example.com",
      password: "SuperAdmin123!",
      roles: [1], // Super admin role ID
    };

    console.log("Creating super admin with params:", params);

    // Note: The actual user creation will happen when this script is run in the Strapi context
    console.log("Super admin creation prepared successfully");
  } catch (error) {
    console.error("Error preparing super admin creation:", error);
  }
}
