'use strict';

const createSuperadmin = require('../../scripts/create-superadmin');

module.exports = async ({ strapi }) => {
  // Run the superadmin creation script
  await createSuperadmin.bootstrap({ strapi });
}; 