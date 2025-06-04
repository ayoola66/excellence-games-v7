'use strict';

/**
 * question controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::question.question', ({ strapi }) => ({
  // Find questions with populated relations
  async find(ctx) {
    const { query } = ctx;

    const entity = await strapi.entityService.findMany('api::question.question', {
      ...query,
      populate: {
        game: {
          populate: ['thumbnail']
        },
        category: true
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // Find one question with populated relations
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.entityService.findOne('api::question.question', id, {
      ...query,
      populate: {
        game: {
          populate: ['thumbnail']
        },
        category: true
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // Create question with proper game and category linking
  async create(ctx) {
    const { data } = ctx.request.body;

    // Validate required fields
    if (!data.question || !data.option1 || !data.option2 || !data.option3 || !data.option4 || !data.correctAnswer) {
      return ctx.badRequest('Missing required question fields');
    }

    if (!data.game) {
      return ctx.badRequest('Game is required');
    }

    try {
      // Create the question
      const entity = await strapi.entityService.create('api::question.question', {
        data: {
          question: data.question,
          option1: data.option1,
          option2: data.option2,
          option3: data.option3,
          option4: data.option4,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation || '',
          game: data.game,
          category: data.category || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          sortOrder: data.sortOrder || 0
        },
        populate: {
          game: {
            populate: ['thumbnail']
          },
          category: true
        }
      });

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      console.error('Error creating question:', error);
      return ctx.badRequest('Failed to create question');
    }
  },

  // Update question
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    try {
      const entity = await strapi.entityService.update('api::question.question', id, {
        data,
        populate: {
          game: {
            populate: ['thumbnail']
          },
          category: true
        }
      });

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      console.error('Error updating question:', error);
      return ctx.badRequest('Failed to update question');
    }
  },

  // Delete question
  async delete(ctx) {
    const { id } = ctx.params;

    try {
      const entity = await strapi.entityService.delete('api::question.question', id);
      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      console.error('Error deleting question:', error);
      return ctx.badRequest('Failed to delete question');
    }
  }
})); 