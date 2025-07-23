export default {
  routes: [
    {
      method: "GET",
      path: "/questions",
      handler: "question.find",
    },
    {
      method: "GET",
      path: "/questions/:id",
      handler: "question.findOne",
    },
    {
      method: "POST",
      path: "/questions",
      handler: "question.create",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["create"],
        },
      },
    },
    {
      method: "PUT",
      path: "/questions/:id",
      handler: "question.update",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["update"],
        },
      },
    },
    {
      method: "DELETE",
      path: "/questions/:id",
      handler: "question.delete",
      config: {
        policies: ["global::is-authenticated", "global::is-admin-user"],
        auth: {
          scope: ["delete"],
        },
      },
    },
  ],
};
