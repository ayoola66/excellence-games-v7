export default {
  routes: [
    {
      method: "GET",
      path: "/game-stats",
      handler: "game-stat.findOne",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["find"],
        },
      },
    },
    {
      method: "PUT",
      path: "/game-stats",
      handler: "game-stat.update",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["update"],
        },
      },
    },
  ],
};
