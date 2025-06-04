'use strict';

/**
 * Custom game routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/games/create-nested',
      handler: 'game.createNested',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/games/:gameId/categories/:categoryId/questions',
      handler: 'game.getCategoryQuestions',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/games/submit-answer',
      handler: 'game.submitAnswer',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/games/:id/categories',
      handler: 'game.updateCategories',
      config: {
        auth: false,
      },
    },
  ],
}; 