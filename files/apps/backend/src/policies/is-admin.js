'use strict';

/**
 * `is-admin` policy
 */

module.exports = (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }

  // Verify the user exists in admin-user collection
  return strapi.query('api::admin-user.admin-user')
    .findOne({ where: { email: user.email, isActive: true } })
    .then(adminUser => !!adminUser)
    .catch(() => false);
}; 