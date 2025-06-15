module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', ['default-key-1', 'default-key-2']),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  settings: {
    cors: {
      enabled: true,
      headers: ['*'],
      origin: ['http://localhost:3000', 'https://your-frontend-domain.com']
    },
    rateLimit: {
      enabled: true,
      max: 100, // requests per minute
      duration: 60000, // 1 minute
    }
  }
}); 