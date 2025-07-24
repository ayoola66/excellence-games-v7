/**
 * Admin stats controller
 */
export default ({ strapi }) => ({
  async getStats(ctx) {
    try {
      console.log("📊 Admin stats requested");

      let totalUsers = 0;
      let totalGames = 0;
      let totalCategories = 0;
      let totalQuestions = 0;
      let activeGames = 0;

      // Get total users count
      try {
        totalUsers = await strapi
          .query("plugin::users-permissions.user")
          .count();
        console.log(`👥 Total users: ${totalUsers}`);
      } catch (error) {
        console.warn("Failed to get users count:", error.message);
      }

      // Get total games count
      try {
        totalGames = await strapi.query("api::game.game").count();
        console.log(`🎮 Total games: ${totalGames}`);

        // Get active games count
        activeGames = await strapi.query("api::game.game").count({
          where: { isActive: true },
        });
        console.log(`🟢 Active games: ${activeGames}`);
      } catch (error) {
        console.warn("Failed to get games count:", error.message);
      }

      // Get total categories count
      try {
        totalCategories = await strapi.query("api::category.category").count();
        console.log(`📂 Total categories: ${totalCategories}`);
      } catch (error) {
        console.warn("Failed to get categories count:", error.message);
      }

      // Get total questions count
      try {
        totalQuestions = await strapi.query("api::question.question").count();
        console.log(`❓ Total questions: ${totalQuestions}`);
      } catch (error) {
        console.warn("Failed to get questions count:", error.message);
      }

      const stats = {
        totalUsers,
        totalGames,
        totalCategories,
        totalQuestions,
        activeGames,
        timestamp: new Date().toISOString(),
      };

      console.log("✅ Stats response:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Error fetching admin stats:", error);
      console.error("Error stack:", error.stack);

      return ctx.badRequest(`Stats error: ${error.message}`, {
        error: error.message,
        stack: error.stack,
      });
    }
  },
});
