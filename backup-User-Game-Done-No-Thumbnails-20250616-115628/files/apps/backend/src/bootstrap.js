'use strict';

const { seedUsers } = require('../scripts/seed-users');

module.exports = async ({ strapi }) => {
  // Bootstrap phase
  if (strapi.config.get('environment') === 'development') {
    // Seed users in development environment
    await seedUsers(strapi);
  }
}; 