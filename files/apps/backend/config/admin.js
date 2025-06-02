module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'Zv+O3pON0liaFXfKl89z+w=='),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'Zv+O3pON0liaFXfKl89z+w=='),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'Zv+O3pON0liaFXfKl89z+w=='),
    },
  },
}); 