'use strict';

/**
 * Policy to restrict Setting access to admin users only
 */
module.exports = async (policyContext, config, { strapi }) => {
  if (policyContext.state.user?.role?.name === 'Administrator') {
    return true;
  }

  return false;
};
