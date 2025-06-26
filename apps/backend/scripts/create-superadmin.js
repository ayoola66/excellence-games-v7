const bcrypt = require('bcryptjs');

module.exports = {
  async bootstrap({ strapi }) {
    try {
      // Check if superadmin exists
      const existingAdmin = await strapi.db.query('api::admin-user.admin-user').findOne({
        where: { email: 'superadmin@elitegames.com' }
      });

      if (existingAdmin) {
        console.log('Superadmin already exists');
        return;
      }

      // Create superadmin
      const hashedPassword = await bcrypt.hash('Passw0rd', 10);
      
      const superadmin = await strapi.db.query('api::admin-user.admin-user').create({
        data: {
          email: 'superadmin@elitegames.com',
          password: hashedPassword,
          fullName: 'Super Administrator',
          role: 'super_admin',
          displayRole: 'SA',
          badge: 'red',
          permissions: {
            users: ['create', 'read', 'update', 'delete'],
            games: ['create', 'read', 'update', 'delete'],
            questions: ['create', 'read', 'update', 'delete'],
            orders: ['create', 'read', 'update', 'delete'],
            settings: ['create', 'read', 'update', 'delete'],
            admins: ['create', 'read', 'update', 'delete']
          },
          allowedSections: ['dashboard', 'users', 'games', 'questions', 'orders', 'settings', 'admins'],
          isActive: true,
          lastLogin: null,
          lastLoginIP: null,
          auditLog: []
        }
      });

      console.log('Superadmin created successfully:', superadmin.email);
    } catch (error) {
      console.error('Failed to create superadmin:', error);
    }
  }
}; 