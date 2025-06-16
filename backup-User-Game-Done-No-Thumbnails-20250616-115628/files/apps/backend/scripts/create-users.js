'use strict';

module.exports = {
  async createUsers(strapi) {
    try {
      // 1. Create Admin User
      const adminExists = await strapi.db.query('api::admin-user.admin-user').findOne({
        where: { email: 'admin@elitegames.com' }
      });

      if (!adminExists) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('Admin2024!', 10);
        
        const admin = await strapi.db.query('api::admin-user.admin-user').create({
          data: {
            email: 'admin@elitegames.com',
            password: hashedPassword,
            fullName: 'Admin User',
            adminType: 'SA',
            badge: 'Super Admin',
            permissions: {
              games: ['create', 'read', 'update', 'delete'],
              users: ['read', 'update'],
              settings: ['read', 'update']
            },
            isActive: true
          }
        });
        console.log('✅ Admin user created:', admin.email);
      } else {
        console.log('ℹ️ Admin user already exists');
      }

      // 2. Create Regular User
      const authenticatedRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (!authenticatedRole) {
        throw new Error('Authenticated role not found');
      }

      const regularUserExists = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: 'player@elitegames.com' }
      });

      if (!regularUserExists) {
        const regularUser = await strapi.plugins['users-permissions'].services.user.add({
          username: 'gameplayer',
          email: 'player@elitegames.com',
          password: 'Player2024!',
          provider: 'local',
          confirmed: true,
          blocked: false,
          role: authenticatedRole.id,
          subscriptionStatus: 'premium',
          premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          fullName: 'Game Player',
          phone: '+44 7700 900000',
          address: '123 Player Street, London, UK'
        });
        console.log('✅ Regular user created:', regularUser.email);
      } else {
        console.log('ℹ️ Regular user already exists');
      }

      console.log('\n🎮 User Credentials:');
      console.log('\nAdmin User:');
      console.log('Email: admin@elitegames.com');
      console.log('Password: Admin2024!');
      console.log('\nGame Player:');
      console.log('Email: player@elitegames.com');
      console.log('Password: Player2024!');

    } catch (error) {
      console.error('❌ Error creating users:', error);
    }
  }
}; 