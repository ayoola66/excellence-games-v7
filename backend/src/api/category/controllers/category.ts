import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async find(ctx) {
      // Call the default core controller
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async create(ctx) {
      try {
        // Get the request body
        const { data } = ctx.request.body;

        // Validate required fields
        if (!data.name || !data.cardNumber) {
          return ctx.badRequest("Missing required fields");
        }

        // Create the category
        const entity = await strapi.entityService.create(
          "api::category.category",
          {
            data: {
              name: data.name,
              cardNumber: data.cardNumber,
              isActive: data.isActive !== undefined ? data.isActive : true,
              game: data.game || null,
            },
          }
        );

        // Return the created entity
        return { data: entity };
      } catch (error) {
        console.error("Error creating category:", error);
        return ctx.badRequest(`Error creating category: ${error.message}`);
      }
    },
  })
);
