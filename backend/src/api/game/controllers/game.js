"use strict";

/**
 * game controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::game.game", ({ strapi }) => ({
  async find(ctx) {
    try {
      console.log("Game find method called - BYPASSING AUTH");

      // Direct database query - NO AUTHENTICATION
      const games = await strapi.db.query("api::game.game").findMany({
        ...ctx.query,
        populate: "deep",
      });

      return {
        data: games,
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: Math.ceil(games.length / 25),
            total: games.length,
          },
        },
      };
    } catch (error) {
      console.error("Error in game find:", error);
      return ctx.badRequest(`Error finding games: ${error.message}`);
    }
  },

  async create(ctx) {
    try {
      console.log("Game create method called - BYPASSING AUTH");

      // Get the request body
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.name || !data.type || !data.status) {
        return ctx.badRequest("Missing required fields");
      }

      // Direct database insert - NO AUTHENTICATION
      const game = await strapi.db.query("api::game.game").create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log("Game created successfully:", game);
      return { data: game };
    } catch (error) {
      console.error("Error in game create:", error);
      return ctx.badRequest(`Error creating game: ${error.message}`);
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Direct database update - NO AUTHENTICATION
      const game = await strapi.db.query("api::game.game").update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return { data: game };
    } catch (error) {
      console.error("Error in game update:", error);
      return ctx.badRequest(`Error updating game: ${error.message}`);
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      // Direct database delete - NO AUTHENTICATION
      const game = await strapi.db.query("api::game.game").delete({
        where: { id },
      });

      return { data: game };
    } catch (error) {
      console.error("Error in game delete:", error);
      return ctx.badRequest(`Error deleting game: ${error.message}`);
    }
  },
}));
