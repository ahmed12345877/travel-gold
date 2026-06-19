import { z } from "zod";
import { protectedProcedure, publicProcedure, adminProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { list, getSettingValue, setSettingValue, firestore } from "../_core/firestore-db";

/**
 * Site Settings Router - Firestore-backed settings management.
 * Settings are stored in the `siteSettings` collection as documents keyed by
 * `${category}__${key}`, each holding { category, settingKey, settingValue }.
 */
export const siteSettingsRouter = router({
  /**
   * Get theme settings (public - no auth required for visitors)
   */
  getTheme: publicProcedure.query(async () => {
    const rows = (await list("siteSettings", {
      where: [["category", "==", "theme"]],
    })) as any[];
    if (!rows.length) return null;
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.settingKey] = row.settingValue ?? "";
    return settings;
  }),

  /**
   * Get a single setting by category + key (public - hero/theme data accessible to all)
   */
  get: publicProcedure
    .input(z.object({ category: z.string(), key: z.string() }))
    .query(async ({ input }) => {
      return getSettingValue(input.category, input.key);
    }),

  /**
   * Get all settings for a category
   */
  getByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const rows = (await list("siteSettings", {
        where: [["category", "==", input.category]],
      })) as any[];
      const settings: Record<string, string> = {};
      for (const row of rows) settings[row.settingKey] = row.settingValue ?? "";
      return settings;
    }),

  /**
   * Get all settings across all categories
   */
  getAll: protectedProcedure.query(async () => {
    const rows = (await list("siteSettings", {})) as any[];
    const grouped: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.settingKey] = row.settingValue ?? "";
    }
    return grouped;
  }),

  /**
   * Set a single setting (upsert)
   */
  set: adminProcedure
    .input(z.object({ category: z.string(), key: z.string(), value: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await setSettingValue(input.category, input.key, input.value, ctx.user.id);
      return { success: true };
    }),

  /**
   * Set multiple settings at once (batch upsert)
   */
  setMany: adminProcedure
    .input(z.object({
      category: z.string(),
      settings: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const entries = Object.entries(input.settings);
      for (const [key, value] of entries) {
        await setSettingValue(input.category, key, value, ctx.user.id);
      }
      return { success: true, count: entries.length };
    }),

  /**
   * Delete a setting
   */
  delete: adminProcedure
    .input(z.object({ category: z.string(), key: z.string() }))
    .mutation(async ({ input }) => {
      const docId = `${input.category}__${input.key}`;
      await firestore.collection("siteSettings").doc(docId).delete();
      return { success: true };
    }),
});
