'use strict';

/**
 * category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::category.category', ({ strapi }) => ({
  // Delete all categories
  async deleteAll(ctx) {
    try {
      // Get all categories
      const categories = await strapi.entityService.findMany('api::category.category');
      
      // Delete each category individually to handle relations properly
      const deletedIds = [];
      for (const category of categories) {
        await strapi.entityService.delete('api::category.category', category.id);
        deletedIds.push(category.id);
      }

      console.log(`✅ Deleted ${deletedIds.length} categories`);
      
      return {
        success: true,
        message: `Successfully deleted ${deletedIds.length} categories`,
        deletedIds
      };
    } catch (error) {
      console.error('❌ Error deleting categories:', error);
      ctx.status = 500;
      return {
        success: false,
        message: 'Failed to delete categories',
        error: error.message
      };
    }
  }
})); 