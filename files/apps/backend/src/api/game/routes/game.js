'use strict';

/**
 * game router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::game.game', {
  config: {
    find: {
      middlewares: ['api::game.populate'],
    },
    findOne: {
      middlewares: ['api::game.populate'],
    },
  },
}); 