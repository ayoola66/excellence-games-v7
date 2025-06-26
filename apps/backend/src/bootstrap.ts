/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const createSuperadmin = require('../scripts/create-admin');

/**
 * Bootstrap function that runs when Strapi starts
 * @param {{ strapi: Strapi }} context
 */
export default async ({ strapi }) => {
  // Run the superadmin creation script
  await createSuperadmin.bootstrap({ strapi });
}; 