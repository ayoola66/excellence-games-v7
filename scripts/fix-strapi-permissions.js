module.exports = async ({ strapi }) => {
  try {
    // Find Frontend_Admin role
    const role = await strapi.query("plugin::users-permissions.role").findOne({
      where: { type: "Frontend_Admin" },
    });

    if (!role) {
      console.error("Frontend_Admin role not found");
      return;
    }

    // Define permissions for Frontend_Admin
    const permissions = {
      "api::game.game": {
        controllers: {
          game: ["find", "findOne", "create", "update", "delete"],
        },
      },
      "api::question.question": {
        controllers: {
          question: ["find", "findOne", "create", "update", "delete"],
        },
      },
      "api::page.page": {
        controllers: {
          page: ["find", "findOne", "create", "update", "delete"],
        },
      },
      "api::user.user": {
        controllers: {
          user: ["find", "findOne", "create", "update", "delete"],
        },
      },
      "plugin::upload": {
        controllers: {
          upload: ["find", "findOne", "upload", "destroy"],
        },
      },
      "plugin::upload.content-api": {
        controllers: {
          upload: ["find", "findOne", "upload", "destroy"],
        },
      },
    };

    // Update role permissions
    await strapi.query("plugin::users-permissions.permission").updateMany({
      where: {
        role: role.id,
      },
      data: {
        enabled: true,
      },
    });

    // Enable specific permissions
    for (const [type, config] of Object.entries(permissions)) {
      for (const [controller, actions] of Object.entries(config.controllers)) {
        for (const action of actions) {
          await strapi.query("plugin::users-permissions.permission").update({
            where: {
              role: role.id,
              type,
              controller,
              action,
            },
            data: {
              enabled: true,
            },
          });
        }
      }
    }

    console.log("Successfully updated Frontend_Admin permissions");
  } catch (error) {
    console.error("Error updating permissions:", error);
  }
};
