"use strict";

/**
 * upload controller
 */

module.exports = {
  async upload(ctx) {
    try {
      console.log("Upload controller called - BYPASSING AUTH");

      // Get the files from the request
      const files = ctx.request.files;

      if (!files || files.length === 0) {
        return ctx.badRequest("No files provided");
      }

      // Process each file - NO AUTHENTICATION
      const uploadedFiles = [];

      for (const file of files) {
        // Create a simple file entry without authentication
        const fileData = {
          name: file.name,
          alternativeText: file.name,
          caption: file.name,
          width: null,
          height: null,
          formats: null,
          hash: file.name + "_" + Date.now(),
          ext: file.name.split(".").pop(),
          mime: file.mimetype,
          size: file.size,
          url: `/uploads/${file.name}`,
          previewUrl: null,
          provider: "local",
          provider_metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Direct database insert - NO AUTHENTICATION
        const savedFile = await strapi.db.query("plugin::upload.file").create({
          data: fileData,
        });

        uploadedFiles.push(savedFile);
      }

      console.log("Files uploaded successfully:", uploadedFiles);
      return { data: uploadedFiles };
    } catch (error) {
      console.error("Error in upload controller:", error);
      return ctx.badRequest(`Error uploading: ${error.message}`);
    }
  },
};
