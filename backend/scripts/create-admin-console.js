async function createPlatformAdmin() {
  try {
    const admin = await strapi.db
      .query("api::platform-admin.platform-admin")
      .create({
        data: {
          firstName: "Super",
          lastName: "Admin",
          email: "superadmin@elitegames.com",
          password: "SuperAdmin123!",
          adminRole: "Super Admin",
          isActive: true,
        },
      });
    console.log("Successfully created platform admin:", admin);
    return admin;
  } catch (error) {
    console.error("Error creating platform admin:", error);
    throw error;
  }
}

// Execute the function
createPlatformAdmin();
