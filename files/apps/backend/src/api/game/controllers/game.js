'use strict';

/**
 * game controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game.game', ({ strapi }) => ({
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