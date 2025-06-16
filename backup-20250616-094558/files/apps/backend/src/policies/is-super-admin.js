'use strict';

/**
 * `is-super-admin` policy
 */

module.exports = (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }

  // Verify the user is a super admin
  return strapi.query('api::admin-user.admin-user')
    .findOne({ where: { email: user.email, adminType: 'SA', isActive: true } })
    .then(adminUser => !!adminUser)
    .catch(() => false);
}; 