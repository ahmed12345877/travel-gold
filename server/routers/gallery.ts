import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import { storagePut } from "../storage";
import { db } from "../_core/firebaseAdmin";
import { decodeAndValidateUpload } from "../utils/uploadHelper";
import {
  listVisibleFromCollection,
  updateDocById,
  deleteDocById,
} from "../utils/galleryCollectionHelper";

const ITEMS_COL = "gallery_items";
const VIDEOS_COL = "gallery_videos";

export const galleryRouter = router({
  // ─── Public Endpoints ───

  listVisible: publicProcedure.query(async () => {
    return listVisibleFromCollection(ITEMS_COL, "listVisible");
  }),

  listVisibleVideos: publicProcedure.query(async () => {
    return listVisibleFromCollection(VIDEOS_COL, "listVisibleVideos");
  }),

  // ─── Admin Endpoints: Gallery Items ───

  listAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(100),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 100, offset = 0 } = input ?? {};
      const snap = await db.collection(ITEMS_COL)
        .orderBy("createdAt", "desc")
        .offset(offset)
        .limit(limit)
        .get();
      return snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
    }),

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
      const docRef = await db.collection(ITEMS_COL).add({
        ...input,
        isVisible: "visible",
        createdAt: new Date(),
      });
      const doc = await docRef.get();
      const data = doc.data();
      console.log(`[Gallery] Created new item: docId=${docRef.id}, imageUrl=${input.imageUrl}`);
      return { ...data, _docId: docRef.id };
    }),

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
      return updateDocById(ITEMS_COL, "item", id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteDocById(ITEMS_COL, "item", input.id);
    }),

  uploadImage: adminProcedure
    .input(
      z.object({
        fileData: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { buffer, fileKey } = decodeAndValidateUpload(
        input.fileData,
        input.filename,
        "gallery",
      );
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      return { url, fileKey };
    }),

  // ─── Admin Endpoints: Gallery Videos ───

  listAllVideos: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      const snap = await db.collection(VIDEOS_COL)
        .orderBy("createdAt", "desc")
        .offset(offset)
        .limit(limit)
        .get();
      return snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
    }),

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
      const docRef = await db.collection(VIDEOS_COL).add({
        ...input,
        isVisible: "visible",
        createdAt: new Date(),
      });
      const doc = await docRef.get();
      const data = doc.data();
      console.log(`[Gallery] Created new video: docId=${docRef.id}, youtubeId=${input.youtubeId}`);
      return { ...data, _docId: docRef.id };
    }),

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
      return updateDocById(VIDEOS_COL, "video", id, data);
    }),

  deleteVideo: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteDocById(VIDEOS_COL, "video", input.id);
    }),
});
