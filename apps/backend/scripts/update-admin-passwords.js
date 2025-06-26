'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async updatePasswords(strapi) {
    try {
      const newPassword = 'Passw0rd';
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Get all admin users
      const adminUsers = await strapi.db.query('api::admin-user.admin-user').findMany();

      // Update each user's password
      for (const user of adminUsers) {
        await strapi.db.query('api::admin-user.admin-user').update({
          where: { id: user.id },
          data: {
            password: hashedPassword
          }
        });
        console.log(`✅ Password updated for user: ${user.email}`);
      }

      console.log('\n🔑 All admin users now have the password: Passw0rd');

    } catch (error) {
      console.error('❌ Error updating passwords:', error);
    }
  }
}; 