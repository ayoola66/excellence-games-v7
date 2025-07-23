import { Strapi } from "../types/strapi";

export default async ({ strapi }: { strapi: Strapi }) => {
  // Create Premium User
  const premiumUser = await strapi.plugins[
    "users-permissions"
  ].services.user.add({
    username: "premium@elitagames.com",
    email: "premium@elitagames.com",
    password: "Premium123!",
    confirmed: true,
    blocked: false,
    role: "premium",
  });

  // Create Free User
  const freeUser = await strapi.plugins["users-permissions"].services.user.add({
    username: "free@elitagames.com",
    email: "free@elitagames.com",
    password: "Free123!",
    confirmed: true,
    blocked: false,
    role: "free",
  });

  console.log("Test users created successfully:", {
    premium: premiumUser,
    free: freeUser,
  });
};
