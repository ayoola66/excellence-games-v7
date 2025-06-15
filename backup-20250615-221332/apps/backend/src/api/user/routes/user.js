'use strict'

/**
 * user-permissions router.
 * We only define custom routes here.
 * The standard REST routes are handled by the users-permissions plugin.
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/users/me',
      handler: 'user.me',
      config: {
        policies: ['global::is-authenticated']
      }
    },
    {
      method: 'POST',
      path: '/users/games/:id/favorite',
      handler: 'user.toggleFavorite',
      config: {
        policies: ['global::is-authenticated']
      }
    },
    {
      method: 'POST',
      path: '/users/games/:id/recent',
      handler: 'user.updateRecentGames',
      config: {
        policies: ['global::is-authenticated']
      }
    },
    {
      method: 'PUT',
      path: '/users/settings',
      handler: 'user.updateSettings',
      config: {
        policies: ['global::is-authenticated']
      }
    },
    {
      method: 'PUT',
      path: '/users/billing',
      handler: 'user.updateBillingInfo',
      config: {
        policies: ['global::is-authenticated']
      }
    },
    {
      method: 'POST',
      path: '/users/music',
      handler: 'user.uploadMusicTrack',
      config: {
        policies: ['global::is-authenticated']
      }
    },
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