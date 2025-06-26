'use strict';

/**
 * Custom product routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/products/featured',
      handler: 'product.getFeatured',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/products/categories',
      handler: 'product.getCategories',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/products/calculate-pricing',
      handler: 'product.calculatePricing',
      config: {
        auth: false,
      },
    },
  ],
}; 