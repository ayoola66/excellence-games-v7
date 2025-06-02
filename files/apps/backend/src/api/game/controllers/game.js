'use strict';

/**
 * game controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game.game', ({ strapi }) => ({
  // Custom create method with proper authentication bypass
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Create the game
      const game = await strapi.entityService.create('api::game.game', {
        data: {
          ...data,
          isActive: true,
          totalQuestions: 0,
        },
      });

      return { data: game };
    } catch (error) {
      console.error('Game creation error:', error);
      ctx.throw(500, 'Failed to create game');
    }
  },

  // Create nested game with categories
  async createNested(ctx) {
    try {
      const { 
        name, 
        description, 
        status = 'free', 
        categoryNames = [
          'General Knowledge',
          'Science & Nature', 
          'History',
          'Sports & Leisure',
          'Arts & Entertainment'
        ]
      } = ctx.request.body;

      if (!name) {
        return ctx.badRequest('Game name is required');
      }

      // Check if game already exists
      const existingGame = await strapi.entityService.findMany('api::game.game', {
        filters: { name },
        limit: 1,
      });

      if (existingGame?.length > 0) {
        return ctx.conflict('Game with this name already exists');
      }

      // Create the nested game
      const game = await strapi.entityService.create('api::game.game', {
        data: {
          name,
          description: description || `${name} - A nested trivia game with 5 categories plus a special card`,
          type: 'nested',
          status,
          isActive: true,
          totalQuestions: 0,
        },
      });

      // Create 5 regular categories + 1 special card
      const categories = [];
      
      // Create 5 regular categories (cards 1-5)
      for (let i = 0; i < 5; i++) {
        const category = await strapi.entityService.create('api::category.category', {
          data: {
            name: categoryNames[i] || `Category ${i + 1}`,
            description: `Questions for ${categoryNames[i] || `Category ${i + 1}`}`,
            difficulty: 'medium',
            questionCount: 0,
            status,
            game: game.id,
            cardNumber: i + 1,
            isActive: true,
            sortOrder: i,
          },
        });
        categories.push(category);
      }

      // Create special card 6 (no questions)
      const specialCard = await strapi.entityService.create('api::category.category', {
        data: {
          name: 'Special Card 6',
          description: 'Special card without questions - game completion bonus',
          difficulty: 'medium',
          questionCount: 0,
          status,
          game: game.id,
          cardNumber: 6,
          isActive: true,
          sortOrder: 5,
        },
      });
      categories.push(specialCard);

      // Return the game with its categories
      const gameWithCategories = await strapi.entityService.findOne('api::game.game', game.id, {
        populate: {
          categories: true,
        },
      });

      return {
        data: {
          game: gameWithCategories,
          message: `Nested game "${name}" created successfully with ${categories.length} categories`,
          categoriesCreated: categories.length,
        },
      };
    } catch (error) {
      console.error('Nested game creation error:', error);
      ctx.throw(500, 'Failed to create nested game');
    }
  },

  // Get games with user access control
  async find(ctx) {
    const { user } = ctx.state;
    const isAuthenticated = !!user;
    const isPremium = user?.subscriptionStatus === 'premium';

    // Build query based on user access
    const query = {
      filters: {
        isActive: true,
        ...(isAuthenticated && !isPremium ? { status: 'free' } : {}),
      },
      populate: {
        thumbnail: true,
        categories: {
          populate: {
            questions: {
              count: true,
            },
          },
        },
      },
      sort: ['sortOrder:asc', 'createdAt:desc'],
    };

    const { data, meta } = await strapi.entityService.findMany('api::game.game', query);

    // Add additional game info
    const gamesWithInfo = data.map(game => ({
      ...game,
      totalQuestions: game.categories?.reduce((total, cat) => total + (cat.questions?.length || 0), 0) || 0,
      accessType: isPremium ? 'full' : game.status === 'free' ? 'free' : 'locked',
    }));

    return { data: gamesWithInfo, meta };
  },

  // Get specific game with questions
  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const isPremium = user?.subscriptionStatus === 'premium';

    const game = await strapi.entityService.findOne('api::game.game', id, {
      populate: {
        thumbnail: true,
        categories: {
          populate: {
            questions: {
              populate: false, // Don't populate full question data initially
            },
          },
        },
      },
    });

    if (!game || !game.isActive) {
      return ctx.notFound('Game not found');
    }

    // Check user access
    if (game.status === 'premium' && !isPremium) {
      return ctx.forbidden('Premium subscription required');
    }

    return { data: game };
  },

  // Get questions for a specific category
  async getCategoryQuestions(ctx) {
    const { gameId, categoryId } = ctx.params;
    const { user } = ctx.state;
    const { excludeIds = [] } = ctx.query;

    try {
      // Verify game access
      const game = await strapi.entityService.findOne('api::game.game', gameId, {
        populate: { categories: true },
      });

      if (!game || !game.isActive) {
        return ctx.notFound('Game not found');
      }

      const isPremium = user?.subscriptionStatus === 'premium';
      if (game.status === 'premium' && !isPremium) {
        return ctx.forbidden('Premium subscription required');
      }

      // Get questions from category
      const questions = await strapi.entityService.findMany('api::question.question', {
        filters: {
          category: categoryId,
          game: gameId,
          isActive: true,
          id: { $notIn: excludeIds },
        },
        sort: ['sortOrder:asc'],
        limit: 1, // Return one question at a time
      });

      // Randomize question selection
      const randomQuestion = questions.data?.[Math.floor(Math.random() * questions.data.length)];

      if (!randomQuestion) {
        return ctx.notFound('No more questions available in this category');
      }

      // Track question usage
      await strapi.entityService.update('api::question.question', randomQuestion.id, {
        data: {
          timesAnswered: randomQuestion.timesAnswered + 1,
        },
      });

      return { data: randomQuestion };
    } catch (error) {
      ctx.throw(500, 'Error retrieving questions');
    }
  },

  // Submit answer and get feedback
  async submitAnswer(ctx) {
    const { questionId, selectedAnswer } = ctx.request.body;
    const { user } = ctx.state;

    try {
      const question = await strapi.entityService.findOne('api::question.question', questionId);

      if (!question) {
        return ctx.notFound('Question not found');
      }

      const isCorrect = question.correctAnswer === selectedAnswer;

      // Update question statistics
      if (isCorrect) {
        await strapi.entityService.update('api::question.question', questionId, {
          data: {
            timesCorrect: question.timesCorrect + 1,
          },
        });
      }

      // Update user progress if authenticated
      if (user) {
        const currentProgress = user.gameProgress || {};
        const gameId = question.game?.id;
        const categoryId = question.category?.id;

        if (gameId && categoryId) {
          if (!currentProgress[gameId]) {
            currentProgress[gameId] = {};
          }
          if (!currentProgress[gameId][categoryId]) {
            currentProgress[gameId][categoryId] = {
              answeredQuestions: [],
              correctAnswers: 0,
              totalAnswers: 0,
            };
          }

          currentProgress[gameId][categoryId].answeredQuestions.push(questionId);
          currentProgress[gameId][categoryId].totalAnswers++;
          if (isCorrect) {
            currentProgress[gameId][categoryId].correctAnswers++;
          }

          await strapi.entityService.update('plugin::users-permissions.user', user.id, {
            data: { gameProgress: currentProgress },
          });
        }
      }

      return {
        data: {
          correct: isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          selectedAnswer,
        },
      };
    } catch (error) {
      ctx.throw(500, 'Error submitting answer');
    }
  },
})); 