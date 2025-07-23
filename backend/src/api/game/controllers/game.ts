import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::game.game",
  ({ strapi }) => ({
    async find(ctx) {
      const { user } = ctx.state;

      // Build the base query
      const query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          isActive: true,
        },
        publicationState: ctx.state.auth?.roles?.some((role: any) => role.type === 'admin') ? 'preview' : 'live',
      };

      // If user is not premium, only show non-premium games
      if (user?.playerSubscription !== "Premium") {
        query.filters.isPremium = false;
      }

      // Execute the query with our filters
      const { data, meta } = await super.find({ ...ctx, query });

      return { data: data, meta };
    },

    // Override findOne to check premium access
    async findOne(ctx) {
      const { user } = ctx.state;
      const { id } = ctx.params;

      const game = await strapi.db.query("api::game.game").findOne({
        where: { id },
        publicationState: ctx.state.auth?.roles?.some((role: any) => role.type === 'admin') ? 'preview' : 'live',
      });

      if (!game) {
        return ctx.notFound("Game not found");
      }

      // Check if non-premium user is trying to access premium game
      if (game.isPremium && user?.playerSubscription !== "Premium") {
        return ctx.forbidden(
          "Premium subscription required to access this game"
        );
      }

      return { data: { ...game, normalized: true } };
    },

    // Override create to handle case-insensitive type
    async create(ctx) {
      try {
        const { data } = ctx.request.body;

        // Convert type to uppercase if provided
        if (data?.type) {
          data.type = data.type.toUpperCase();
        }

        // Check for existing game with case-insensitive name
        const existingGame = await strapi.db.query("api::game.game").findOne({
          where: {
            $or: [{ name: { $eqi: data.name } }, { name: { $eq: data.name } }],
            type: data.type,
          },
        });

        if (existingGame) {
          return ctx.conflict("A game with this name already exists");
        }

        // Create the game
        const game = await super.create(ctx);
        return { data: game };
      } catch (error) {
        console.error("Error creating game:", error);
        return ctx.internalServerError("Failed to create game");
      }
    },

    // Override update to handle case-insensitive type
    async update(ctx) {
      try {
        const { data } = ctx.request.body;
        const { id } = ctx.params;

        // Convert type to uppercase if provided
        if (data?.type) {
          data.type = data.type.toUpperCase();
        }

        // If name is being updated, check for existing game with case-insensitive name
        if (data?.name) {
          const existingGame = await strapi.db.query("api::game.game").findOne({
            where: {
              $and: [
                {
                  $or: [
                    { name: { $eqi: data.name } },
                    { name: { $eq: data.name } },
                  ],
                },
                { id: { $ne: id } },
                { type: data.type || undefined },
              ],
            },
          });

          if (existingGame) {
            return ctx.conflict("A game with this name already exists");
          }
        }

        // Update the game
        const game = await super.update(ctx);
        return { data: game };
      } catch (error) {
        console.error("Error updating game:", error);
        return ctx.internalServerError("Failed to update game");
      }
    },
  })
);
