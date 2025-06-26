'use strict';

/**
 * product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  
  // Get products with filtering and sorting
  async find(ctx) {
    try {
      const { 
        type, 
        category, 
        featured, 
        inStock,
        priceMin,
        priceMax,
        search,
        sort = 'sortOrder:asc'
      } = ctx.query;

      const filters = {
        isActive: true
      };

      // Add filters
      if (type) filters.type = type;
      if (category) filters.category = category;
      if (featured) filters.isFeatured = featured === 'true';
      if (inStock === 'true') filters.stock = { $gt: 0 };
      if (priceMin) filters.price = { $gte: parseFloat(priceMin) };
      if (priceMax) {
        filters.price = filters.price || {};
        filters.price.$lte = parseFloat(priceMax);
      }
      if (search) {
        filters.$or = [
          { name: { $containsi: search } },
          { shortDescription: { $containsi: search } },
          { category: { $containsi: search } }
        ];
      }

      const products = await strapi.entityService.findMany('api::product.product', {
        filters,
        populate: {
          images: true
        },
        sort: [sort]
      });

      return { data: products };
    } catch (error) {
      console.error('Error fetching products:', error);
      ctx.throw(500, 'Failed to fetch products');
    }
  },

  // Get featured products
  async getFeatured(ctx) {
    try {
      const products = await strapi.entityService.findMany('api::product.product', {
        filters: {
          isActive: true,
          isFeatured: true
        },
        populate: {
          images: true
        },
        sort: ['sortOrder:asc'],
        limit: 6
      });

      return { data: products };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      ctx.throw(500, 'Failed to fetch featured products');
    }
  },

  // Get product categories
  async getCategories(ctx) {
    try {
      const products = await strapi.entityService.findMany('api::product.product', {
        filters: {
          isActive: true
        },
        fields: ['category']
      });

      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
      
      return { data: categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      ctx.throw(500, 'Failed to fetch categories');
    }
  },

  // Calculate dynamic pricing based on cart contents
  async calculatePricing(ctx) {
    try {
      const { items } = ctx.request.body;
      
      if (!items || !Array.isArray(items)) {
        return ctx.badRequest('Items array is required');
      }

      let boardGameCount = 0;
      let subtotal = 0;
      const pricedItems = [];

      // Get shop settings
      const shopSettings = await strapi.entityService.findMany('api::shop-setting.shop-setting');
      const settings = shopSettings || {};
      const firstBoardPrice = settings.firstBoardGamePrice || 40.00;
      const additionalBoardPrice = settings.additionalBoardGamePrice || 25.00;

      for (const item of items) {
        const product = await strapi.entityService.findOne('api::product.product', item.productId);
        
        if (!product || !product.isActive) {
          return ctx.badRequest(`Product ${item.productId} not found or inactive`);
        }

        let itemPrice = product.salePrice || product.price;
        
        // Apply dynamic pricing for board games
        if (product.type === 'board_game') {
          if (boardGameCount === 0) {
            itemPrice = firstBoardPrice;
          } else {
            itemPrice = additionalBoardPrice;
          }
          boardGameCount++;
        }

        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;

        pricedItems.push({
          productId: item.productId,
          product: product,
          quantity: item.quantity,
          unitPrice: itemPrice,
          total: itemTotal
        });
      }

      // Calculate shipping
      const freeShippingThreshold = settings.freeShippingThreshold || 50.00;
      const standardShipping = settings.standardShippingCost || 5.99;
      const shipping = subtotal >= freeShippingThreshold ? 0 : standardShipping;

      // Calculate tax
      const taxRate = settings.taxRate || 0.20;
      const tax = (subtotal + shipping) * taxRate;

      const total = subtotal + shipping + tax;

      return {
        data: {
          items: pricedItems,
          subtotal,
          shipping,
          tax,
          total,
          currency: settings.currency || 'GBP',
          boardGameCount,
          grantsPremiumAccess: boardGameCount > 0
        }
      };
    } catch (error) {
      console.error('Error calculating pricing:', error);
      ctx.throw(500, 'Failed to calculate pricing');
    }
  }
})); 