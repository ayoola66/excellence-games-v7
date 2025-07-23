import { Strapi } from "@strapi/strapi";

export default async ({ strapi }: { strapi: Strapi }) => {
  try {
    // Check if Frontend_Admin role exists
    const existingRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "Frontend_Admin" },
      });

    const permissions = {
      // Platform admin permissions
      "platform-admin": {
        actions: ["create", "read", "update", "delete"],
      },
      // Game management
      "api::game.game": {
        actions: ["find", "findOne", "create", "update", "delete"],
      },
      // Category management
      "api::category.category": {
        actions: ["find", "findOne", "create", "update", "delete"],
      },
      // Question management
      "api::question.question": {
        actions: ["find", "findOne", "create", "update", "delete"],
      },
      // Settings management
      "api::setting.setting": {
        actions: ["find", "findOne", "create", "update", "delete"],
      },
      // User activity tracking
      "api::user-activity.user-activity": {
        actions: ["find", "findOne", "create"],
      },
      // Game stats
      "api::game-stat.game-stat": {
        actions: ["find", "findOne", "create"],
      },
      // Page management
      "api::page.page": {
        actions: ["find", "findOne", "create", "update", "delete"],
      },
    };

    if (!existingRole) {
      // Create Frontend_Admin role
      await strapi.db.query("plugin::users-permissions.role").create({
        data: {
          name: "Frontend Admin",
          description: "Frontend admin role for platform administrators",
          type: "Frontend_Admin",
          permissions,
        },
      });
      console.log("Frontend_Admin role created successfully");
    } else {
      // Update existing role's permissions
      await strapi.db.query("plugin::users-permissions.role").update({
        where: { id: existingRole.id },
        data: { permissions },
      });
      console.log("Frontend_Admin role permissions updated successfully");
    }
  } catch (error) {
    console.error("Error managing Frontend_Admin role:", error);
  }
};
