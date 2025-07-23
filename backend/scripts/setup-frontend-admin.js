"use strict";

const { execSync } = require("child_process");
const path = require("path");

async function setupFrontendAdmin() {
  try {
    // Start Strapi in development mode
    console.log("Starting Strapi...");
    const strapiProcess = execSync("strapi develop", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
    });

    // Create the Frontend_Admin role
    console.log("Creating Frontend_Admin role...");
    const roleCreationCommand = `
      strapi console --command "
        (async () => {
          const role = await strapi.query('plugin::users-permissions.role').findOne({
            where: { type: 'Frontend_Admin' }
          });

          if (!role) {
            await strapi.query('plugin::users-permissions.role').create({
              data: {
                name: 'Frontend Admin',
                description: 'Frontend administrator role with platform access',
                type: 'Frontend_Admin',
                permissions: {
                  'admin::': {
                    actions: ['access', 'create', 'read', 'update', 'delete']
                  },
                  'api::': {
                    actions: ['access', 'create', 'read', 'update', 'delete']
                  }
                }
              }
            });
            console.log('Created Frontend_Admin role');
          }

          // Create the user
          const user = await strapi.plugins['users-permissions'].services.user.add({
            username: 'superadmin@elitegames.com',
            email: 'superadmin@elitegames.com',
            password: 'Passw0rd',
            role: role.id,
            confirmed: true,
            blocked: false,
            provider: 'local'
          });

          // Create the platform admin
          const platformAdmin = await strapi.query('api::platform-admin.platform-admin').create({
            data: {
              firstName: 'Super',
              lastName: 'Admin',
              email: 'superadmin@elitegames.com',
              password: 'Passw0rd',
              adminRole: 'Super Admin',
              accessLevel: 1,
              isActive: true,
              user: user.id,
              permissions: {
                canManageAdmins: true,
                canManageUsers: true,
                canManageContent: true,
                canManageSettings: true,
                canViewAnalytics: true,
                canManageAPI: true
              }
            }
          });

          console.log('Successfully created Platform Admin:', platformAdmin);
          process.exit(0);
        })()
      "
    `;

    execSync(roleCreationCommand, {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
    });

    console.log("Frontend Admin setup completed successfully");
  } catch (error) {
    console.error("Error setting up Frontend Admin:", error);
    process.exit(1);
  }
}

setupFrontendAdmin();
