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
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/games/submit-answer',
      handler: 'game.submitAnswer',
      config: {
        policies: ['global::is-authenticated'],
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