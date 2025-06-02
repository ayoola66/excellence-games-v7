'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
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
    // Demo data initialization has been disabled to prevent database issues
    // If you need to re-enable demo data, uncomment the lines below:
    // if (process.env.NODE_ENV === 'development') {
    //   await initializeDemoData(strapi);
    // }
    console.log('🚀 Strapi bootstrap completed - Demo data initialization disabled');
  },
};

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