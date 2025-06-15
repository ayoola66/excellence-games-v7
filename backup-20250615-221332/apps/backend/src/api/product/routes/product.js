'use strict';

/**
 * product router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::product.product', {
  config: {
    find: {
      auth: false,
      middlewares: [],
    },
    findOne: {
      auth: false,
      middlewares: [],
    },
    create: {
      auth: false,
    },
    update: {
      auth: false,
    },
    delete: {
      auth: false,
    },
  },
});

module.exports = defaultRouter; 