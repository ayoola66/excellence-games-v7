'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Bootstrapping Elite Games Backend...');
    
    try {
      // Set up permissions for question content type
      await setupPermissions(strapi);
      console.log('✅ Bootstrap completed successfully');
    } catch (error) {
      console.error('❌ Bootstrap error:', error);
    }
  },
};

async function setupPermissions(strapi) {
  // Set permissions for Public role (read-only)
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { name: 'Public' }
  });

  if (publicRole) {
    // Enable find and findOne for questions
    const questionPermissions = await strapi.query('plugin::users-permissions.permission').findMany({
      where: {
        role: publicRole.id,
        apiId: 'api::question.question'
      }
    });

    for (const permission of questionPermissions) {
      if (permission.action === 'find' || permission.action === 'findOne') {
        await strapi.query('plugin::users-permissions.permission').update({
          where: { id: permission.id },
          data: { enabled: true }
        });
      }
    }

    console.log('✅ Question permissions set for Public role');
  }

  // Set permissions for Authenticated role (full access)
  const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { name: 'Authenticated' }
  });

  if (authenticatedRole) {
    const questionPermissions = await strapi.query('plugin::users-permissions.permission').findMany({
      where: {
        role: authenticatedRole.id,
        apiId: 'api::question.question'
      }
    });

    for (const permission of questionPermissions) {
      await strapi.query('plugin::users-permissions.permission').update({
        where: { id: permission.id },
        data: { enabled: true }
      });
    }

    console.log('✅ Question permissions set for Authenticated role');
  }
}

// Demo data function commented out to prevent automatic seeding
/*
async function initializeDemoData(strapi) {
  try {
    console.log('🌱 Initializing demo data...');

    // Create demo games
    const games = [
      {
        name: 'General Knowledge Challenge',
        description: 'Test your knowledge across various topics with this comprehensive trivia game.',
        type: 'straight',
        status: 'free',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Sports Spectacular',
        description: 'Challenge yourself with questions about various sports and athletic achievements.',
        type: 'nested',
        status: 'premium',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Science & Technology',
        description: 'Explore the fascinating world of science and modern technology.',
        type: 'straight',
        status: 'free',
        isActive: true,
        sortOrder: 3,
      },
    ];

    for (const gameData of games) {
      const existingGame = await strapi.entityService.findMany('api::game.game', {
        filters: { name: gameData.name },
      });

      if (!existingGame.data.length) {
        await strapi.entityService.create('api::game.game', {
          data: gameData,
        });
        console.log(`✅ Created game: ${gameData.name}`);
      }
    }

    // Initialize admin users
    await strapi.controller('api::admin-user.admin-user').seedAdmins({});

    console.log('🎉 Demo data initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing demo data:', error);
  }
}
*/ 