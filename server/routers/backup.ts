import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import {
  list,
  insert,
  removeAll,
  count as countDocs,
  getSettingValue,
  setSettingValue,
} from "../_core/firestore-db";

/**
 * Backup Router - Real data export from Firestore.
 * Exports actual documents from all collections, not fake data.
 */

const TABLE_MAP: Record<string, { collection: string; label: string }> = {
  destinations: { collection: "destinations", label: "Destinations" },
  offers: { collection: "offers", label: "Offers & Packages" },
  blog: { collection: "blogPosts", label: "Blog Articles" },
  bookings: { collection: "bookings", label: "Bookings" },
  users: { collection: "users", label: "Users" },
  gallery: { collection: "galleryItems", label: "Gallery" },
  reviews: { collection: "reviews", label: "Reviews" },
  settings: { collection: "siteSettings", label: "Settings" },
  contacts: { collection: "contactMessages", label: "Contact Messages" },
  marketing: { collection: "marketingContent", label: "Marketing Content" },
};

export const backupRouter = router({
  /**
   * Get record counts for all exportable collections
   */
  getExportSections: adminProcedure.query(async () => {
    const sections = [];
    for (const [id, { collection, label }] of Object.entries(TABLE_MAP)) {
      try {
        const recordCount = await countDocs(collection);
        sections.push({ id, label, recordCount });
      } catch (error) {
        console.warn(`[backup.getExportSections] Failed to count ${collection}:`, error instanceof Error ? error.message : String(error));
        sections.push({ id, label, recordCount: 0 });
      }
    }
    return sections;
  }),

  /**
   * Export selected sections as JSON data
   */
  exportData: adminProcedure
    .input(z.object({
      sections: z.array(z.string()),
      format: z.enum(["json", "csv"]).default("json"),
    }))
    .mutation(async ({ input }) => {
      const exportResult: Record<string, { label: string; recordCount: number; data: any[]; error?: string }> = {};

      for (const sectionId of input.sections) {
        const mapping = TABLE_MAP[sectionId];
        if (!mapping) continue;

        try {
          const rows = await list(mapping.collection);
          exportResult[sectionId] = {
            label: mapping.label,
            recordCount: rows.length,
            data: rows,
          };
        } catch (error) {
          console.error(`[backup.exportData] Failed to export ${sectionId}:`, error instanceof Error ? error.message : String(error));
          exportResult[sectionId] = {
            label: mapping.label,
            recordCount: 0,
            data: [],
            error: error instanceof Error ? error.message : "Export failed",
          };
        }
      }

      return {
        exportedAt: new Date().toISOString(),
        format: input.format,
        totalRecords: Object.values(exportResult).reduce((sum, s) => sum + s.recordCount, 0),
        sections: exportResult,
      };
    }),

  /**
   * Get backup settings from Firestore
   */
  getSettings: adminProcedure.query(async () => {
    const rows = await list("siteSettings", {
      where: [["category", "==", "backup"]],
    });
    const settings: Record<string, string> = {};
    for (const row of rows as any[]) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),

  /**
   * Restore data from backup file
   */
  restoreData: adminProcedure
    .input(z.object({
      sections: z.record(z.string(), z.object({
        label: z.string(),
        recordCount: z.number(),
        data: z.array(z.any()),
      })),
      mode: z.enum(["merge", "replace"]).default("merge"),
    }))
    .mutation(async ({ input }) => {
      const results: Record<string, { restored: number; skipped: number; errors: number }> = {};

      for (const [sectionId, section] of Object.entries(input.sections)) {
        const mapping = TABLE_MAP[sectionId];
        if (!mapping || !section.data || section.data.length === 0) {
          results[sectionId] = { restored: 0, skipped: 0, errors: 0 };
          continue;
        }

        let restored = 0;
        const skipped = 0;
        let errors = 0;

        try {
          // In replace mode, delete existing documents first
          if (input.mode === "replace") {
            await removeAll(mapping.collection);
          }

          // Insert documents one by one
          for (const row of section.data) {
            try {
              const cleanRow = { ...row };
              delete cleanRow.id; // Let the data layer auto-generate ids
              await insert(mapping.collection, cleanRow);
              restored++;
            } catch (error) {
              console.warn(`[backup.restoreData] Failed to insert row in ${sectionId}:`, error instanceof Error ? error.message : String(error));
              errors++;
            }
          }
        } catch (error) {
          console.error(`[backup.restoreData] Failed to restore section ${sectionId}:`, error instanceof Error ? error.message : String(error));
          errors = section.data.length;
        }

        results[sectionId] = { restored, skipped, errors };
      }

      const totalRestored = Object.values(results).reduce((s, r) => s + r.restored, 0);
      const totalSkipped = Object.values(results).reduce((s, r) => s + r.skipped, 0);
      const totalErrors = Object.values(results).reduce((s, r) => s + r.errors, 0);

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
  saveSettings: adminProcedure
    .input(z.object({
      settings: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      for (const [key, value] of Object.entries(input.settings)) {
        await setSettingValue("backup", key, value, ctx.user.id);
      }
      return { success: true };
    }),
});
