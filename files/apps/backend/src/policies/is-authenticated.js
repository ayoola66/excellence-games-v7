'use strict';

/**
 * `is-authenticated` policy
 */

module.exports = (policyContext, config, { strapi }) => {
  if (policyContext.state.user) {
    // if a session is open, user is authenticated
    return true;
  }

  return false;
}; 