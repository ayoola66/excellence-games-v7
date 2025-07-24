export default {
  routes: [
    {
      method: "GET",
      path: "/admin/stats",
      handler: "stats.getStats",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
