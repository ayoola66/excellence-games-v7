export default {
  routes: [
    {
      method: "GET",
      path: "/coupons",
      handler: "coupon.find",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["find"],
        },
      },
    },
    {
      method: "GET",
      path: "/coupons/:id",
      handler: "coupon.findOne",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["findOne"],
        },
      },
    },
    {
      method: "POST",
      path: "/coupons",
      handler: "coupon.create",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["create"],
        },
      },
    },
    {
      method: "PUT",
      path: "/coupons/:id",
      handler: "coupon.update",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["update"],
        },
      },
    },
    {
      method: "DELETE",
      path: "/coupons/:id",
      handler: "coupon.delete",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["delete"],
        },
      },
    },
  ],
};
