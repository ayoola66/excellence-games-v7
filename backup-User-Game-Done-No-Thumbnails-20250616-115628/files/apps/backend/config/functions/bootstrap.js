'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

module.exports = async ({ strapi }) => {
  const users = await strapi.db.query('plugin::users-permissions.user').findMany();
  
  for (const user of users) {
    await strapi.plugins['users-permissions'].services.user.edit(user.id, {
      password: 'Passw0rd'
    });
    console.log(`Reset password for ${user.email}`);
  }
  
  console.log('All user passwords have been reset to: Passw0rd');
}; 