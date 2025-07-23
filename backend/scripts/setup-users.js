import { Strapi } from "@strapi/strapi";
import bcrypt from "bcryptjs";

export default async ({ strapi }: { strapi: Strapi }) => {
  try {
    // Drop all existing tables with CASCADE
    // const knex = strapi.db.connection;
    // await knex.raw("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");

    // Reinitialize the database
    // await strapi.reload();

    // Get or create roles
    const authenticatedRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "authenticated" },
      });

    const superAdminRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: { name: "Super Admin" },
      });

    if (!authenticatedRole || !superAdminRole) {
      throw new Error(
        "Required roles not found. Please run migrations and seed first."
      );
    }

    // Helper function to create a user
    async function createUser(userData: any) {
      const { password, ...restOfUserData } = userData;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        // Create the user
        await strapi.query("plugin::users-permissions.user").create({
          data: {
            ...restOfUserData,
            password: hashedPassword,
            provider: "local",
            confirmed: true,
            blocked: false,
          },
        });

        console.log(`Created user ${userData.email}`);
      } catch (error) {
        // Log the full error object for better debugging
        console.error(`Error creating user ${userData.email}:`, error.message);
        if (error.details) {
          console.error("Error details:", error.details);
        }
        // Do not rethrow, to allow other users to be created
      }
    }

    // --- User Definitions ---

    const usersToCreate = [
      // Super Admin
      {
        username: "superadmin",
        email: "superadmin@elitegames.com",
        password: "Passw0rd",
        role: superAdminRole.id,
        userType: "Admin",
        adminRole: "Dev Admin",
        firstName: "Super",
        lastName: "Admin",
        displayName: "SuperAdmin",
        phoneNumber: "+442071234567",
        address: "10 Downing Street",
        city: "London",
        country: "United Kingdom",
        postalCode: "SW1A 2AA",
        bio: "The one and only Super Administrator.",
      },
      // Dev Admin
      {
        username: "devadmin",
        email: "devadmin@elitegames.com",
        password: "Passw0rd",
        role: authenticatedRole.id,
        userType: "Admin",
        adminRole: "Dev Admin",
        firstName: "Dev",
        lastName: "Admin",
        displayName: "DevAdmin",
        phoneNumber: "+442071234568",
        address: "124 Tech Road",
        city: "Manchester",
        country: "United Kingdom",
        postalCode: "M1 4WX",
        bio: "Developer Administrator.",
      },
      // Content Admin
      {
        username: "contentadmin",
        email: "contentadmin@elitegames.com",
        password: "Passw0rd",
        role: authenticatedRole.id,
        userType: "Admin",
        adminRole: "Content Admin",
        firstName: "Content",
        lastName: "Admin",
        displayName: "ContentAdmin",
        phoneNumber: "+442071234569",
        address: "125 Creative Lane",
        city: "Bristol",
        country: "United Kingdom",
        postalCode: "BS1 5TH",
        bio: "Content Administrator.",
      },
      // Premium Player
      {
        username: "premium@elitegames.com",
        email: "premium@elitegames.com",
        password: "Passw0rd",
        role: authenticatedRole.id,
        userType: "Player",
        playerSubscription: "Premium",
        firstName: "Premium",
        lastName: "Player",
        displayName: "PremiumPlayer",
        phoneNumber: "+447123456780",
        address: "1 Elite Avenue",
        city: "London",
        country: "United Kingdom",
        postalCode: "W1J 0BH",
        bio: "A premium player.",
      },
      // Free Player
      {
        username: "free@elitegames.com",
        email: "free@elitegames.com",
        password: "Passw0rd",
        role: authenticatedRole.id,
        userType: "Player",
        playerSubscription: "Free",
        firstName: "Free",
        lastName: "Player",
        displayName: "FreePlayer",
        phoneNumber: "+447123456781",
        address: "2 Starter Street",
        city: "Birmingham",
        country: "United Kingdom",
        postalCode: "B1 1BB",
        bio: "A free player.",
      },
    ];

    // --- Create Users in Database ---
    console.log("Creating users...");

    for (const userData of usersToCreate) {
      await createUser(userData);
    }

    console.log("User setup completed successfully");
  } catch (error) {
    console.error("Error during user setup:", error);
    throw error;
  }
};
