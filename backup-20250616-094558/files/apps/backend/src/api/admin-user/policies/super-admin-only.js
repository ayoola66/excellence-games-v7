'use strict';

module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  
  if (!user) {
    return false;
  }

  // Check if user is a super admin
  const adminUser = await strapi.db.query('api::admin-user.admin-user').findOne({
    where: { email: user.email, adminType: 'SA', isActive: true },
  });

  return !!adminUser;
}; 