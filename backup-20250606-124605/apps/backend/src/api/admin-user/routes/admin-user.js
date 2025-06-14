'use strict';

/**
 * admin-user router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Core CRUD endpoints (leave auth to default roles-permissions)
    {
      method: 'GET',
      path: '/admin-users',
      handler: 'admin-user.find',
      type: 'content-api',
    },
    {
      method: 'GET',
      path: '/admin-users/:id',
      handler: 'admin-user.findOne',
      type: 'content-api',
    },
    {
      method: 'POST',
      path: '/admin-users',
      handler: 'admin-user.create',
      type: 'content-api',
    },
    {
      method: 'PUT',
      path: '/admin-users/:id',
      handler: 'admin-user.update',
      type: 'content-api',
    },
    {
      method: 'DELETE',
      path: '/admin-users/:id',
      handler: 'admin-user.delete',
      type: 'content-api',
    },

    // Custom utility endpoints (no auth)
    {
      method: 'POST',
      path: '/admin-users/seed-admins',
      handler: 'admin-user.seedAdmins',
      config: { auth: false },
      type: 'content-api',
    },
    {
      method: 'POST',
      path: '/admin-users/seed-demo-users',
      handler: 'admin-user.seedDemoUsers',
      config: { auth: false },
      type: 'content-api',
    },
    {
      method: 'POST',
      path: '/admin-users/login',
      handler: 'admin-user.login',
      config: { auth: false },
      type: 'content-api',
    },
    {
      method: 'POST',
      path: '/admin-users/verify-session',
      handler: 'admin-user.verifySession',
      config: { auth: false },
      type: 'content-api',
    },
  ],
}; 