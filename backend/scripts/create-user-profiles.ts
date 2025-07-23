import { Strapi } from "../types/strapi";

interface User {
  id: number;
  email: string;
  username: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  status: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
  };
}

export default async ({ strapi }: { strapi: any }) => {
  try {
    // Get all users without profiles
    const users = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: {
          profile: null,
        },
      });

    console.log(`Found ${users.length} users without profiles`);

    // Create profiles for each user
    for (const user of users) {
      const profile: UserProfile = {
        firstName: user.username.split("@")[0],
        lastName: "User",
        displayName: user.username.split("@")[0],
        status: "Active",
        phone: "+44 20 7123 4567",
        address: "123 Sample Street, London, UK",
        dateOfBirth: "1990-01-01",
        preferences: {
          notifications: true,
          newsletter: true,
          language: "en-GB",
        },
      };

      await strapi.db.query("api::user-profile.user-profile").create({
        data: {
          ...profile,
          user: user.id,
        },
      });

      console.log(`Created profile for user: ${user.email}`);
    }

    console.log("Successfully created user profiles");
  } catch (error) {
    console.error("Error creating user profiles:", error);
  }
};
