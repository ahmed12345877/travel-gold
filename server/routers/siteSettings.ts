import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, adminProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { list, getSettingValue, setSettingValue, firestore } from "../_core/firestore-db";

const DESIGN_VERSION_CATEGORIES = new Set(["hero", "theme", "media"]);

const HeroSettingsSchema = z
  .object({
    backgroundType: z.enum(["static-image", "html5-video", "dynamic-slider"]).optional(),
    sliderEngine: z.enum(["framer-motion", "swiper", "splide"]).optional(),
    sliderEffect: z.enum(["fade", "cube", "flip", "coverflow", "creative"]).optional(),
    autoplayMs: z.number().int().min(1000).max(15000).optional(),
    loopSlides: z.boolean().optional(),
    textFadeInEnabled: z.boolean().optional(),
    textFadeInDuration: z.number().int().min(150).max(5000).optional(),
  })
  .passthrough();

const MediaDisplaySchema = z
  .object({
    layout: z
      .enum(["dynamic-grid", "masonry", "swiper-carousel", "grid-lightbox", "isotope-filter"])
      .default("dynamic-grid"),
    aspectRatio: z.enum(["square", "landscape", "portrait", "original"]).default("original"),
  })
  .passthrough();

const ThemeDesignSchema = z
  .object({
    palettePreset: z.enum(["light", "dark", "luxury-gold", "minimalist-tailwind"]).default("luxury-gold"),
    radiusPreset: z.enum(["sharp", "soft", "glass"]).default("soft"),
    shadowPreset: z.enum(["none", "soft", "glass"]).default("soft"),
  })
  .passthrough();

const DesignVersionSchema = z.object({
  id: z.string(),
  createdAt: z.date().nullable().optional(),
  createdBy: z.union([z.number(), z.string()]).nullable().optional(),
  reason: z.string().optional(),
  snapshot: z.record(z.string(), z.record(z.string(), z.string())),
});

function parseAndSanitize(category: string, key: string, value: string): string {
  if ((category !== "hero" || (key !== "hero_data" && key !== "hero_settings")) && !(category === "media" && key === "gallery_display") && !(category === "theme" && key === "design_tokens")) {
    return value;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid JSON payload." });
  }

  if (category === "hero") {
    const validated = HeroSettingsSchema.safeParse(parsed);
    if (!validated.success) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid hero settings payload." });
    return JSON.stringify(validated.data);
  }

  if (category === "media" && key === "gallery_display") {
    const validated = MediaDisplaySchema.safeParse(parsed);
    if (!validated.success) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid media display settings payload." });
    return JSON.stringify(validated.data);
  }

  const validated = ThemeDesignSchema.safeParse(parsed);
  if (!validated.success) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid theme design payload." });
  return JSON.stringify(validated.data);
}

async function collectCategorySettings(category: string): Promise<Record<string, string>> {
  const rows = (await list("siteSettings", {
    where: [["category", "==", category]],
  })) as any[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.settingKey] = row.settingValue ?? "";
  }
  return settings;
}

async function createDesignVersion(reason: string, createdBy?: number | string | null) {
  const snapshot: Record<string, Record<string, string>> = {};
  for (const category of DESIGN_VERSION_CATEGORIES) {
    snapshot[category] = await collectCategorySettings(category);
  }

  await firestore.collection("design_versions").add({
    reason,
    snapshot,
    createdBy: createdBy ?? null,
    createdAt: new Date(),
  });
}

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
   * Design versions list
   */
  listDesignVersions: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;
      const snap = await firestore
        .collection("design_versions")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      return snap.docs.map((doc) => {
        const parsed = DesignVersionSchema.safeParse({ id: doc.id, ...doc.data() });
        if (!parsed.success) return null;
        return parsed.data;
      }).filter(Boolean);
    }),

  /**
   * Rollback to a design version snapshot
   */
  rollbackDesignVersion: adminProcedure
    .input(z.object({ versionId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const versionRef = firestore.collection("design_versions").doc(input.versionId);
      const versionSnap = await versionRef.get();
      if (!versionSnap.exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Design version not found." });
      }

      const parsed = DesignVersionSchema.safeParse({ id: versionSnap.id, ...versionSnap.data() });
      if (!parsed.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid design version snapshot." });
      }

      for (const [category, settings] of Object.entries(parsed.data.snapshot)) {
        for (const [key, rawValue] of Object.entries(settings)) {
          const sanitized = parseAndSanitize(category, key, rawValue);
          await setSettingValue(category, key, sanitized, ctx.user.id);
        }
      }

      await createDesignVersion(`Rollback to version ${input.versionId}`, ctx.user.id);

      return { success: true };
    }),

  /**
   * Set a single setting (upsert)
   */
  set: adminProcedure
    .input(z.object({ category: z.string(), key: z.string(), value: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const sanitized = parseAndSanitize(input.category, input.key, input.value);
      await setSettingValue(input.category, input.key, sanitized, ctx.user.id);
      if (DESIGN_VERSION_CATEGORIES.has(input.category)) {
        await createDesignVersion(`Updated ${input.category}.${input.key}`, ctx.user.id);
      }
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
        const sanitized = parseAndSanitize(input.category, key, value);
        await setSettingValue(input.category, key, sanitized, ctx.user.id);
      }
      if (DESIGN_VERSION_CATEGORIES.has(input.category)) {
        await createDesignVersion(`Updated ${input.category} settings`, ctx.user.id);
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
