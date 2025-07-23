export default {
  routes: [
    {
      method: 'GET',
      path: '/user-activity',
      handler: 'user-activity.find',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/user-activity',
      handler: 'user-activity.create',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
  ],
};
