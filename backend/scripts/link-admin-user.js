const Strapi = require('@strapi/strapi');

async function linkAdminUser() {
  try {
    console.log('\n=== Linking Admin User ===\n');

    // Initialize Strapi
    const strapi = await Strapi().load();

    // 1. Find the user
    const user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: { email: 'superadmin@example.com' },
      });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. Find the platform admin
    const admin = await strapi.db
      .query('api::platform-admin.platform-admin')
      .findOne({
        where: { email: 'superadmin@example.com' },
      });

    if (!admin) {
      throw new Error('Platform admin not found');
    }

    // 3. Link the user to the platform admin
    const updatedAdmin = await strapi.db
      .query('api::platform-admin.platform-admin')
      .update({
        where: { id: admin.id },
        data: { user: user.id },
      });

    console.log('\nAdmin User linked successfully:');
    console.log('- Admin ID:', updatedAdmin.id);
    console.log('- User ID:', user.id);
    console.log('- Email:', user.email);

    // Cleanup
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\nError linking Admin User:', error);
    process.exit(1);
  }
}

linkAdminUser();