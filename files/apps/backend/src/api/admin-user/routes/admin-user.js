'use strict';

/**
 * admin-user router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/admin-users/login',
      handler: 'admin-user.login',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/admin-users/seed-admins',
      handler: 'admin-user.seedAdmins',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/admin-users/verify-session',
      handler: 'admin-user.verifySession',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/admin-users/dashboard',
      handler: 'admin-user.getDashboardData',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 