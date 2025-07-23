export default {
  routes: [
    {
      method: "GET",
      path: "/orders",
      handler: "order.find",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["find"],
        },
      },
    },
    {
      method: "GET",
      path: "/orders/:id",
      handler: "order.findOne",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["findOne"],
        },
      },
    },
    {
      method: "PUT",
      path: "/orders/:id",
      handler: "order.update",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["update"],
        },
      },
    },
    {
      method: "DELETE",
      path: "/orders/:id",
      handler: "order.delete",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["delete"],
        },
      },
    },
  ],
};
