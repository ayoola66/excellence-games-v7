export default {
  routes: [
    // Default routes
    {
      method: "GET",
      path: "/pages",
      handler: "page.find",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "GET",
      path: "/pages/:id",
      handler: "page.findOne",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "POST",
      path: "/pages",
      handler: "page.create",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "PUT",
      path: "/pages/:id",
      handler: "page.update",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "DELETE",
      path: "/pages/:id",
      handler: "page.delete",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    // Custom route for finding by slug
    {
      method: "GET",
      path: "/pages/by-slug/:slug",
      handler: "page.findBySlug",
      config: {
        auth: false, // Public access for frontend
      },
    },
  ],
};
