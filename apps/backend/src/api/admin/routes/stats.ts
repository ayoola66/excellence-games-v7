export default {
  routes: [
    {
      method: 'GET',
      path: '/admin/stats',
      handler: 'stats.getStats',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
        auth: {
          scope: ['admin']
        }
      }
    }
  ]
} 