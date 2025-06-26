'use strict';

/**
 * `populate` middleware
 * Middleware to populate relations for game queries
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Add populate for categories and their questions
    if (ctx.query.populate === undefined) {
      ctx.query.populate = {
        categories: {
          populate: {
            questions: true
          }
        }
      };
    }
    
    await next();
  };
}; 