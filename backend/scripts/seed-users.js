module.exports = {
  async up(strapi) {
    try {
      // Get authenticated role
      const authenticatedRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: "authenticated" },
        });

      if (!authenticatedRole) {
        throw new Error("Authenticated role not found");
      }

      // Create users
      const users = [
        {
          email: "premium@elitagames.com",
          password: "Passw0rd",
          username: "premium@elitagames.com",
          role: authenticatedRole.id,
          confirmed: true,
          blocked: false,
          provider: "local",
        },
        {
          email: "free@elitagames.com",
          password: "Passw0rd",
          username: "free@elitagames.com",
          role: authenticatedRole.id,
          confirmed: true,
          blocked: false,
          provider: "local",
        },
      ];

      for (const userData of users) {
        // Check if user exists
        const exists = await strapi
          .query("plugin::users-permissions.user")
          .findOne({ where: { email: userData.email } });

        if (!exists) {
          // Create user
          const user = await strapi.plugins["users-permissions"].services.user.add(userData);
          console.log(`Created user: ${user.email}`);

          // Create profile
          if (user) {
            const profile = {
              firstName: user.email.startsWith("premium") ? "Premium" : "Free",
              lastName: "Player",
              displayName: `${user.email.startsWith("premium") ? "Premium" : "Free"} Player`,
              status: user.email.startsWith("premium") ? "Premium" : "Free",
              phoneNumber: user.email.startsWith("premium") ? "+44 20 7123 4570" : "+44 20 7123 4571",
              address: user.email.startsWith("premium") ? "123 Elite Street" : "456 Starter Road",
              city: user.email.startsWith("premium") ? "London" : "Manchester",
              country: "United Kingdom",
              postalCode: user.email.startsWith("premium") ? "SW1A 1AD" : "M1 1AA",
              bio: user.email.startsWith("premium") 
                ? "Premium subscription player with full access"
                : "Free tier player with basic access",
              user: user.id
            };

            await strapi.query("api::user-profile.user-profile").create({ data: profile });
            console.log(`Created profile for: ${user.email}`);
          }
        } else {
          console.log(`User ${userData.email} already exists`);
        }
      }

      console.log("Seeding completed successfully");
    } catch (error) {
      console.error("Seeding error:", error);
    }
  }
};
