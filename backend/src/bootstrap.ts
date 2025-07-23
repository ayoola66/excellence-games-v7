import { Strapi } from '@strapi/strapi';

import createFrontendAdminRole from './create-frontend-admin-role';

export default async ({ strapi }: { strapi: Strapi }) => {
  // First ensure the Frontend_Admin role exists
  await createFrontendAdminRole({ strapi });
  // check if any user exists
  const admins = await strapi.db.query('plugin::users-permissions.user').findMany({
    where: {
      email: 'superadmin@elitegames.com'
    }
  });

  if (admins.length === 0) {
    try {
      // Find the Frontend_Admin role
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'Frontend_Admin' }
      });

      if (!role) {
        throw new Error('Frontend_Admin role not found');
      }

      // Create the superadmin user
      const superadmin = await strapi.plugins['users-permissions'].services.user.add({
        username: 'superadmin@elitegames.com',
        email: 'superadmin@elitegames.com',
        password: 'Passw0rd',
        role: role.id,
        confirmed: true,
        blocked: false,
        provider: 'local'
      });

      // Create the platform admin entry
      await strapi.db.query('api::platform-admin.platform-admin').create({
        data: {
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@elitegames.com',
          password: 'Passw0rd',
          adminRole: 'Super Admin',
          accessLevel: 1,
          isActive: true,
          user: superadmin.id,
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

      console.log('Superadmin account created successfully');
    } catch (error) {
      console.error('Could not create the superadmin account:', error);
    }
  }
};
