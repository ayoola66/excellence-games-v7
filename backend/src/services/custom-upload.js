"use strict";

/**
 * custom-upload service
 */

module.exports = () => ({
  async upload(ctx) {
    try {
      console.log("Custom upload service called");

      // Get the files from the request
      const files = ctx.request.files;

      if (!files || files.length === 0) {
        return ctx.badRequest("No files provided");
      }

      // Process each file
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

        // Save to database
        const savedFile = await strapi.entityService.create(
          "plugin::upload.file",
          {
            data: fileData,
          }
        );

        uploadedFiles.push(savedFile);
      }

      console.log("Files uploaded successfully:", uploadedFiles);
      return { data: uploadedFiles };
    } catch (error) {
      console.error("Error in custom upload:", error);
      return ctx.badRequest(`Error uploading files: ${error.message}`);
    }
  },
});
