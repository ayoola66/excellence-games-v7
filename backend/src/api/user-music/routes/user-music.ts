export default {
  routes: [
    {
      method: "GET",
      path: "/user-music",
      handler: "user-music.find",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["find"],
        },
      },
    },
    {
      method: "POST",
      path: "/user-music",
      handler: "user-music.create",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["create"],
        },
      },
    },
    {
      method: "DELETE",
      path: "/user-music/:id",
      handler: "user-music.delete",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["delete"],
        },
      },
    },
  ],
};
