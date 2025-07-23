const Strapi = require('@strapi/strapi');

async function createSuperAdmin() {
  try {
    console.log('\n=== Creating Super Admin ===\n');

    // Initialize Strapi
    const strapi = await Strapi().load();

    // 1. Check if authenticated role exists
    const authRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({
        where: { type: 'authenticated' },
      });

    if (!authRole) {
      console.log('Creating authenticated role...');
      await strapi.db.query('plugin::users-permissions.role').create({
        data: {
          name: 'Authenticated',
          description: 'Default role given to authenticated user.',
          type: 'authenticated',
        },
      });
      console.log('Authenticated role created successfully.');
    }

    // 2. Check for existing super admin
    const existingAdmin = await strapi.db
      .query('api::platform-admin.platform-admin')
      .findOne({
        where: { adminRole: 'Super Admin' },
      });

    if (existingAdmin) {
      console.log('Super Admin already exists:', existingAdmin.email);
      await strapi.destroy();
      process.exit(0);
    }

    // 3. Create the super admin
    const superAdmin = await strapi.db
      .query('api::platform-admin.platform-admin')
      .create({
        data: {
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@example.com',
          password: 'SuperAdmin123!',
          adminRole: 'Super Admin',
          isActive: true,
        },
      });

    console.log('\nSuper Admin created successfully:');
    console.log('- ID:', superAdmin.id);
    console.log('- Email:', superAdmin.email);
    console.log('- Role:', superAdmin.adminRole);
    console.log('\nPlease change the password upon first login.');

    // Cleanup
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\nError creating Super Admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();