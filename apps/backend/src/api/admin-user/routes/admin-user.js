"use strict";

module.exports = {
  routes: [
    // Core CRUD endpoints
    {
      method: "GET",
      path: "/admin-users",
      handler: "api::admin-user.admin-user.find",
      config: {
        policies: ["admin-only"],
      },
    },
    {
      method: "GET",
      path: "/admin-users/:id",
      handler: "api::admin-user.admin-user.findOne",
      config: {
        policies: ["admin-only"],
      },
    },
    {
      method: "POST",
      path: "/admin-users",
      handler: "api::admin-user.admin-user.create",
      config: {
        policies: ["super-admin-only"],
      },
    },
    {
      method: "PUT",
      path: "/admin-users/:id",
      handler: "api::admin-user.admin-user.update",
      config: {
        policies: ["admin-only"],
      },
    },
    {
      method: "DELETE",
      path: "/admin-users/:id",
      handler: "api::admin-user.admin-user.delete",
      config: {
        policies: ["super-admin-only"],
      },
    },

    // Auth endpoints (no auth required)
    {
      method: "POST",
      path: "/admin-user/auth/login",
      handler: "api::admin-user.admin-user.login",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/admin-user/auth/verify-session",
      handler: "api::admin-user.admin-user.verifySession",
      config: {
        auth: false,
        policies: [],
      },
    },

    // Stats endpoint
    {
      method: "GET",
      path: "/admin/stats",
      handler: "api::admin-user.admin-user.getStats",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
