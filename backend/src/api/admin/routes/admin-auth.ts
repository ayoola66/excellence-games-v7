export default {
  routes: [
    {
      method: "POST",
      path: "/admin/auth/local",
      handler: "admin-auth.login",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/admin/auth/verify",
      handler: "admin-auth.verify",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/admin/profile",
      handler: "admin-auth.getProfile",
      config: {
        policies: ["global::is-authenticated"],
      },
    },
    {
      method: "PUT",
      path: "/admin/profile",
      handler: "admin-auth.updateProfile",
      config: {
        policies: ["global::is-authenticated"],
      },
    },
    {
      method: "POST",
      path: "/admin/auth/logout",
      handler: "admin-auth.logout",
      config: {
        policies: ["global::is-authenticated"],
      },
    },
    {
      method: "POST",
      path: "/admin/auth/regenerate-token",
      handler: "admin-auth.regenerateToken",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
