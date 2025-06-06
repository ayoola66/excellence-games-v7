module.exports = ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'sqlite'),
    connection: env('DATABASE_CLIENT', 'sqlite') === 'sqlite' 
      ? {
          filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        }
      : {
          host: env('DATABASE_HOST', 'localhost'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'elitegames_dev'),
          user: env('DATABASE_USERNAME', 'elitegames'),
          password: env('DATABASE_PASSWORD', 'elitegames123'),
          ssl: env.bool('DATABASE_SSL', false),
        },
    useNullAsDefault: true,
    acquireConnectionTimeout: 60000,
    pool: {
      min: 2,
      max: 10
    }
  },
});

// Note: To fix 403 permissions, we need to configure content type permissions
// This can be done through the Strapi admin panel or programmatically 