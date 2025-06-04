'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

module.exports = async () => {
  // Set default permissions for question content type
  try {
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { name: 'Public' }
    });

    if (publicRole) {
      // Set permissions for questions
      await strapi.query('plugin::users-permissions.permission').updateMany({
        where: {
          role: publicRole.id,
          action: ['find', 'findOne'],
          apiId: 'api::question.question'
        },
        data: { enabled: true }
      });

      console.log('✅ Question permissions set for Public role');
    }

    // Set permissions for authenticated role
    const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { name: 'Authenticated' }
    });

    if (authenticatedRole) {
      await strapi.query('plugin::users-permissions.permission').updateMany({
        where: {
          role: authenticatedRole.id,
          action: ['find', 'findOne', 'create', 'update', 'delete'],
          apiId: 'api::question.question'
        },
        data: { enabled: true }
      });

      console.log('✅ Question permissions set for Authenticated role');
    }

  } catch (error) {
    console.error('❌ Error setting up permissions:', error);
  }
}; 