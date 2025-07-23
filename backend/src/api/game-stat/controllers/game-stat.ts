import { factories } from "@strapi/strapi";
import { ContentType } from "@strapi/strapi";

const contentType = "api::game-stat.game-stat" as ContentType;

export default factories.createCoreController(
  "api::game-stat.game-stat",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { user } = ctx.state;

      try {
        // Find or create game stats for the user
        let stats = await strapi.db.query("api::game-stat.game-stat").findOne({
          where: { user: user.id },
          populate: ["user"],
        });

        if (!stats) {
          stats = await strapi.db.query("api::game-stat.game-stat").create({
            data: {
              user: user.id,
              gamesPlayed: 0,
              timePlayed: 0,
              highScore: 0,
              winRate: 0,
            },
          });
        }

        // Format time played into hours
        const timePlayedHours = (stats.timePlayed / 60).toFixed(1);

        return {
          gamesPlayed: stats.gamesPlayed,
          timePlayed: `${timePlayedHours}h`,
          highScore: stats.highScore,
          winRate: stats.winRate,
          lastGameDate: stats.lastGameDate,
        };
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async update(ctx) {
      const { user } = ctx.state;
      const { score, timeSpent, won } = ctx.request.body;

      try {
        // Find or create game stats
        let stats = await strapi.db.query("api::game-stat.game-stat").findOne({
          where: { user: user.id },
        });

        if (!stats) {
          stats = await strapi.db.query("api::game-stat.game-stat").create({
            data: {
              user: user.id,
              gamesPlayed: 0,
              timePlayed: 0,
              highScore: 0,
              winRate: 0,
            },
          });
        }

        // Update stats
        const newGamesPlayed = stats.gamesPlayed + 1;
        const newTimePlayed = stats.timePlayed + timeSpent;
        const newHighScore = Math.max(stats.highScore, score);
        const totalWins =
          (stats.winRate * stats.gamesPlayed) / 100 + (won ? 1 : 0);
        const newWinRate = (totalWins / newGamesPlayed) * 100;

        const updatedStats = await strapi.db
          .query("api::game-stat.game-stat")
          .update({
            where: { id: stats.id },
            data: {
              gamesPlayed: newGamesPlayed,
              timePlayed: newTimePlayed,
              highScore: newHighScore,
              winRate: newWinRate,
              lastGameDate: new Date(),
            },
          });

        return updatedStats;
      } catch (err) {
        ctx.throw(500, err);
      }
    },
  })
);
