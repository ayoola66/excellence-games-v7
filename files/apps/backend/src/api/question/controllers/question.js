'use strict';

/**
 * question controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::question.question', ({ strapi }) => ({
  // Find questions with populated relations
  async find(ctx) {
    // Temporary: Allow public access for debugging
    ctx.state.user = ctx.state.user || { id: 'public' };
    
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
    // Temporary: Allow public access for debugging
    ctx.state.user = ctx.state.user || { id: 'public' };
    
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

  // Create question with enhanced logic
  async create(ctx) {
    const { data } = ctx.request.body;

    const entity = await strapi.entityService.create('api::question.question', {
      data: {
        ...data,
        isActive: true
      },
      populate: {
        game: {
          populate: ['thumbnail']
        },
        category: true
      }
    });

    // Update category question count if category is provided
    if (data.category) {
      await this.updateCategoryQuestionCount(data.category);
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // Update question
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

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
  },

  // Delete question
  async delete(ctx) {
    const { id } = ctx.params;

    // Get question to find its category before deletion
    const question = await strapi.entityService.findOne('api::question.question', id, {
      populate: ['category']
    });

    const entity = await strapi.entityService.delete('api::question.question', id);

    // Update category question count if category exists
    if (question?.category?.id) {
      await this.updateCategoryQuestionCount(question.category.id);
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // Helper method to update category question count
  async updateCategoryQuestionCount(categoryId) {
    try {
      const questionCount = await strapi.entityService.count('api::question.question', {
        filters: { category: categoryId }
      });

      await strapi.entityService.update('api::category.category', categoryId, {
        data: { questionCount }
      });
    } catch (error) {
      console.error('Error updating category question count:', error);
    }
  },

  async bulkImport(ctx) {
    const { gameId, questions } = ctx.request.body;
    if (!gameId || !Array.isArray(questions)) {
      return ctx.badRequest('gameId and questions array required');
    }
    const created = [];
    for (const q of questions.slice(0, 1000)) {
      try {
        const entity = await strapi.entityService.create('api::question.question', {
          data: {
            question: q.question,
            option1: q.option1,
            option2: q.option2,
            option3: q.option3,
            option4: q.option4,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            game: gameId,
            category: q.category || null,
            isActive: true,
            publishedAt: new Date(),
          }
        });
        created.push(entity.id);
        if (q.category) await this.updateCategoryQuestionCount(q.category);
      } catch (e) {
        console.error('Bulk import error on question', q.question, e.message);
      }
    }
    ctx.body = {
      imported: created.length,
      gameId,
      questionIds: created
    };
  },

  async importCsv(ctx) {
    const { files, fields } = ctx.request;
    const gameId = fields?.gameId || ctx.request.body?.gameId;
    const categoryId = fields?.categoryId || ctx.request.body?.categoryId;
    
    // Add robust error handling for missing gameId
    if (!gameId) {
      return ctx.badRequest('gameId is required for CSV import');
    }
    
    if (!files || !files.csvFile) {
      return ctx.badRequest('csvFile required');
    }
    
    // Get the game to verify it's a straight/linear game
    const game = await strapi.entityService.findOne('api::game.game', gameId);
    
    if (!game) {
      return ctx.notFound('Game not found');
    }
    
    if (game.type !== 'linear') {
      return ctx.badRequest('CSV import is only supported for linear/straight games. For nested games, use XLSX import.');
    }
    
    const csvFile = files.csvFile;
    const { parse } = require('fast-csv');
    const fs = require('fs');
    const questions = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFile.path)
        .pipe(parse({ headers: true, ignoreEmpty: true }))
        .on('error', reject)
        .on('data', row => questions.push(row))
        .on('end', resolve);
    });
    
    ctx.request.body = { 
      gameId, 
      questions: questions.map(r => ({
        question: r.Text || r.Question || r.question,
        option1: r.Option1 || r.A || r.option1,
        option2: r.Option2 || r.B || r.option2,
        option3: r.Option3 || r.C || r.option3,
        option4: r.Option4 || r.D || r.option4,
        correctAnswer: (r.CorrectOption || r.correctAnswer || 'option1').toLowerCase(),
        category: categoryId,
      }))
    };
    
    await this.bulkImport(ctx);

    // After import, update the parent game's total question count
    if (gameId) {
      try {
        const questionCount = await strapi.db.query('api::question.question').count({
          where: { game: gameId },
        });
        await strapi.entityService.update('api::game.game', gameId, {
          data: { totalQuestions: questionCount },
        });
        console.log(`✅ Game ${gameId} question count updated to ${questionCount}`);
      } catch (error) {
        console.error(`⚠️ Failed to update question count for game ${gameId}:`, error);
      }
    }
  },

  async importXlsx(ctx) {
    try {
      const { files, body } = ctx.request;
      const gameId = body?.gameId;
      
      if (!gameId) {
        return ctx.badRequest('gameId is required for XLSX import');
      }
      
      if (!files || !files.xlsxFile) {
        return ctx.badRequest('xlsxFile required');
      }

      // Get the game to verify it's a nested game
      const game = await strapi.entityService.findOne('api::game.game', gameId, {
        populate: { categories: true },
      });

      if (!game) {
        return ctx.notFound('Game not found');
      }

      if (game.type !== 'nested') {
        return ctx.badRequest('XLSX import is only supported for nested games. For linear/straight games, use CSV import.');
      }

      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(files.xlsxFile.path);
      
      // Validate workbook has exactly 5 sheets
      if (workbook.SheetNames.length !== 5) {
        return ctx.badRequest('XLSX file must have exactly 5 sheets, one for each category');
      }

      // Create or update categories based on sheet names
      let categories = [];
      for (let i = 0; i < 5; i++) {
        const sheetName = workbook.SheetNames[i];
        // Try to find existing category for this card number
        let category = game.categories.find(c => c.cardNumber === i + 1);
        
        if (!category) {
          // Create new category if it doesn't exist
          category = await strapi.entityService.create('api::category.category', {
            data: {
              name: sheetName,
              cardNumber: i + 1,
              game: gameId,
              isActive: true,
              status: game.status, // Match game's status (free/premium)
              questionCount: 0,
              sortOrder: i,
              publishedAt: new Date()
            }
          });
        } else {
          // Update existing category name if different
          if (category.name !== sheetName) {
            category = await strapi.entityService.update('api::category.category', category.id, {
              data: { name: sheetName }
            });
          }
        }
        categories.push(category);
      }

      let totalImported = 0;
      const importedByCategory = {};

      // Process each sheet
      for (let i = 0; i < 5; i++) {
        const sheet = workbook.Sheets[workbook.SheetNames[i]];
        const questions = XLSX.utils.sheet_to_json(sheet);
        
        if (!Array.isArray(questions) || questions.length === 0) {
          continue; // Skip empty sheets
        }

        // Map questions to our format and import them
        const formattedQuestions = questions.map(q => ({
          question: q.Text || q.Question || q['Question Text'],
          option1: q.Option1 || q['Option A'] || q.A,
          option2: q.Option2 || q['Option B'] || q.B,
          option3: q.Option3 || q['Option C'] || q.C,
          option4: q.Option4 || q['Option D'] || q.D,
          correctAnswer: this.normalizeCorrectAnswer(q.CorrectOption || q['Correct Answer'] || q.correctAnswer),
          category: categories[i].id,
          game: gameId,
          isActive: true,
          sortOrder: 0,
          publishedAt: new Date(),
        }));

        // Import questions for this category
        const imported = await this.importQuestionsForCategory(formattedQuestions);
        totalImported += imported.length;
        importedByCategory[categories[i].name] = imported.length;

        // Update category question count
        await this.updateCategoryQuestionCount(categories[i].id);
      }

      // Update game's total question count
      const totalQuestions = await strapi.db.query('api::question.question').count({
        where: { game: gameId },
      });
      await strapi.entityService.update('api::game.game', gameId, {
        data: { totalQuestions },
      });

      return {
        data: {
          totalImported,
          importedByCategory,
          gameId,
          message: `Successfully imported ${totalImported} questions across ${Object.keys(importedByCategory).length} categories`,
        },
      };
    } catch (error) {
      console.error('XLSX import error:', error);
      return ctx.throw(500, error.message || 'Failed to import XLSX file');
    }
  },

  // Helper to normalize correct answer format
  normalizeCorrectAnswer(value) {
    if (!value) return 'option1';
    
    const normalized = value.toString().toLowerCase().trim();
    
    // Handle different formats
    if (normalized.startsWith('option')) {
      return normalized;
    }
    
    if (['a', 'b', 'c', 'd'].includes(normalized)) {
      return `option${['a', 'b', 'c', 'd'].indexOf(normalized) + 1}`;
    }
    
    if (['1', '2', '3', '4'].includes(normalized)) {
      return `option${normalized}`;
    }
    
    // Default to option1 if format is unrecognized
    return 'option1';
  },

  // Helper to import questions for a category
  async importQuestionsForCategory(questions) {
    const imported = [];
    
    for (const question of questions) {
      try {
        const entity = await strapi.entityService.create('api::question.question', {
          data: question,
        });
        imported.push(entity);
      } catch (error) {
        console.error('Failed to import question:', error);
      }
    }
    
    return imported;
  },

  // Helper to update category question count
  async updateCategoryQuestionCount(categoryId) {
    const count = await strapi.db.query('api::question.question').count({
      where: { category: categoryId },
    });
    await strapi.entityService.update('api::category.category', categoryId, {
      data: { questionCount: count },
    });
  },
})); 