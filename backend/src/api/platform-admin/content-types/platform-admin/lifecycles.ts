import { Strapi } from "@strapi/strapi";

const setPermissionsAndAccessLevel = (data: any) => {
  // Set access level based on adminRole
  switch (data.adminRole) {
    case "Super Admin":
      data.accessLevel = 1;
      data.permissions = {
        canManageAdmins: true,
        canManageUsers: true,
        canManageContent: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageAPI: true,
      };
      break;
    case "Dev Admin":
      data.accessLevel = 2;
      data.permissions = {
        canManageAdmins: false,
        canManageUsers: true,
        canManageContent: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageAPI: true,
      };
      break;
    default:
      data.accessLevel = 3;
      data.permissions = {
        canManageAdmins: false,
        canManageUsers: false,
        canManageContent: true,
        canManageSettings: false,
        canViewAnalytics: true,
        canManageAPI: false,
      };
  }
};

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    setPermissionsAndAccessLevel(data);

    // Create associated Strapi user
    try {
      // Find the authenticated role
      const role = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: "authenticated" },
        });

      if (!role) {
        throw new Error("Authenticated role not found");
      }

      // Create the user
      const user = await strapi.plugins["users-permissions"].services.user.add({
        username: data.email,
        email: data.email,
        password: data.password,
        role: role.id,
        confirmed: true,
        blocked: false,
        provider: "local",
      });

      // Link the created user to the platform admin
      data.user = user.id;
    } catch (error) {
      console.error("Error creating associated user:", error);
      throw error;
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.adminRole) {
      setPermissionsAndAccessLevel(data);
    }
  },
};
