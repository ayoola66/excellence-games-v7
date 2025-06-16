module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      jwtSecret: env('JWT_SECRET', 'your-jwt-secret'),
      register: {
        allowedFields: [
          'username',
          'email',
          'password',
          'subscriptionStatus',
          'premiumExpiry',
          'fullName',
          'phone',
          'address'
        ],
      },
    },
  },
}); 