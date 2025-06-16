const Strapi = require('@strapi/strapi');
const path = require('path');

async function resetPasswords() {
  try {
    // Initialize Strapi
    const appDir = path.resolve(__dirname, '..');
    const strapi = await Strapi({
      dir: appDir,
      autoReload: false,
      serveAdminPanel: false,
    }).load();

    // Get all users
    const users = await strapi.db.query('plugin::users-permissions.user').findMany();
    
    // Update each user's password
    for (const user of users) {
      await strapi.plugins['users-permissions'].services.user.edit(user.id, {
        password: 'Passw0rd'
      });
      console.log(`Updated password for ${user.email}`);
    }

    console.log('All passwords have been reset to: Passw0rd');
    
    // Cleanup
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
}

resetPasswords(); 