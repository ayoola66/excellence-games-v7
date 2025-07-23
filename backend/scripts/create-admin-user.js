const Strapi = require('@strapi/strapi');

async function createAdminUser() {
  try {
    console.log('\n=== Creating Admin User ===\n');

    // Initialize Strapi
    const strapi = await Strapi().load();

    // 1. Check if authenticated role exists
    const authRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({
        where: { type: 'authenticated' },
      });

    if (!authRole) {
      throw new Error('Authenticated role not found');
    }

    // 2. Create the user
    const adminUser = await strapi.plugins['users-permissions'].services.user.add({
      username: 'superadmin@example.com',
      email: 'superadmin@example.com',
      password: 'SuperAdmin123!',
      role: authRole.id,
      confirmed: true,
      blocked: false,
      provider: 'local',
      firstName: 'Super',
      lastName: 'Admin',
      displayName: 'Super Admin',
      phoneNumber: '+1234567890',
      address: '123 Admin St',
      city: 'Admin City',
      country: 'Admin Country',
      postalCode: '12345',
      bio: 'Super Administrator',
    });

    console.log('\nAdmin User created successfully:');
    console.log('- ID:', adminUser.id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', authRole.name);

    // Cleanup
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\nError creating Admin User:', error);
    if (error.details && error.details.errors) {
      error.details.errors.forEach(err => {
        console.error('- Field:', err.path.join('.'));
        console.error('  Message:', err.message);
      });
    }
    process.exit(1);
  }
}

createAdminUser();