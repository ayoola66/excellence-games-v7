'use strict';

/**
 * game controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game.game', ({ strapi }) => ({
  // Custom create method with proper authentication bypass
  async create(ctx) {
    try {
      console.log('=== GAME CREATION REQUEST ===');
      console.log('Request method:', ctx.request.method);
      console.log('Request URL:', ctx.request.url);
      console.log('Content-Type:', ctx.request.headers['content-type']);
      console.log('Raw body keys:', Object.keys(ctx.request.body || {}));
      
      let gameData;
      
      // Handle different content types
      if (ctx.request.body.data) {
        // Either FormData with JSON data or regular JSON
        if (typeof ctx.request.body.data === 'string') {
          // FormData - parse JSON string
          console.log('Parsing FormData JSON string');
          gameData = JSON.parse(ctx.request.body.data);
        } else {
          // Regular JSON
          console.log('Using regular JSON data');
          gameData = ctx.request.body.data;
        }
      } else {
        // Direct JSON body
        console.log('Using direct JSON body');
        gameData = ctx.request.body;
      }
      
      console.log('Processed game data:', gameData);
      
      // Validate required fields
      if (!gameData.name) {
        console.log('ERROR: Game name is missing');
        return ctx.badRequest('Game name is required');
      }
      
      // Check if game already exists (same name AND type)
      const existingGame = await strapi.entityService.findMany('api::game.game', {
        filters: { 
          name: gameData.name,
          type: gameData.type
        },
        limit: 1,
      });

      if (existingGame?.length > 0) {
        return ctx.badRequest(`A ${gameData.type} game with the name "${gameData.name}" already exists. Please choose a different name.`);
      }
      
      // Create the game
      console.log('Creating game in database...');
      const game = await strapi.entityService.create('api::game.game', {
        data: {
          ...gameData,
          isActive: true,
          totalQuestions: 0,
        },
      });

      console.log('✅ Game created successfully with ID:', game.id);
      console.log('=== END GAME CREATION ===');
      return { data: game };
    } catch (error) {
      console.error('❌ Game creation error:', error);
      console.error('Error stack:', error.stack);
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

      // Check if nested game already exists
      console.log('🔍 Checking for existing nested game with name:', name);
      const allGamesWithName = await strapi.entityService.findMany('api::game.game', {
        filters: { 
          name
        },
      });
      console.log('🔍 Found all games with this name:', allGamesWithName);
      
      const existingNestedGames = allGamesWithName.filter(game => game.type === 'nested');
      console.log('🔍 Found existing nested games:', existingNestedGames);

      if (existingNestedGames?.length > 0) {
        console.log('❌ Nested game already exists with this name');
        return ctx.badRequest(`A nested game with the name "${name}" already exists. Please choose a different name.`);
      }
      console.log('✅ No existing nested game found, proceeding with creation');

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
      
      // Handle specific validation errors
      if (error.message?.includes('unique')) {
        return ctx.badRequest('A nested game with this name already exists. Please choose a different name.');
      }
      
      ctx.throw(500, 'Failed to create nested game');
    }
  },

  // Find games with populated relations and question counts
  async find(ctx) {
    try {
      console.log('🎯 Finding games with populated relations and question counts');

      // Get games with populated relations
      const games = await strapi.entityService.findMany('api::game.game', {
        ...ctx.query,
        populate: {
          thumbnail: true,
          categories: true,
          ...ctx.query.populate,
        },
      });

      // Add question counts for each game
      if (games && Array.isArray(games)) {
        const gamesWithCounts = await Promise.all(
          games.map(async (game) => {
            try {
              const questionCount = await strapi.db.query('api::question.question').count({
                where: { game: game.id },
              });
              
              return {
                ...game,
                totalQuestions: questionCount,
              };
            } catch (error) {
              console.error(`Error getting question count for game ${game.id}:`, error);
              // Return game without modifying question count if there's an error
              return game;
            }
          })
        );
        
        return { data: gamesWithCounts };
      }
      
      // Return empty array if no games found
      return { data: [] };
    } catch (error) {
      console.error('Error in game find method:', error);
      return ctx.throw(500, 'Failed to fetch games');
    }
  },

  // Get specific game with questions
  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const isPremium = user?.subscriptionStatus === 'premium';

    try {
      // Get the game with its categories and questions
      const game = await strapi.entityService.findOne('api::game.game', id, {
        populate: {
          thumbnail: true,
          categories: {
            populate: {
              questions: {
                populate: false,
              },
            },
          },
        },
      });

      if (!game) {
        return ctx.notFound('Game not found');
      }

      // Check if user has access to the game
      if (game.status === 'premium' && !isPremium) {
        return ctx.forbidden('This game requires a premium subscription');
      }

      // Get or initialize user's game progress
      let gameProgress = {};
      if (user) {
        const userData = await strapi.entityService.findOne('api::user.user', user.id, {});
        gameProgress = userData.gameStats?.[game.id] || {
          started: false,
          completed: false,
          currentCategory: null,
          categoriesCompleted: {},
          score: 0,
          lastPlayed: null,
        };
      }

      return {
        data: {
          ...game,
          userProgress: gameProgress
        }
      };
    } catch (error) {
      console.error('Error fetching game:', error);
      return ctx.throw(500, 'Failed to fetch game');
    }
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

  // Submit answer and track progress
  async submitAnswer(ctx) {
    const { gameId, categoryId, questionId, answer } = ctx.request.body;
    const { user } = ctx.state;

    if (!user) {
      return ctx.unauthorized('You must be logged in to submit answers');
    }

    try {
      // Get the question
      const question = await strapi.entityService.findOne('api::question.question', questionId, {
        populate: ['game', 'category'],
      });

      if (!question) {
        return ctx.notFound('Question not found');
      }

      // Verify question belongs to the right game and category
      if (question.game.id !== parseInt(gameId) || question.category.id !== parseInt(categoryId)) {
        return ctx.badRequest('Invalid game or category ID');
      }

      // Check if answer is correct
      const isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();

      // Get current user data
      const userData = await strapi.entityService.findOne('api::user.user', user.id, {});
      
      // Initialize or get game progress
      const gameStats = userData.gameStats || {};
      const gameProgress = gameStats[gameId] || {
        started: true,
        completed: false,
        currentCategory: categoryId,
        categoriesCompleted: {},
        score: 0,
        lastPlayed: new Date().toISOString(),
      };

      // Initialize category progress if not exists
      if (!gameProgress.categoriesCompleted[categoryId]) {
        gameProgress.categoriesCompleted[categoryId] = {
          completed: false,
          questionsAnswered: {},
          score: 0,
        };
      }

      // Update question progress
      gameProgress.categoriesCompleted[categoryId].questionsAnswered[questionId] = {
        answered: true,
        correct: isCorrect,
        timestamp: new Date().toISOString(),
      };

      // Update scores
      if (isCorrect) {
        gameProgress.score += 10;
        gameProgress.categoriesCompleted[categoryId].score += 10;
      }

      // Check if category is completed
      const categoryQuestions = await strapi.db.query('api::question.question').count({
        where: { category: categoryId },
      });

      const answeredQuestions = Object.keys(gameProgress.categoriesCompleted[categoryId].questionsAnswered).length;
      gameProgress.categoriesCompleted[categoryId].completed = answeredQuestions >= categoryQuestions;

      // Check if game is completed
      const allCategories = await strapi.entityService.findMany('api::category.category', {
        filters: { game: gameId },
      });

      const completedCategories = Object.values(gameProgress.categoriesCompleted)
        .filter(cat => cat.completed).length;

      gameProgress.completed = completedCategories >= allCategories.length;

      // Update user's game stats
      gameStats[gameId] = gameProgress;
      await strapi.entityService.update('api::user.user', user.id, {
        data: {
          gameStats: gameStats,
          lastGamePlayed: new Date().toISOString(),
          totalScore: (userData.totalScore || 0) + (isCorrect ? 10 : 0),
          gamesCompleted: userData.gamesCompleted + (gameProgress.completed ? 1 : 0),
        },
      });

      return {
        data: {
          correct: isCorrect,
          progress: gameProgress,
          message: isCorrect ? 'Correct answer!' : 'Incorrect answer. Try again!',
        },
      };
    } catch (error) {
      console.error('Error submitting answer:', error);
      return ctx.throw(500, 'Failed to submit answer');
    }
  },

  // Update game
  async update(ctx) {
    try {
      const { id } = ctx.params;
      console.log('=== GAME UPDATE REQUEST ===');
      console.log('Game ID:', id);
      console.log('Request method:', ctx.request.method);
      console.log('Content-Type:', ctx.request.headers['content-type']);
      
      let gameData;
      
      // Handle different content types
      if (ctx.request.body.data) {
        // Either FormData with JSON data or regular JSON
        if (typeof ctx.request.body.data === 'string') {
          // FormData - parse JSON string
          console.log('Parsing FormData JSON string for update');
          gameData = JSON.parse(ctx.request.body.data);
        } else {
          // Regular JSON
          console.log('Using regular JSON data for update');
          gameData = ctx.request.body.data;
        }
      } else {
        // Direct JSON body
        console.log('Using direct JSON body for update');
        gameData = ctx.request.body;
      }
      
      console.log('Processed update data:', gameData);
      
      // Update the game
      const updatedGame = await strapi.entityService.update('api::game.game', id, {
        data: gameData,
      });

      console.log('✅ Game updated successfully with ID:', id);
      console.log('=== END GAME UPDATE ===');
      return { data: updatedGame };
    } catch (error) {
      console.error('❌ Game update error:', error);
      console.error('Error stack:', error.stack);
      ctx.throw(500, 'Failed to update game');
    }
  },

  // Delete game
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      console.log('=== GAME DELETE REQUEST ===');
      console.log('Game ID:', id);
      
      // Check if game exists
      const game = await strapi.entityService.findOne('api::game.game', id);
      if (!game) {
        console.log('❌ Game not found for deletion:', id);
        return ctx.notFound('Game not found');
      }
      
      // Delete the game
      const deletedGame = await strapi.entityService.delete('api::game.game', id);

      console.log('✅ Game deleted successfully with ID:', id);
      console.log('=== END GAME DELETE ===');
      return { data: deletedGame };
    } catch (error) {
      console.error('❌ Game delete error:', error);
      console.error('Error stack:', error.stack);
      ctx.throw(500, 'Failed to delete game');
    }
  },

  // ---
  // updateCategories: expects { categoryNames: string[] } in body. Only updates first 5 categories (cards 1-5) for nested games. Special Card 6 is not renamed. Returns updated game with categories.
  // ---
  // Update categories for a nested game
  async updateCategories(ctx) {
    try {
      const { id } = ctx.params;
      const { categoryNames } = ctx.request.body;
      
      console.log('=== GAME CATEGORIES UPDATE REQUEST ===');
      console.log('Game ID:', id);
      console.log('New category names:', categoryNames);
      
      // Verify this is a nested game
      const game = await strapi.entityService.findOne('api::game.game', id, {
        populate: { categories: true }
      });
      
      if (!game) {
        return ctx.notFound('Game not found');
      }
      
      if (game.type !== 'nested') {
        return ctx.badRequest('Category updates are only allowed for nested games');
      }
      
      // Get existing categories (excluding Special Card 6)
      const regularCategories = game.categories.filter(cat => cat.cardNumber <= 5);
      
      // Update each category name
      const updatePromises = [];
      for (let i = 0; i < Math.min(categoryNames.length, 5); i++) {
        if (regularCategories[i]) {
          updatePromises.push(
            strapi.entityService.update('api::category.category', regularCategories[i].id, {
              data: { name: categoryNames[i] }
            })
          );
        }
      }
      
      await Promise.all(updatePromises);
      
      console.log('✅ Categories updated successfully');
      console.log('=== END CATEGORIES UPDATE ===');
      
      // Return updated game with categories
      const updatedGame = await strapi.entityService.findOne('api::game.game', id, {
        populate: { categories: true }
      });
      
      return { data: updatedGame };
    } catch (error) {
      console.error('❌ Categories update error:', error);
      ctx.throw(500, 'Failed to update categories');
    }
  },
})); 