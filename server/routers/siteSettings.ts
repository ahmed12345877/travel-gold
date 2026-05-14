import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Site Settings Router - Real DB-backed settings management.
 * All settings are stored in the site_settings table as key-value pairs grouped by category.
 */
export const siteSettingsRouter = router({
  /**
   * Get theme settings (public - no auth required for visitors)
   */
  getTheme: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const results = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.category, "theme"));
    if (!results.length) return null;
    const settings: Record<string, string> = {};
    for (const row of results) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Get a single setting by category + key
   */
  get: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        key: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db
        .select()
        .from(siteSettings)
        .where(
          and(
            eq(siteSettings.category, input.category),
            eq(siteSettings.settingKey, input.key),
          ),
        )
        .limit(1);
      return result?.settingValue ?? null;
    }),

  /**
   * Get all settings for a category
   */
  getByCategory: protectedProcedure
    .input(
      z.object({
        category: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return {};
      const results = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.category, input.category));

      const settings: Record<string, string> = {};
      for (const row of results) {
        settings[row.settingKey] = row.settingValue ?? "";
      }
      return settings;
    }),

  /**
   * Get all settings across all categories
   */
  getAll: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {};
    const results = await db.select().from(siteSettings);
    const grouped: Record<string, Record<string, string>> = {};
    for (const row of results) {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.settingKey] = row.settingValue ?? "";
    }
    return grouped;
  }),

  /**
   * Set a single setting (upsert)
   */
  set: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        key: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [existing] = await db
        .select()
        .from(siteSettings)
        .where(
          and(
            eq(siteSettings.category, input.category),
            eq(siteSettings.settingKey, input.key),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(siteSettings)
          .set({ settingValue: input.value, updatedBy: ctx.user.id })
          .where(eq(siteSettings.id, existing.id));
      } else {
        await db.insert(siteSettings).values({
          category: input.category,
          settingKey: input.key,
          settingValue: input.value,
          updatedBy: ctx.user.id,
        });
      }
      return { success: true };
    }),

  /**
   * Set multiple settings at once (batch upsert)
   */
  setMany: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        settings: z.record(z.string(), z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const entries = Object.entries(input.settings);

      for (const [key, value] of entries) {
        const [existing] = await db
          .select()
          .from(siteSettings)
          .where(
            and(
              eq(siteSettings.category, input.category),
              eq(siteSettings.settingKey, key),
            ),
          )
          .limit(1);

        if (existing) {
          await db
            .update(siteSettings)
            .set({ settingValue: value, updatedBy: ctx.user.id })
            .where(eq(siteSettings.id, existing.id));
        } else {
          await db.insert(siteSettings).values({
            category: input.category,
            settingKey: key,
            settingValue: value,
            updatedBy: ctx.user.id,
          });
        }
      }
      return { success: true, count: entries.length };
    }),

  /**
   * Delete a setting
   */
  delete: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(siteSettings)
        .where(
          and(
            eq(siteSettings.category, input.category),
            eq(siteSettings.settingKey, input.key),
          ),
        );
      return { success: true };
    }),
});
