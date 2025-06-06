'use strict'

/**
 * user-permissions router.
 * We only define custom routes here.
 * The standard REST routes are handled by the users-permissions plugin.
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/users/seed-demo-users',
      handler: 'user.seedDemoUsers',
      config: {
        auth: false, // Ensure this is appropriate for production
      }
    }
  ]
} 