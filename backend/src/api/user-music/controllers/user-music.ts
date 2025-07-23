import { factories } from "@strapi/strapi";
import { ContentType } from "@strapi/strapi";

const contentType = "api::user-music.user-music" as ContentType;

export default factories.createCoreController(contentType, ({ strapi }) => ({
  async find(ctx) {
    const { user } = ctx.state;

    // Check if user is premium
    if (user?.playerSubscription !== "Premium") {
      return ctx.forbidden(
        "Premium subscription required to access music features"
      );
    }

    try {
      const music = await strapi.db.query(contentType).findMany({
        where: { user: user.id },
        orderBy: { createdAt: "desc" },
        populate: ["file"],
      });

      return music.map((track) => ({
        id: track.id,
        name: track.name,
        url: track.file?.url,
        duration: track.duration,
        createdAt: track.createdAt,
      }));
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async create(ctx) {
    const { user } = ctx.state;

    // Check if user is premium
    if (user?.playerSubscription !== "Premium") {
      return ctx.forbidden("Premium subscription required to upload music");
    }

    try {
      // Check if user has reached their limit
      const existingTracks = await strapi.db.query(contentType).count({
        where: { user: user.id },
      });

      if (existingTracks >= 1) {
        return ctx.forbidden("You have reached your music upload limit");
      }

      // Handle file upload
      const { files } = ctx.request.files || {};
      if (!files?.file) {
        return ctx.throw(400, "No file uploaded");
      }

      const file = files.file;

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return ctx.throw(400, "File size exceeds 5MB limit");
      }

      // Validate file type
      if (!file.type.startsWith("audio/")) {
        return ctx.throw(400, "Only audio files are allowed");
      }

      // Upload file to Strapi
      const uploadedFile = await strapi.plugins.upload.services.upload.upload({
        data: {},
        files: file,
      });

      // Create music entry
      const music = await strapi.db.query(contentType).create({
        data: {
          user: user.id,
          name: file.name,
          file: uploadedFile[0].id,
          duration: 0, // You might want to extract this from the file metadata
        },
      });

      return {
        id: music.id,
        name: music.name,
        url: uploadedFile[0].url,
        createdAt: music.createdAt,
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async delete(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;

    // Check if user is premium
    if (user?.playerSubscription !== "Premium") {
      return ctx.forbidden("Premium subscription required to manage music");
    }

    try {
      const music = await strapi.db.query(contentType).findOne({
        where: { id, user: user.id },
        populate: ["file"],
      });

      if (!music) {
        return ctx.throw(404, "Music not found");
      }

      // Delete the file from upload plugin
      if (music.file) {
        await strapi.plugins.upload.services.upload.remove(music.file);
      }

      // Delete the music entry
      await strapi.db.query(contentType).delete({
        where: { id },
      });

      return { success: true };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));
