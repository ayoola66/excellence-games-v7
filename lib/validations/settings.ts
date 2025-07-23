import * as z from "zod";

export const applicationSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  defaultLanguage: z.string().min(1, "Default language is required"),
  timezone: z.string().min(1, "Timezone is required"),
  currencyFormat: z.string().min(1, "Currency format is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  timeFormat: z.string().min(1, "Time format is required"),
});

export const contentSettingsSchema = z.object({
  defaultCategoryOrder: z.enum(["alphabetical", "manual", "recent"]),
  itemsPerPage: z.number().int().min(1).max(100),
  featureToggles: z.array(z.string()),
  moderationRules: z.string().optional(),
});

export const mediaSettingsSchema = z.object({
  maxUploadSize: z.number().int().min(1).max(100),
  allowedFileTypes: z.array(z.string()),
  imageCompression: z.number().min(0).max(100),
  defaultImageWidth: z.number().int().min(100).max(4096),
  defaultImageHeight: z.number().int().min(100).max(4096),
});

export type ApplicationSettings = z.infer<typeof applicationSettingsSchema>;
export type ContentSettings = z.infer<typeof contentSettingsSchema>;
export type MediaSettings = z.infer<typeof mediaSettingsSchema>;
