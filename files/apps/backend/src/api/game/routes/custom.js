'use strict';

/**
 * Custom game routes
 */

module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/games/create-nested',
      handler: 'game.createNested',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/games/:gameId/categories/:categoryId/questions',
      handler: 'game.getCategoryQuestions',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/games/submit-answer',
      handler: 'game.submitAnswer',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 