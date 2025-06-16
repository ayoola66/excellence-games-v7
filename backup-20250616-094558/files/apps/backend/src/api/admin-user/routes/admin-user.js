'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Core CRUD endpoints
    {
      method: 'GET',
      path: '/admin-user-profiles',
      handler: 'admin-user.find',
      config: {
        policies: ['admin-only'],
      },
    },
    {
      method: 'GET',
      path: '/admin-user-profiles/:id',
      handler: 'admin-user.findOne',
      config: {
        policies: ['admin-only'],
      },
    },
    {
      method: 'POST',
      path: '/admin-user-profiles',
      handler: 'admin-user.create',
      config: {
        policies: ['super-admin-only'],
      },
    },
    {
      method: 'PUT',
      path: '/admin-user-profiles/:id',
      handler: 'admin-user.update',
      config: {
        policies: ['admin-only'],
      },
    },
    {
      method: 'DELETE',
      path: '/admin-user-profiles/:id',
      handler: 'admin-user.delete',
      config: {
        policies: ['super-admin-only'],
      },
    },

    // Auth endpoints (no auth required)
    {
      method: 'POST',
      path: '/admin-user-profiles/login',
      handler: 'admin-user.login',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/admin-user-profiles/verify-session',
      handler: 'admin-user.verifySession',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
}; 