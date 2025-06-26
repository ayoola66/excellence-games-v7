'use strict';

module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  
  if (!user) {
    return false;
  }

  // Check if user exists in admin-user collection
  const adminUser = await strapi.db.query('api::admin-user.admin-user').findOne({
    where: { email: user.email, isActive: true },
  });

  return !!adminUser;
}; 