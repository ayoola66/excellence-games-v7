'use strict';

module.exports = async (ctx, next) => {
  if (ctx.state.user) {
    // Go to next policy or controller
    return await next();
  }

  ctx.unauthorized(`You're not logged in!`);
}; 