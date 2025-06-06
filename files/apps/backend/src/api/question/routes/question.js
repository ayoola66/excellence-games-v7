'use strict';

/**
 * question router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::question.question', {
  config: {
    find: {
      policies: [],
      middlewares: []
    },
    findOne: {
      policies: [],
      middlewares: []
    },
    create: {
      policies: ['admin::isAuthenticatedAdmin']
    },
    update: {
      policies: ['admin::isAuthenticatedAdmin']
    },
    delete: {
      policies: ['admin::isAuthenticatedAdmin']
    }
  }
});