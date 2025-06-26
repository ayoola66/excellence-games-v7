/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

/**
 * Admin stats controller
 */
export default ({ strapi }) => ({
  async getStats(ctx) {
    try {
      // Check if user has required permissions
      const { user } = ctx.state
      if (!user || !user.roles) {
        return ctx.unauthorized('You are not authorized to access this resource')
      }

      // Get total users count
      const totalUsers = await strapi.query('plugin::users-permissions.user').count()
      
      // Get active users (users who have logged in within the last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const activeUsers = await strapi.query('plugin::users-permissions.user').count({
        where: {
          lastLoginAt: {
            $gte: thirtyDaysAgo.toISOString()
          }
        }
      })

      // Get total games count
      const totalGames = await strapi.query('api::game.game').count()

      // Get total questions count
      const totalQuestions = await strapi.query('api::question.question').count()

      // Get total orders count
      const totalOrders = await strapi.query('api::order.order').count()

      // Calculate total revenue
      const orders = await strapi.query('api::order.order').findMany({
        where: {
          status: 'completed'
        },
        select: ['total']
      })
      const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

      return {
        totalUsers,
        activeUsers,
        totalGames,
        totalQuestions,
        totalOrders,
        revenue
      }
    } catch (error) {
      strapi.log.error('Error fetching admin stats:', error)
      return ctx.internalServerError('An error occurred while fetching statistics')
    }
  }
}) 