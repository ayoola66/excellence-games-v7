export default {
  routes: [
    {
      method: "GET",
      path: "/store-items",
      handler: "store-item.find",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["find"],
        },
      },
    },
    {
      method: "GET",
      path: "/store-items/:id",
      handler: "store-item.findOne",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["findOne"],
        },
      },
    },
    {
      method: "POST",
      path: "/store-items",
      handler: "store-item.create",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["create"],
        },
      },
    },
    {
      method: "PUT",
      path: "/store-items/:id",
      handler: "store-item.update",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["update"],
        },
      },
    },
    {
      method: "DELETE",
      path: "/store-items/:id",
      handler: "store-item.delete",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["delete"],
        },
      },
    },
  ],
};
