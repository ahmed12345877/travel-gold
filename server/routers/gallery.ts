import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { db } from "../_core/firebaseAdmin";

const ITEMS_COL = "gallery_items";
const VIDEOS_COL = "gallery_videos";

export const galleryRouter = router({
  // ─── Public Endpoints ───

  listVisible: publicProcedure.query(async () => {
    const snap = await db.collection(ITEMS_COL)
      .where("isVisible", "==", "visible")
      .orderBy("sortOrder", "asc")
      .get();
    return snap.docs.map((d) => d.data());
  }),

  listVisibleVideos: publicProcedure.query(async () => {
    const snap = await db.collection(VIDEOS_COL)
      .where("isVisible", "==", "visible")
      .orderBy("sortOrder", "asc")
      .get();
    return snap.docs.map((d) => d.data());
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
      return snap.docs.map((d) => d.data());
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
      const id = Date.now();
      const item = {
        ...input,
        id,
        isVisible: "visible",
        createdAt: new Date(),
      };
      await db.collection(ITEMS_COL).add(item);
      return item;
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
      const snap = await db.collection(ITEMS_COL).where("id", "==", id).limit(1).get();
      if (snap.empty) throw new Error("Gallery item not found");
      await snap.docs[0].ref.set(data, { merge: true });
      const updated = (await snap.docs[0].ref.get()).data();
      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const snap = await db.collection(ITEMS_COL).where("id", "==", input.id).limit(1).get();
      if (!snap.empty) await snap.docs[0].ref.delete();
      return { success: true };
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
      return snap.docs.map((d) => d.data());
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
      const id = Date.now();
      const video = {
        ...input,
        id,
        isVisible: "visible",
        createdAt: new Date(),
      };
      await db.collection(VIDEOS_COL).add(video);
      return video;
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
      const snap = await db.collection(VIDEOS_COL).where("id", "==", id).limit(1).get();
      if (snap.empty) throw new Error("Gallery video not found");
      await snap.docs[0].ref.set(data, { merge: true });
      const updated = (await snap.docs[0].ref.get()).data();
      return updated;
    }),

  deleteVideo: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const snap = await db.collection(VIDEOS_COL).where("id", "==", input.id).limit(1).get();
      if (!snap.empty) await snap.docs[0].ref.delete();
      return { success: true };
    }),
});
