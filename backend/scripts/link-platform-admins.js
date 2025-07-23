module.exports = async ({ strapi }) => {
  try {
    // Get Frontend_Admin role
    const role = await strapi.query("plugin::users-permissions.role").findOne({
      where: { type: "Frontend_Admin" },
    });

    if (!role) {
      console.error("Frontend_Admin role not found");
      return;
    }

    // Get all Platform Admins without linked users
    const platformAdmins = await strapi
      .query("api::platform-admin.platform-admin")
      .findMany({
        where: {
          user: null,
        },
      });

    console.log(
      `Found ${platformAdmins.length} Platform Admins without linked users`
    );

    for (const admin of platformAdmins) {
      try {
        // Create Strapi user
        const user = await strapi.plugins[
          "users-permissions"
        ].services.user.add({
          username: admin.email,
          email: admin.email,
          password: admin.password,
          role: role.id,
          confirmed: true,
          blocked: !admin.isActive,
          provider: "local",
        });

        // Link user to Platform Admin
        await strapi.query("api::platform-admin.platform-admin").update({
          where: { id: admin.id },
          data: { user: user.id },
        });

        console.log(
          `Successfully linked Platform Admin ${admin.email} to Strapi user`
        );
      } catch (error) {
        console.error(`Failed to link Platform Admin ${admin.email}:`, error);
      }
    }

    console.log("Finished linking Platform Admins to Strapi users");
  } catch (error) {
    console.error("Error in link-platform-admins script:", error);
  }
};
