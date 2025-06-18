'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/api/admin/users',
      handler: 'user.findAll',
      config: {
        policies: ['admin-only'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/users/:id',
      handler: 'user.findOne',
      config: {
        policies: ['admin-only'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/users',
      handler: 'user.create',
      config: {
        policies: ['admin-only'],
      },
    },
    {
      method: 'PUT',
      path: '/api/admin/users/:id',
      handler: 'user.update',
      config: {
        policies: ['admin-only'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/users/:id',
      handler: 'user.delete',
      config: {
        policies: ['admin-only'],
      },
    },
    {
      method: 'POST',
      path: '/admin/users/sync-subscription-statuses',
      handler: 'user.syncSubscriptionStatuses',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
        description: 'Synchronize all users\' subscription statuses based on premium expiry dates',
        tag: {
          plugin: 'users-permissions',
          name: 'User'
        }
      }
    }
  ],
} 