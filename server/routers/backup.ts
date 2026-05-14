import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  destinations,
  offers,
  blogPosts,
  bookings,
  users,
  galleryItems,
  reviews,
  siteSettings,
  contactMessages,
  marketingContent,
} from "../../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Backup Router - Real data export from database.
 * Exports actual records from all tables, not fake data.
 */

const TABLE_MAP: Record<string, { table: any; label: string }> = {
  destinations: { table: destinations, label: "Destinations" },
  offers: { table: offers, label: "Offers & Packages" },
  blog: { table: blogPosts, label: "Blog Articles" },
  bookings: { table: bookings, label: "Bookings" },
  users: { table: users, label: "Users" },
  gallery: { table: galleryItems, label: "Gallery" },
  reviews: { table: reviews, label: "Reviews" },
  settings: { table: siteSettings, label: "Settings" },
  contacts: { table: contactMessages, label: "Contact Messages" },
  marketing: { table: marketingContent, label: "Marketing Content" },
};

export const backupRouter = router({
  /**
   * Get record counts for all exportable tables
   */
  getExportSections: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const sections = [];
    for (const [id, { table, label }] of Object.entries(TABLE_MAP)) {
      try {
        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(table);
        sections.push({
          id,
          label,
          recordCount: Number(result?.count ?? 0),
        });
      } catch {
        sections.push({ id, label, recordCount: 0 });
      }
    }
    return sections;
  }),

  /**
   * Export selected sections as JSON data
   */
  exportData: protectedProcedure
    .input(
      z.object({
        sections: z.array(z.string()),
        format: z.enum(["json", "csv"]).default("json"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const exportResult: Record<
        string,
        { label: string; recordCount: number; data: any[] }
      > = {};

      for (const sectionId of input.sections) {
        const mapping = TABLE_MAP[sectionId];
        if (!mapping) continue;

        try {
          const rows = await db.select().from(mapping.table);
          exportResult[sectionId] = {
            label: mapping.label,
            recordCount: rows.length,
            data: rows,
          };
        } catch {
          exportResult[sectionId] = {
            label: mapping.label,
            recordCount: 0,
            data: [],
          };
        }
      }

      return {
        exportedAt: new Date().toISOString(),
        format: input.format,
        totalRecords: Object.values(exportResult).reduce(
          (sum, s) => sum + s.recordCount,
          0,
        ),
        sections: exportResult,
      };
    }),

  /**
   * Get backup settings from DB
   */
  getSettings: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {};
    const results = await db
      .select()
      .from(siteSettings)
      .where(sql`${siteSettings.category} = 'backup'`);
    const settings: Record<string, string> = {};
    for (const row of results) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),

  /**
   * Restore data from backup file
   */
  restoreData: protectedProcedure
    .input(
      z.object({
        sections: z.record(
          z.string(),
          z.object({
            label: z.string(),
            recordCount: z.number(),
            data: z.array(z.any()),
          }),
        ),
        mode: z.enum(["merge", "replace"]).default("merge"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results: Record<
        string,
        { restored: number; skipped: number; errors: number }
      > = {};

      for (const [sectionId, section] of Object.entries(input.sections)) {
        const mapping = TABLE_MAP[sectionId];
        if (!mapping || !section.data || section.data.length === 0) {
          results[sectionId] = { restored: 0, skipped: 0, errors: 0 };
          continue;
        }

        let restored = 0;
        let skipped = 0;
        let errors = 0;

        try {
          // In replace mode, delete existing records first
          if (input.mode === "replace") {
            await db.delete(mapping.table);
          }

          // Insert records one by one to handle duplicates gracefully
          for (const row of section.data) {
            try {
              // Remove auto-generated fields that might conflict
              const cleanRow = { ...row };
              delete cleanRow.id; // Let DB auto-generate IDs

              await db.insert(mapping.table).values(cleanRow);
              restored++;
            } catch (e: any) {
              // Duplicate key or constraint violation - skip
              if (
                e?.code === "ER_DUP_ENTRY" ||
                e?.message?.includes("Duplicate")
              ) {
                skipped++;
              } else {
                errors++;
              }
            }
          }
        } catch {
          errors = section.data.length;
        }

        results[sectionId] = { restored, skipped, errors };
      }

      const totalRestored = Object.values(results).reduce(
        (s, r) => s + r.restored,
        0,
      );
      const totalSkipped = Object.values(results).reduce(
        (s, r) => s + r.skipped,
        0,
      );
      const totalErrors = Object.values(results).reduce(
        (s, r) => s + r.errors,
        0,
      );

      return {
        success: true,
        restoredAt: new Date().toISOString(),
        totalRestored,
        totalSkipped,
        totalErrors,
        details: results,
      };
    }),

  /**
   * Save backup settings
   */
  saveSettings: protectedProcedure
    .input(
      z.object({
        settings: z.record(z.string(), z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      for (const [key, value] of Object.entries(input.settings)) {
        const existing = await db
          .select()
          .from(siteSettings)
          .where(
            sql`${siteSettings.category} = 'backup' AND ${siteSettings.settingKey} = ${key}`,
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(siteSettings)
            .set({ settingValue: value, updatedBy: ctx.user.id })
            .where(sql`${siteSettings.id} = ${existing[0].id}`);
        } else {
          await db.insert(siteSettings).values({
            category: "backup",
            settingKey: key,
            settingValue: value,
            updatedBy: ctx.user.id,
          });
        }
      }
      return { success: true };
    }),
});
