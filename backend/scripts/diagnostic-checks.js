const Strapi = require('@strapi/strapi');

async function runDiagnostics() {
  try {
    // Initialize Strapi
    const strapi = await Strapi().load();
    
    console.log('\n=== Running Diagnostic Checks ===\n');

    // 1. Check for authenticated role
    const authRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({
        where: { type: 'authenticated' },
      });
    console.log('1. Authenticated Role Check:');
    console.log('   - Exists:', !!authRole);
    if (authRole) {
      console.log('   - ID:', authRole.id);
      console.log('   - Name:', authRole.name);
    }

    // 2. Check for Frontend_Admin role
    const adminRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({
        where: { type: 'Frontend_Admin' },
      });
    console.log('\n2. Frontend_Admin Role Check:');
    console.log('   - Exists:', !!adminRole);
    if (adminRole) {
      console.log('   - ID:', adminRole.id);
      console.log('   - Name:', adminRole.name);
    }

    // 3. Check for existing platform-admins
    const admins = await strapi.db
      .query('api::platform-admin.platform-admin')
      .findMany({
        populate: ['user'],
      });
    console.log('\n3. Platform Admins Check:');
    console.log('   - Count:', admins.length);
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`\n   Admin #${index + 1}:`);
        console.log('   - ID:', admin.id);
        console.log('   - Email:', admin.email);
        console.log('   - Role:', admin.adminRole);
        console.log('   - Active:', admin.isActive);
        console.log('   - User ID:', admin.user?.id);
      });
    }

    // 4. Check database connection
    const dbStatus = await strapi.db.connection.raw('SELECT 1+1 as result');
    console.log('\n4. Database Connection:');
    console.log('   - Connected:', !!dbStatus);

    console.log('\n=== Diagnostic Checks Complete ===\n');

    // Cleanup
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\nDiagnostic Error:', error);
    process.exit(1);
  }
}

runDiagnostics();