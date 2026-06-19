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
    try {
      const rows = (await list("siteSettings", {
        where: [["category", "==", "theme"]],
      })) as any[];
      if (!rows.length) return null;
      const settings: Record<string, string> = {};
      for (const row of rows) settings[row.settingKey] = row.settingValue ?? "";
      return settings;
    } catch (error) {
      console.error("[siteSettings.getTheme] query error:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }),

  /**
   * Get a single setting by category + key
   */
  get: protectedProcedure
    .input(z.object({ category: z.string(), key: z.string() }))
    .query(async ({ input }) => {
      try {
        return await getSettingValue(input.category, input.key);
      } catch (error) {
        console.error("[siteSettings.get] query error:", {
          error: error instanceof Error ? error.message : String(error),
          category: input.category,
          key: input.key,
        });
        throw error;
      }
    }),

  /**
   * Get all settings for a category
   */
  getByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      try {
        const rows = (await list("siteSettings", {
          where: [["category", "==", input.category]],
        })) as any[];
        const settings: Record<string, string> = {};
        for (const row of rows) settings[row.settingKey] = row.settingValue ?? "";
        return settings;
      } catch (error) {
        console.error("[siteSettings.getByCategory] query error:", {
          error: error instanceof Error ? error.message : String(error),
          category: input.category,
        });
        throw error;
      }
    }),

  /**
   * Get all settings across all categories
   */
  getAll: protectedProcedure.query(async () => {
    try {
      const rows = (await list("siteSettings", {})) as any[];
      const grouped: Record<string, Record<string, string>> = {};
      for (const row of rows) {
        if (!grouped[row.category]) grouped[row.category] = {};
        grouped[row.category][row.settingKey] = row.settingValue ?? "";
      }
      return grouped;
    } catch (error) {
      console.error("[siteSettings.getAll] query error:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }),

  /**
   * Set a single setting (upsert)
   */
  set: adminProcedure
    .input(z.object({ category: z.string(), key: z.string(), value: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await setSettingValue(input.category, input.key, input.value, ctx.user.id);
        return { success: true };
      } catch (error) {
        console.error("[siteSettings.set] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          category: input.category,
          key: input.key,
        });
        throw error;
      }
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
      try {
        const entries = Object.entries(input.settings);
        for (const [key, value] of entries) {
          await setSettingValue(input.category, key, value, ctx.user.id);
        }
        return { success: true, count: entries.length };
      } catch (error) {
        console.error("[siteSettings.setMany] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          category: input.category,
        });
        throw error;
      }
    }),

  /**
   * Delete a setting
   */
  delete: adminProcedure
    .input(z.object({ category: z.string(), key: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const docId = `${input.category}__${input.key}`;
        await firestore.collection("siteSettings").doc(docId).delete();
        return { success: true };
      } catch (error) {
        console.error("[siteSettings.delete] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          category: input.category,
          key: input.key,
        });
        throw error;
      }
    }),
});
