import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::page.page",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        // Add the current admin as lastEditedBy
        ctx.request.body.data.lastEditedBy = ctx.state.user.id;

        // Create the page
        const response = await super.create(ctx);
        return response;
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    async update(ctx) {
      try {
        // Add the current admin as lastEditedBy
        ctx.request.body.data.lastEditedBy = ctx.state.user.id;

        // Update the page
        const response = await super.update(ctx);
        return response;
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    async findBySlug(ctx) {
      try {
        const { slug } = ctx.params;

        const entity = await strapi.db.query("api::page.page").findOne({
          where: { slug },
          populate: ["seo", "lastEditedBy"],
        });

        if (!entity) {
          return ctx.notFound("Page not found");
        }

        // Use strapi's sanitize utility
        const sanitizedEntity = await strapi.sanitize.contentAPI.output(
          entity,
          strapi.getModel("api::page.page")
        );

        return { data: sanitizedEntity };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
