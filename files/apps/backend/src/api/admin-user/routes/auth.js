module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/admin-users/login',
      handler: 'auth.login',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 