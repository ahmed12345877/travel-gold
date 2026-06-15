import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { insert } from "../_core/firestore-db";

/**
 * Data Import Router - import records from EXTERNAL tools (spreadsheets, other
 * CMSs, legacy systems) via CSV/JSON with column mapping.
 *
 * This is distinct from `backup.restoreData`, which only accepts this system's
 * own JSON export format. Here the admin maps arbitrary source columns onto our
 * schema fields, and each value is coerced/validated against the field type.
 */

type FieldType = "string" | "number" | "decimal" | "date" | "boolean" | "enum";

interface ImportField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Allowed values for enum fields (first is the default fallback) */
  options?: string[];
  /** Helper text shown in the mapping UI */
  hint?: string;
}

interface ImportTable {
  id: string;
  label: string;
  description: string;
  collection: string;
  fields: ImportField[];
}

/* ───────────────────────── Importable table definitions ───────────────────────── */

const IMPORT_TABLES: ImportTable[] = [
  {
    id: "destinations",
    label: "Destinations",
    description: "Travel destinations and tour packages",
    collection: "destinations",
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "location", label: "Location", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "pricePerPerson", label: "Price Per Person", type: "decimal" },
      { key: "rating", label: "Rating", type: "decimal", hint: "0–5" },
      { key: "imageUrl", label: "Image URL", type: "string" },
      { key: "highlights", label: "Highlights", type: "string" },
      { key: "bestTimeToVisit", label: "Best Time To Visit", type: "string" },
      { key: "duration", label: "Duration", type: "string" },
      { key: "difficulty", label: "Difficulty", type: "enum", options: ["easy", "moderate", "hard"] },
      { key: "groupSize", label: "Group Size", type: "string" },
      { key: "inclusions", label: "Inclusions", type: "string" },
      { key: "exclusions", label: "Exclusions", type: "string" },
      { key: "isActive", label: "Status", type: "enum", options: ["active", "inactive"] },
    ],
  },
  {
    id: "offers",
    label: "Offers & Packages",
    description: "Promotional offers and discounts",
    collection: "offers",
    fields: [
      { key: "title", label: "Title", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "discountType", label: "Discount Type", type: "enum", required: true, options: ["percentage", "fixed"] },
      { key: "discountValue", label: "Discount Value", type: "decimal", required: true },
      { key: "promoCode", label: "Promo Code", type: "string" },
      { key: "startDate", label: "Start Date", type: "date", required: true },
      { key: "endDate", label: "End Date", type: "date", required: true },
      { key: "category", label: "Category", type: "string" },
      { key: "destination", label: "Destination", type: "string" },
      { key: "imageUrl", label: "Image URL", type: "string" },
      { key: "totalSpots", label: "Total Spots", type: "number" },
      { key: "isActive", label: "Status", type: "enum", options: ["active", "inactive", "expired"] },
      { key: "badgeText", label: "Badge Text", type: "string" },
    ],
  },
  {
    id: "blog",
    label: "Blog Articles",
    description: "Blog posts and articles",
    collection: "blogPosts",
    fields: [
      { key: "slug", label: "Slug", type: "string", required: true, hint: "Unique URL slug" },
      { key: "title", label: "Title", type: "string", required: true },
      { key: "excerpt", label: "Excerpt", type: "string", required: true },
      { key: "content", label: "Content", type: "string", required: true },
      { key: "metaTitle", label: "Meta Title", type: "string" },
      { key: "metaDescription", label: "Meta Description", type: "string" },
      { key: "metaKeywords", label: "Meta Keywords", type: "string" },
      { key: "coverImageUrl", label: "Cover Image URL", type: "string" },
      { key: "category", label: "Category", type: "string" },
      { key: "authorName", label: "Author Name", type: "string" },
      { key: "status", label: "Status", type: "enum", options: ["draft", "published", "archived"] },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    description: "Customer reviews and ratings",
    collection: "reviews",
    fields: [
      { key: "guestName", label: "Guest Name", type: "string" },
      { key: "tripName", label: "Trip Name", type: "string", required: true },
      { key: "destination", label: "Destination", type: "string" },
      { key: "rating", label: "Rating", type: "number", required: true, hint: "1–5" },
      { key: "title", label: "Title", type: "string" },
      { key: "content", label: "Content", type: "string", required: true },
      { key: "isApproved", label: "Moderation", type: "enum", options: ["pending", "approved", "rejected"] },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Gallery images",
    collection: "gallery_items",
    fields: [
      { key: "imageUrl", label: "Image URL", type: "string", required: true },
      { key: "title", label: "Title", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "category", label: "Category", type: "string", required: true },
      { key: "location", label: "Location", type: "string" },
      { key: "featured", label: "Featured", type: "enum", options: ["no", "yes"] },
      { key: "aspect", label: "Aspect", type: "enum", options: ["landscape", "portrait", "square"] },
      { key: "isVisible", label: "Visibility", type: "enum", options: ["visible", "hidden"] },
    ],
  },
  {
    id: "contacts",
    label: "Contact Messages",
    description: "Contact form submissions / leads",
    collection: "contactMessages",
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "email", label: "Email", type: "string", required: true },
      { key: "phone", label: "Phone", type: "string" },
      { key: "subject", label: "Subject", type: "string" },
      { key: "message", label: "Message", type: "string", required: true },
      { key: "status", label: "Status", type: "enum", options: ["new", "read", "replied", "archived"] },
    ],
  },
];

function getTable(id: string): ImportTable | undefined {
  return IMPORT_TABLES.find((t) => t.id === id);
}

/* ───────────────────────── Value coercion / validation ───────────────────────── */

function coerceValue(field: ImportField, raw: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
  // Treat empty / null as "not provided"
  if (raw === null || raw === undefined || (typeof raw === "string" && raw.trim() === "")) {
    if (field.required) return { ok: false, error: `${field.label} is required` };
    return { ok: true, value: undefined };
  }

  const str = String(raw).trim();

  switch (field.type) {
    case "string":
      return { ok: true, value: str };

    case "number": {
      const n = Number(str.replace(/,/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: `${field.label} "${str}" is not a number` };
      return { ok: true, value: Math.trunc(n) };
    }

    case "decimal": {
      const n = Number(str.replace(/[$,]/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: `${field.label} "${str}" is not a number` };
      // Drizzle MySQL decimal columns accept string values
      return { ok: true, value: String(n) };
    }

    case "date": {
      // Accept ISO strings, common date formats, or epoch ms/seconds
      let ms: number;
      if (/^\d{10}$/.test(str)) ms = Number(str) * 1000;
      else if (/^\d{13}$/.test(str)) ms = Number(str);
      else {
        const parsed = Date.parse(str);
        if (Number.isNaN(parsed)) return { ok: false, error: `${field.label} "${str}" is not a valid date` };
        ms = parsed;
      }
      return { ok: true, value: ms };
    }

    case "boolean": {
      const truthy = ["true", "1", "yes", "y", "active", "on"];
      return { ok: true, value: truthy.includes(str.toLowerCase()) };
    }

    case "enum": {
      const opts = field.options ?? [];
      const match = opts.find((o) => o.toLowerCase() === str.toLowerCase());
      if (!match) {
        return { ok: false, error: `${field.label} "${str}" must be one of: ${opts.join(", ")}` };
      }
      return { ok: true, value: match };
    }

    default:
      return { ok: true, value: str };
  }
}

export const dataImportRouter = router({
  /**
   * Return the list of importable tables with their field definitions so the
   * client can render a column-mapping UI.
   */
  getImportableTables: protectedProcedure.query(() => {
    return IMPORT_TABLES.map((t) => ({
      id: t.id,
      label: t.label,
      description: t.description,
      fields: t.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: !!f.required,
        options: f.options ?? null,
        hint: f.hint ?? null,
      })),
    }));
  }),

  /**
   * Validate (dry run) a batch of mapped rows without writing to the DB.
   * Returns per-row errors so the admin can fix the source file first.
   */
  validateImport: protectedProcedure
    .input(z.object({
      tableId: z.string(),
      rows: z.array(z.record(z.string(), z.any())),
    }))
    .mutation(({ input }) => {
      const target = getTable(input.tableId);
      if (!target) throw new Error(`Unknown import table: ${input.tableId}`);

      const rowErrors: { row: number; errors: string[] }[] = [];
      input.rows.forEach((row, idx) => {
        const errors: string[] = [];
        for (const field of target.fields) {
          const result = coerceValue(field, row[field.key]);
          if (!result.ok) errors.push(result.error);
        }
        if (errors.length) rowErrors.push({ row: idx + 1, errors });
      });

      return {
        totalRows: input.rows.length,
        validRows: input.rows.length - rowErrors.length,
        invalidRows: rowErrors.length,
        rowErrors: rowErrors.slice(0, 100),
      };
    }),

  /**
   * Import mapped rows into the target table. Each row is coerced/validated;
   * invalid rows are skipped (with reasons) and valid rows inserted.
   */
  importRecords: protectedProcedure
    .input(z.object({
      tableId: z.string(),
      rows: z.array(z.record(z.string(), z.any())),
      skipInvalid: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const target = getTable(input.tableId);
      if (!target) throw new Error(`Unknown import table: ${input.tableId}`);

      let imported = 0;
      let skipped = 0;
      let failed = 0;
      const errors: { row: number; message: string }[] = [];

      for (let i = 0; i < input.rows.length; i++) {
        const row = input.rows[i];
        const record: Record<string, unknown> = {};
        const rowIssues: string[] = [];

        for (const field of target.fields) {
          const result = coerceValue(field, row[field.key]);
          if (!result.ok) {
            rowIssues.push(result.error);
          } else if (result.value !== undefined) {
            record[field.key] = result.value;
          }
        }

        if (rowIssues.length) {
          if (input.skipInvalid) {
            skipped++;
            errors.push({ row: i + 1, message: rowIssues.join("; ") });
            continue;
          } else {
            failed++;
            errors.push({ row: i + 1, message: rowIssues.join("; ") });
            continue;
          }
        }

        try {
          await insert(target.collection, record as Record<string, any>);
          imported++;
        } catch (e: any) {
          failed++;
          errors.push({ row: i + 1, message: e?.message || "Insert failed" });
        }
      }

      return {
        success: failed === 0,
        importedAt: new Date().toISOString(),
        tableId: input.tableId,
        totalRows: input.rows.length,
        imported,
        skipped,
        failed,
        errors: errors.slice(0, 100),
      };
    }),
});
