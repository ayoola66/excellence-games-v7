'use strict';

module.exports = {
  async seedUsers(strapi) {
    try {
      // Check if users already exist
      const existingUsers = await strapi.query('plugin::users-permissions.user').findMany();
      
      if (existingUsers.length > 0) {
        console.log('Users already seeded, skipping...');
        return;
      }

      // Get the role IDs
      const authenticatedRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (!authenticatedRole) {
        throw new Error('Authenticated role not found');
      }

      const users = [
        {
          username: 'freeuser',
          email: 'user@example.com',
          password: 'password',
          provider: 'local',
          confirmed: true,
          blocked: false,
          role: authenticatedRole.id,
          subscriptionType: 'free',
          profile: {
            fullName: 'Free User',
            phone: '+44 7700 900000',
            address: '123 Free Street, London, UK'
          }
        },
        {
          username: 'premiumuser',
          email: 'premium@example.com',
          password: 'password',
          provider: 'local',
          confirmed: true,
          blocked: false,
          role: authenticatedRole.id,
          subscriptionType: 'premium',
          subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          profile: {
            fullName: 'Premium User',
            phone: '+44 7700 900001',
            address: '456 Premium Avenue, London, UK'
          }
        }
      ];

      console.log('🌱 Seeding users...');

      for (const userData of users) {
        const user = await strapi.plugins['users-permissions'].services.user.add({
          ...userData,
          email: userData.email.toLowerCase(),
        });

        console.log(`Created user: ${user.email}`);
      }

      console.log('✅ Users seeded successfully');
    } catch (error) {
      console.error('Error seeding users:', error);
    }
  }
}; 