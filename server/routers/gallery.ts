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
    try {
      // Try the indexed query first
      const snap = await db.collection(ITEMS_COL)
        .where("isVisible", "==", "visible")
        .orderBy("sortOrder", "asc")
        .get();
      console.log(`[Gallery] listVisible: Found ${snap.docs.length} items (with index)`);
      return snap.docs.map((d) => ({...d.data(), id: d.id}));
    } catch (indexErr) {
      console.warn('[Gallery] listVisible: Index query failed, falling back to client-side filter', (indexErr as Error).message);
      // Fallback: get all items and filter client-side
      const snap = await db.collection(ITEMS_COL)
        .orderBy("createdAt", "desc")
        .get();
      const filtered = snap.docs
        .map((d) => ({...d.data(), id: d.id}))
        .filter((item: any) => item.isVisible === "visible")
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
      console.log(`[Gallery] listVisible: Found ${filtered.length} items (fallback)`);
      return filtered;
    }
  }),

  listVisibleVideos: publicProcedure.query(async () => {
    try {
      // Try the indexed query first
      const snap = await db.collection(VIDEOS_COL)
        .where("isVisible", "==", "visible")
        .orderBy("sortOrder", "asc")
        .get();
      console.log(`[Gallery] listVisibleVideos: Found ${snap.docs.length} items (with index)`);
      return snap.docs.map((d) => ({...d.data(), id: d.id}));
    } catch (indexErr) {
      console.warn('[Gallery] listVisibleVideos: Index query failed, falling back to client-side filter', (indexErr as Error).message);
      // Fallback: get all items and filter client-side
      const snap = await db.collection(VIDEOS_COL)
        .orderBy("createdAt", "desc")
        .get();
      const filtered = snap.docs
        .map((d) => ({...d.data(), id: d.id}))
        .filter((item: any) => item.isVisible === "visible")
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
      console.log(`[Gallery] listVisibleVideos: Found ${filtered.length} items (fallback)`);
      return filtered;
    }
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
      const id = Date.now();
      const item = {
        ...input,
        id,
        isVisible: "visible",
        createdAt: new Date(),
      };
      const docRef = await db.collection(ITEMS_COL).add(item);
      console.log(`[Gallery] Created new item: id=${id}, docId=${docRef.id}`);
      return { ...item, _docId: docRef.id };
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
      const docRef = snap.docs[0].ref;
      await docRef.set(data, { merge: true });
      const updated = (await docRef.get()).data();
      console.log(`[Gallery] Updated item: id=${id}, docId=${docRef.id}`);
      return { ...updated, _docId: docRef.id };
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
      const id = Date.now();
      const video = {
        ...input,
        id,
        isVisible: "visible",
        createdAt: new Date(),
      };
      const docRef = await db.collection(VIDEOS_COL).add(video);
      console.log(`[Gallery] Created new video: id=${id}, docId=${docRef.id}`);
      return { ...video, _docId: docRef.id };
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
      const docRef = snap.docs[0].ref;
      await docRef.set(data, { merge: true });
      const updated = (await docRef.get()).data();
      console.log(`[Gallery] Updated video: id=${id}, docId=${docRef.id}`);
      return { ...updated, _docId: docRef.id };
    }),

  deleteVideo: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const snap = await db.collection(VIDEOS_COL).where("id", "==", input.id).limit(1).get();
      if (!snap.empty) await snap.docs[0].ref.delete();
      return { success: true };
    }),
});
