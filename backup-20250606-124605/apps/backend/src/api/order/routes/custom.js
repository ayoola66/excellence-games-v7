'use strict';

/**
 * Custom order routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/orders/my-orders',
      handler: 'order.findUserOrders',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/orders/:id/status',
      handler: 'order.updateStatus',
      config: {
        auth: false,
      },
    },
  ],
}; 