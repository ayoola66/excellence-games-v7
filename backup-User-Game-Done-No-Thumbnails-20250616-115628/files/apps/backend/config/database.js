module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'elitegames_dev'),
      user: env('DATABASE_USERNAME', 'elitegames'),
      password: env('DATABASE_PASSWORD', 'elitegames123'),
      ssl: env.bool('DATABASE_SSL', false),
      schema: env('DATABASE_SCHEMA', 'public')
    },
    debug: false,
    acquireConnectionTimeout: 60000,
    pool: {
      min: 0,
      max: 10,
      idleTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000
    }
  }
});

// Note: To fix 403 permissions, we need to configure content type permissions
// This can be done through the Strapi admin panel or programmatically 