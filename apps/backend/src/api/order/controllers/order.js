'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({

  // Create order with Stripe payment
  async create(ctx) {
    try {
      const { user } = ctx.state;
      const { 
        items, 
        shippingAddress, 
        billingAddress,
        paymentMethodId 
      } = ctx.request.body;

      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return ctx.badRequest('Items are required');
      }

      if (!paymentMethodId) {
        return ctx.badRequest('Payment method is required');
      }

      // Calculate pricing
      const pricingResponse = await strapi.controller('api::product.product').calculatePricing(ctx);
      const pricing = pricingResponse.data;

      // Generate order number
      const orderNumber = `EG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create order record first
      const order = await strapi.entityService.create('api::order.order', {
        data: {
          orderNumber,
          user: user.id,
          productDetails: pricing.items,
          subtotal: pricing.subtotal,
          shipping: pricing.shipping,
          tax: pricing.tax,
          total: pricing.total,
          currency: pricing.currency,
          status: 'pending',
          paymentStatus: 'pending',
          shippingAddress,
          billingAddress,
        }
      });

      // TODO: Integrate with Stripe
      // For now, simulate payment success
      console.log('🎯 Order created:', orderNumber);
      console.log('💳 Payment method:', paymentMethodId);
      console.log('💰 Total:', pricing.total, pricing.currency);

      // Simulate successful payment
      const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
        data: {
          paymentStatus: 'paid',
          status: 'processing',
          stripePaymentIntentId: `pi_demo_${Date.now()}`,
        }
      });

      // Grant premium access if applicable
      if (pricing.grantsPremiumAccess) {
        const premiumExpiry = new Date();
        premiumExpiry.setFullYear(premiumExpiry.getFullYear() + 1); // 1 year

        await strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
            subscriptionStatus: 'premium',
            premiumExpiry: premiumExpiry.toISOString(),
          }
        });

        await strapi.entityService.update('api::order.order', order.id, {
          data: {
            grantedPremiumAccess: true,
            premiumGrantedAt: new Date().toISOString(),
            premiumExpiresAt: premiumExpiry.toISOString(),
          }
        });

        console.log('🌟 Premium access granted until:', premiumExpiry);
      }

      return { 
        data: updatedOrder,
        message: pricing.grantsPremiumAccess 
          ? 'Order created successfully! Premium access granted for 1 year.'
          : 'Order created successfully!'
      };

    } catch (error) {
      console.error('Order creation error:', error);
      ctx.throw(500, 'Failed to create order');
    }
  },

  // Get user's orders
  async findUserOrders(ctx) {
    try {
      const { user } = ctx.state;
      
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: {
          user: user.id
        },
        populate: {
          products: {
            populate: {
              images: true
            }
          }
        },
        sort: ['createdAt:desc']
      });

      return { data: orders };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      ctx.throw(500, 'Failed to fetch orders');
    }
  },

  // Admin: Get all orders
  async find(ctx) {
    try {
      const { status, paymentStatus, search } = ctx.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (paymentStatus) filters.paymentStatus = paymentStatus;
      if (search) {
        filters.$or = [
          { orderNumber: { $containsi: search } },
          { 'user.email': { $containsi: search } },
          { 'user.fullName': { $containsi: search } }
        ];
      }

      const orders = await strapi.entityService.findMany('api::order.order', {
        filters,
        populate: {
          user: {
            fields: ['email', 'fullName']
          },
          products: {
            populate: {
              images: true
            }
          }
        },
        sort: ['createdAt:desc']
      });

      return { data: orders };
    } catch (error) {
      console.error('Error fetching orders:', error);
      ctx.throw(500, 'Failed to fetch orders');
    }
  },

  // Update order status
  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status, trackingNumber } = ctx.request.body;

      const updateData = { status };
      
      if (status === 'shipped' && trackingNumber) {
        updateData.trackingNumber = trackingNumber;
        updateData.shippedAt = new Date().toISOString();
      }
      
      if (status === 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      }

      const order = await strapi.entityService.update('api::order.order', id, {
        data: updateData
      });

      return { data: order };
    } catch (error) {
      console.error('Error updating order status:', error);
      ctx.throw(500, 'Failed to update order status');
    }
  }
})); 