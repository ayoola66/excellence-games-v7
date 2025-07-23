import type { Strapi } from "@strapi/strapi";

export default async ({ strapi }) => {
  try {
    // Update premium user
    const [premiumUser] = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: {
          email: "premium@elitegames.com",
        },
      });

    if (premiumUser?.id) {
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: premiumUser.id },
        data: {
          role: "premium",
          becamePremiumAt: new Date().toISOString(),
          subscriptionExpiryDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 year from now
        },
      });
      console.log("Updated premium user role");
    } else {
      console.log("Premium user not found");
    }

    // Update free user
    const [freeUser] = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: {
          email: "free@elitegames.com",
        },
      });

    if (freeUser?.id) {
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: freeUser.id },
        data: {
          role: "free",
        },
      });
      console.log("Updated free user role");
    } else {
      console.log("Free user not found");
    }

    console.log("Successfully completed user role updates");
  } catch (error) {
    console.error("Error updating user roles:", error);
  }
};
