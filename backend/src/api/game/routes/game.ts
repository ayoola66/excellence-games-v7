export default {
  routes: [
    {
      method: "GET",
      path: "/games",
      handler: "game.find",
    },
    {
      method: "GET",
      path: "/games/:id",
      handler: "game.findOne",
    },
    {
      method: "POST",
      path: "/games",
      handler: "game.create",
    },
    {
      method: "PUT",
      path: "/games/:id",
      handler: "game.update",
    },
    {
      method: "DELETE",
      path: "/games/:id",
      handler: "game.delete",
    },
  ],
};
