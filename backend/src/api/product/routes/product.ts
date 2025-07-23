export default {
  routes: [
    {
      method: "GET",
      path: "/products",
      handler: "product.find",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["find"],
        },
      },
    },
    {
      method: "GET",
      path: "/products/:id",
      handler: "product.findOne",
      config: {
        policies: ["global::is-authenticated"],
        auth: {
          scope: ["findOne"],
        },
      },
    },
    {
      method: "POST",
      path: "/products",
      handler: "product.create",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["create"],
        },
      },
    },
    {
      method: "PUT",
      path: "/products/:id",
      handler: "product.update",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["update"],
        },
      },
    },
    {
      method: "DELETE",
      path: "/products/:id",
      handler: "product.delete",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["delete"],
        },
      },
    },
  ],
};
