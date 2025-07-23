import { Strapi } from "@strapi/strapi";
import { v4 as uuidv4 } from "uuid";

export default {
  async logout(ctx) {
    try {
      const { id } = ctx.state.auth;

      // Log the logout attempt
      console.log(`Admin logout attempt - User ID: ${id}`);

      // Update last logout time
      await strapi.db.query("api::platform-admin.platform-admin").update({
        where: { user: id },
        data: { lastLogoutAt: new Date() },
      });

      // Clear any session data if needed
      ctx.cookies.set("token", null);

      return {
        message: "Successfully logged out",
      };
    } catch (error) {
      console.error("Logout error:", {
        error: error.message,
        stack: error.stack,
        userId: ctx.state.auth?.id,
      });
      return ctx.internalServerError("An error occurred during logout");
    }
  },

  async login(ctx) {
    try {
      const { identifier, password } = ctx.request.body;

      // Log login attempt (without password)
      console.log(`Admin login attempt - Email: ${identifier}`);

      // Validate input
      if (!identifier || !password) {
        console.warn(
          `Invalid login attempt - Missing credentials for: ${identifier}`
        );
        return ctx.badRequest("Email and password are required");
      }

      // Find the user
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { email: identifier },
          populate: ["role"],
        });

      if (!user) {
        return ctx.badRequest("Invalid credentials");
      }

      // Check if user has Frontend_Admin role
      if (user.role.name !== "Frontend_Admin") {
        return ctx.forbidden("You do not have administrative access");
      }

      // Validate password
      const validPassword = await strapi.plugins[
        "users-permissions"
      ].services.user.validatePassword(password, user.password);

      if (!validPassword) {
        return ctx.badRequest("Invalid credentials");
      }

      // Find associated platform admin
      const admin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .findOne({
          where: { user: user.id },
          select: [
            "id",
            "firstName",
            "lastName",
            "email",
            "adminRole",
            "accessLevel",
            "permissions",
          ],
        });

      if (!admin) {
        return ctx.notFound("Admin profile not found");
      }

      // Generate tokens
      const token = strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id,
        isAdmin: true,
        adminId: admin.id,
      });

      const refreshToken = strapi.plugins[
        "users-permissions"
      ].services.jwt.issue(
        {
          id: user.id,
          isAdmin: true,
          adminId: admin.id,
          type: "refresh",
          jti: uuidv4(),
        },
        { expiresIn: "30d" }
      );

      // Update last login
      await strapi.db.query("api::platform-admin.platform-admin").update({
        where: { id: admin.id },
        data: {
          lastLoginAt: new Date(),
          refreshToken: refreshToken,
        },
      });

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          adminId: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.adminRole,
          accessLevel: admin.accessLevel,
          permissions: admin.permissions,
        },
      };
    } catch (error) {
      console.error("Login error:", {
        error: error.message,
        stack: error.stack,
        identifier: ctx.request.body?.identifier,
      });
      return ctx.internalServerError("An unexpected error occurred");
    }
  },

  async getProfile(ctx) {
    try {
      const { id } = ctx.state.auth;

      const admin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .findOne({
          where: { user: id },
          select: [
            "id",
            "firstName",
            "lastName",
            "email",
            "adminRole",
            "accessLevel",
            "permissions",
            "lastLoginAt",
          ],
        });

      if (!admin) {
        return ctx.notFound("Admin profile not found");
      }

      return {
        data: admin,
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return ctx.badRequest("An error occurred while fetching profile");
    }
  },

  async updateProfile(ctx) {
    try {
      const { id } = ctx.state.auth;
      const { firstName, lastName, email, currentPassword, newPassword } =
        ctx.request.body;

      // Find the admin
      const admin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .findOne({
          where: { user: id },
          populate: ["user"],
        });

      if (!admin) {
        return ctx.notFound("Admin profile not found");
      }

      // Prepare update data
      const updateData: {
        firstName?: string;
        lastName?: string;
        email?: string;
      } = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;

      // If password change is requested
      if (currentPassword && newPassword) {
        // Validate current password
        const validPassword = await strapi.plugins[
          "users-permissions"
        ].services.user.validatePassword(currentPassword, admin.user.password);

        if (!validPassword) {
          return ctx.badRequest("Current password is incorrect");
        }

        // Hash new password
        const hashedPassword = await strapi.plugins[
          "users-permissions"
        ].services.user.hashPassword({
          password: newPassword,
        });

        // Update user password
        await strapi.plugins["users-permissions"].services.user.edit(
          admin.user.id,
          {
            password: hashedPassword,
          }
        );
      }

      // Update admin profile
      const updatedAdmin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .update({
          where: { id: admin.id },
          data: updateData,
          select: [
            "id",
            "firstName",
            "lastName",
            "email",
            "adminRole",
            "accessLevel",
            "permissions",
            "lastLoginAt",
          ],
        });

      return {
        data: updatedAdmin,
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return ctx.badRequest("An error occurred while updating profile");
    }
  },

  async regenerateToken(ctx) {
    try {
      const refreshToken = ctx.request.header.authorization?.replace(
        "Bearer ",
        ""
      );

      if (!refreshToken) {
        return ctx.unauthorized("No refresh token provided");
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = await strapi.plugins["users-permissions"].services.jwt.verify(
          refreshToken
        );
      } catch (error) {
        return ctx.unauthorized("Invalid refresh token");
      }

      if (!decoded.type || decoded.type !== "refresh") {
        return ctx.unauthorized("Invalid token type");
      }

      // Find the admin profile
      const admin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .findOne({
          where: { user: decoded.id },
          select: [
            "id",
            "isActive",
            "adminRole",
            "accessLevel",
            "refreshToken",
          ],
        });

      if (!admin || !admin.isActive || admin.refreshToken !== refreshToken) {
        return ctx.unauthorized("Invalid or inactive admin account");
      }

      // Generate new tokens
      const token = strapi.plugins["users-permissions"].services.jwt.issue({
        id: decoded.id,
        isAdmin: true,
        adminId: admin.id,
      });

      const newRefreshToken = strapi.plugins[
        "users-permissions"
      ].services.jwt.issue(
        {
          id: decoded.id,
          isAdmin: true,
          adminId: admin.id,
          type: "refresh",
          jti: uuidv4(),
        },
        { expiresIn: "30d" }
      );

      // Update refresh token in database
      await strapi.db.query("api::platform-admin.platform-admin").update({
        where: { id: admin.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        token,
        refreshToken: newRefreshToken,
        admin: {
          id: admin.id,
          role: admin.adminRole,
          accessLevel: admin.accessLevel,
        },
      };
    } catch (error) {
      console.error("Token regeneration error:", error);
      return ctx.internalServerError("Failed to regenerate token");
    }
  },

  async verify(ctx) {
    try {
      const token = ctx.request.header.authorization?.replace("Bearer ", "");

      if (!token) {
        return ctx.unauthorized("No token provided");
      }

      // Verify JWT token
      const decoded = await strapi.plugins[
        "users-permissions"
      ].services.jwt.verify(token);

      // Find platform admin
      const admin = await strapi.db
        .query("api::platform-admin.platform-admin")
        .findOne({
          where: { id: decoded.adminId },
          select: ["id", "isActive", "adminRole", "accessLevel"],
        });

      if (!admin || !admin.isActive) {
        return ctx.unauthorized("Invalid or inactive admin account");
      }

      return ctx.send({
        valid: true,
        admin: {
          id: admin.id,
          role: admin.adminRole,
          accessLevel: admin.accessLevel,
        },
      });
    } catch (error) {
      return ctx.unauthorized("Invalid token");
    }
  },
};
