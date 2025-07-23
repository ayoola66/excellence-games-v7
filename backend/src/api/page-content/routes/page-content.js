"use strict";

/**
 * page-content router
 */

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/page-contents/by-page/:pageName",
      handler: "page-content.findByPage",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/page-contents/by-page/:pageName",
      handler: "page-content.updateByPage",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
        middlewares: [],
      },
    },
  ],
};
