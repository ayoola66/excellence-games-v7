'use strict';

/**
 * game router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// Create a custom router with additional routes
const customRouter = {
  routes: [
    {
      method: 'GET',
      path: '/games',
      handler: 'api::game.game.find',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/games/:id',
      handler: 'api::game.game.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/games',
      handler: 'api::game.game.create',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/games/:id',
      handler: 'api::game.game.update',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'DELETE',
      path: '/games/:id',
      handler: 'api::game.game.delete',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
};

module.exports = customRouter; 