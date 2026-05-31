import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import {
  createGalleryItem,
  getVisibleGalleryItems,
  getAllGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
  createGalleryVideo,
  getVisibleGalleryVideos,
  getAllGalleryVideos,
  getGalleryVideoById,
  updateGalleryVideo,
  deleteGalleryVideo,
} from "../db";

export const galleryRouter = router({
  // ─── Public Endpoints ───

  /** List visible gallery items (public) */
  listVisible: publicProcedure.query(async () => {
    return getVisibleGalleryItems();
  }),

  /** List visible gallery videos (public) */
  listVisibleVideos: publicProcedure.query(async () => {
    return getVisibleGalleryVideos();
  }),

  // ─── Admin Endpoints: Gallery Items ───

  /** List all gallery items (admin) */
  listAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(100),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 100, offset = 0 } = input ?? {};
      return getAllGalleryItems(limit, offset);
    }),

  /** Create a gallery item (admin) */
  create: adminProcedure
    .input(
      z.object({
        imageUrl: z.string().min(1),
        title: z.string().min(1),
        titleAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        category: z.string().min(1),
        categoryAr: z.string().optional(),
        location: z.string().optional(),
        locationAr: z.string().optional(),
        featured: z.enum(["yes", "no"]).default("no"),
        aspect: z.enum(["landscape", "portrait", "square"]).default("landscape"),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      return createGalleryItem({
        ...input,
        isVisible: "visible",
      });
    }),

  /** Update a gallery item (admin) */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        imageUrl: z.string().optional(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        category: z.string().optional(),
        categoryAr: z.string().optional(),
        location: z.string().optional(),
        locationAr: z.string().optional(),
        featured: z.enum(["yes", "no"]).optional(),
        aspect: z.enum(["landscape", "portrait", "square"]).optional(),
        sortOrder: z.number().optional(),
        isVisible: z.enum(["visible", "hidden"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateGalleryItem(id, data);
    }),

  /** Delete a gallery item (admin) */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteGalleryItem(input.id);
      return { success: true };
    }),

  /** Upload gallery image (admin) */
  uploadImage: adminProcedure
    .input(
      z.object({
        fileData: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      if (buffer.length > 10 * 1024 * 1024) {
        throw new Error("حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
      }

      const ext = input.filename.split(".").pop() || "jpg";
      const randomSuffix = nanoid(8);
      const fileKey = `gallery/${randomSuffix}.${ext}`;

      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      return { url, fileKey };
    }),

  // ─── Admin Endpoints: Gallery Videos ───

  /** List all gallery videos (admin) */
  listAllVideos: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      return getAllGalleryVideos(limit, offset);
    }),

  /** Create a gallery video (admin) */
  createVideo: adminProcedure
    .input(
      z.object({
        thumbnailUrl: z.string().min(1),
        title: z.string().min(1),
        titleAr: z.string().optional(),
        youtubeId: z.string().min(1),
        duration: z.string().optional(),
        views: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      return createGalleryVideo({
        ...input,
        isVisible: "visible",
      });
    }),

  /** Update a gallery video (admin) */
  updateVideo: adminProcedure
    .input(
      z.object({
        id: z.number(),
        thumbnailUrl: z.string().optional(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        youtubeId: z.string().optional(),
        duration: z.string().optional(),
        views: z.string().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.enum(["visible", "hidden"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateGalleryVideo(id, data);
    }),

  /** Delete a gallery video (admin) */
  deleteVideo: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteGalleryVideo(input.id);
      return { success: true };
    }),
});
