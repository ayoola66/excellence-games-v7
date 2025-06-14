'use strict';

/**
 * game router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::game.game');

// Export the default router
module.exports = defaultRouter; 