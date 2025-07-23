export default {
  routes: [
    {
      method: "GET",
      path: "/platform-admins",
      handler: "platform-admin.find",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/platform-admins/:id",
      handler: "platform-admin.findOne",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/platform-admins",
      handler: "platform-admin.create",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/platform-admins/:id",
      handler: "platform-admin.update",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/platform-admins/:id",
      handler: "platform-admin.delete",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};