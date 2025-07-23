"use strict";

/**
 * page-content controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::page-content.page-content",
  ({ strapi }) => ({
    async findByPage(ctx) {
      const { pageName } = ctx.params;

      try {
        const content = await strapi
          .service("api::page-content.page-content")
          .findByPage(pageName);

        if (!content) {
          return ctx.notFound("Page content not found");
        }

        return this.transformResponse(content);
      } catch (error) {
        return ctx.badRequest("Failed to fetch page content");
      }
    },

    async updateByPage(ctx) {
      const { pageName } = ctx.params;
      const { data } = ctx.request.body;

      try {
        const updatedContent = await strapi
          .service("api::page-content.page-content")
          .updateByPage(pageName, data);
        return this.transformResponse(updatedContent);
      } catch (error) {
        return ctx.badRequest("Failed to update page content");
      }
    },
  })
);
