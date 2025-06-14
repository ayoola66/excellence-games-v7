const strapi = require('@strapi/strapi');

async function updatePasswords() {
  try {
    // Initialize Strapi
    await strapi().load();
    
    // Get all users
    const users = await strapi().db.query('plugin::users-permissions.user').findMany();
    
    // Update each user's password
    for (const user of users) {
      await strapi().plugins['users-permissions'].services.user.edit(user.id, {
        password: 'Passw0rd'
      });
      console.log(`Updated password for user: ${user.email}`);
    }
    
    console.log('All passwords have been updated to Passw0rd');
    
    // Cleanup
    await strapi().destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exit(1);
  }
}

updatePasswords(); 