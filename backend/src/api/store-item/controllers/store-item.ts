import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::store-item.store-item",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        // Add validation for required fields
        const { data } = ctx.request.body;

        if (!data.name || !data.price || !data.description) {
          return ctx.badRequest(
            "Name, price, and description are required fields"
          );
        }

        // Ensure price is a positive number
        if (typeof data.price !== "number" || data.price <= 0) {
          return ctx.badRequest("Price must be a positive number");
        }

        // Create the store item
        const response = await super.create(ctx);
        return response;
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },

    async update(ctx) {
      try {
        const { data } = ctx.request.body;

        // Validate price if it's being updated
        if (data.price !== undefined) {
          if (typeof data.price !== "number" || data.price <= 0) {
            return ctx.badRequest("Price must be a positive number");
          }
        }

        // Update the store item
        const response = await super.update(ctx);
        return response;
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
);
