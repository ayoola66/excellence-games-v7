'use strict';

import bcrypt from 'bcryptjs';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register() {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      const newPassword = 'Passw0rd';
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Get all admin users using the admin API
      const adminUsers = await strapi.query('admin::user').findMany();

      // Update each user's password to hashed 'Passw0rd'
      for (const user of adminUsers) {
        await strapi.query('admin::user').update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            resetPasswordToken: null
          }
        });
        console.log(`✅ Password updated for user: ${user.email}`);
      }

      console.log('\n🔑 All admin users now have the password: Passw0rd');

    } catch (error) {
      console.error('❌ Error updating passwords:', error);
    }
  },
};
