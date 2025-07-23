"use strict";

/**
 * page-content service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::page-content.page-content",
  ({ strapi }) => ({
    async findByPage(pageName) {
      const entry = await strapi.entityService.findMany(
        "api::page-content.page-content",
        {
          filters: { pageName },
          populate: {
            sections: {
              populate: "*",
            },
            seo: true,
          },
        }
      );

      return entry[0];
    },

    async updateByPage(pageName, data) {
      const existingContent = await this.findByPage(pageName);

      if (!existingContent) {
        return await strapi.entityService.create(
          "api::page-content.page-content",
          {
            data: {
              pageName,
              ...data,
            },
          }
        );
      }

      return await strapi.entityService.update(
        "api::page-content.page-content",
        existingContent.id,
        {
          data,
        }
      );
    },
  })
);
