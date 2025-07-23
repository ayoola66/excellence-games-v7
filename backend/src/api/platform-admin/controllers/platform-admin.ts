import { Strapi } from "@strapi/strapi";

export default {
  async find(ctx) {
    try {
      const admins = await strapi.db.query("api::platform-admin.platform-admin").findMany({
        populate: ["user"],
      });
      return { data: admins };
    } catch (error) {
      console.error("Error finding admins:", error);
      return ctx.badRequest("Failed to fetch admins");
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const admin = await strapi.db.query("api::platform-admin.platform-admin").findOne({
        where: { id },
        populate: ["user"],
      });

      if (!admin) {
        return ctx.notFound("Admin not found");
      }

      return { data: admin };
    } catch (error) {
      console.error("Error finding admin:", error);
      return ctx.badRequest("Failed to fetch admin");
    }
  },

  async create(ctx) {
    try {
      const { data } = ctx.request.body;

      // Check if admin already exists for this user
      const existingAdmin = await strapi.db.query("api::platform-admin.platform-admin").findOne({
        where: { user: data.user },
      });

      if (existingAdmin) {
        return ctx.badRequest("Admin profile already exists for this user");
      }

      const admin = await strapi.db.query("api::platform-admin.platform-admin").create({
        data,
      });

      return { data: admin };
    } catch (error) {
      console.error("Error creating admin:", error);
      return ctx.badRequest("Failed to create admin");
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      const admin = await strapi.db.query("api::platform-admin.platform-admin").update({
        where: { id },
        data,
      });

      if (!admin) {
        return ctx.notFound("Admin not found");
      }

      return { data: admin };
    } catch (error) {
      console.error("Error updating admin:", error);
      return ctx.badRequest("Failed to update admin");
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      const admin = await strapi.db.query("api::platform-admin.platform-admin").delete({
        where: { id },
      });

      if (!admin) {
        return ctx.notFound("Admin not found");
      }

      return { data: admin };
    } catch (error) {
      console.error("Error deleting admin:", error);
      return ctx.badRequest("Failed to delete admin");
    }
  },
};