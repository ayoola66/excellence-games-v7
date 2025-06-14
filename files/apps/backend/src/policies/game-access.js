'use strict';

/**
 * `game-access` policy
 */

module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  // Check if user is authenticated
  if (!user) {
    return false;
  }

  // For find and findOne operations, allow access
  const { action } = policyContext;
  if (['find', 'findOne'].includes(action)) {
    return true;
  }

  // For other operations (create, update, delete), check if user is admin
  const adminUser = await strapi.query('api::admin-user.admin-user')
    .findOne({ where: { email: user.email, isActive: true } });

  return !!adminUser;
}; 