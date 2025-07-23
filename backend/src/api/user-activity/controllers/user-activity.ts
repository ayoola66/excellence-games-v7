import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-activity.user-activity', ({ strapi }) => ({
  async find(ctx) {
    const { user } = ctx.state;
    const { page = 1, limit = 10 } = ctx.query;

    try {
      const activities = await strapi.db.query('api::user-activity.user-activity').findMany({
        where: { user: user.id },
        orderBy: { activityDate: 'desc' },
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });

      // Format the activities for display
      const formattedActivities = activities.map(activity => {
        const timeAgo = formatTimeAgo(activity.activityDate);
        return {
          id: activity.id,
          gameType: activity.gameType,
          description: activity.description,
          timeAgo,
          score: activity.score,
          metadata: activity.metadata,
        };
      });

      return formattedActivities;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async create(ctx) {
    const { user } = ctx.state;
    const { gameType, description, score, metadata } = ctx.request.body;

    try {
      const activity = await strapi.db.query('api::user-activity.user-activity').create({
        data: {
          user: user.id,
          gameType,
          description,
          score,
          metadata,
          activityDate: new Date(),
        },
      });

      return activity;
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}
