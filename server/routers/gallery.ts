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
      return snap.docs.map((d) => {
        const data = d.data();
        console.log(`[Gallery] Item data:`, { id: data.id, imageUrl: data.imageUrl, title: data.title });
        return { ...data, _docId: d.id };
      });
    } catch (indexErr) {
      const errMsg = indexErr instanceof Error ? indexErr.message : String(indexErr);
      const isIndexError = errMsg.includes("index") || errMsg.includes("requires an index") || errMsg.includes("FAILED_PRECONDITION");
      if (!isIndexError) {
        console.error("[Gallery] listVisible: Unexpected query error (not an index issue):", errMsg);
        throw indexErr;
      }
      console.warn('[Gallery] listVisible: Index query failed, falling back to client-side filter:', errMsg);
      const snap = await db.collection(ITEMS_COL)
        .orderBy("createdAt", "desc")
        .get();
      const filtered = snap.docs
        .map((d) => {
          const data = d.data();
          return { ...data, _docId: d.id };
        })
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
      return snap.docs.map((d) => {
        const data = d.data();
        return { ...data, _docId: d.id };
      });
    } catch (indexErr) {
      const errMsg = indexErr instanceof Error ? indexErr.message : String(indexErr);
      const isIndexError = errMsg.includes("index") || errMsg.includes("requires an index") || errMsg.includes("FAILED_PRECONDITION");
      if (!isIndexError) {
        console.error("[Gallery] listVisibleVideos: Unexpected query error (not an index issue):", errMsg);
        throw indexErr;
      }
      console.warn('[Gallery] listVisibleVideos: Index query failed, falling back to client-side filter:', errMsg);
      const snap = await db.collection(VIDEOS_COL)
        .orderBy("createdAt", "desc")
        .get();
      const filtered = snap.docs
        .map((d) => {
          const data = d.data();
          return { ...data, _docId: d.id };
        })
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
      // Search by Firebase document ID (which is _docId)
      const snap = await db.collection(ITEMS_COL).limit(1000).get();
      let found = false;
      let docRef: any = null;
      
      for (const doc of snap.docs) {
        const docData = doc.data();
        if (docData._docId === id || doc.id === id) {
          docRef = doc.ref;
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error(`Gallery item not found: ${id}`);
      }
      
      await docRef.set(data, { merge: true });
      const updated = (await docRef.get()).data();
      console.log(`[Gallery] Updated item: docId=${docRef.id}`);
      return { ...updated, _docId: docRef.id };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Search through all documents to find the one with matching _docId or Firebase doc ID
      const snap = await db.collection(ITEMS_COL).limit(1000).get();
      for (const doc of snap.docs) {
        const docData = doc.data();
        if (docData._docId === input.id || doc.id === input.id) {
          await doc.ref.delete();
          console.log(`[Gallery] Deleted item: docId=${doc.id}`);
          return { success: true };
        }
      }
      throw new Error(`Gallery item not found: ${input.id}`);
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
      // Search by Firebase document ID
      const snap = await db.collection(VIDEOS_COL).limit(1000).get();
      let found = false;
      let docRef: any = null;
      
      for (const doc of snap.docs) {
        const docData = doc.data();
        if (docData._docId === id || doc.id === id) {
          docRef = doc.ref;
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error(`Gallery video not found: ${id}`);
      }
      
      await docRef.set(data, { merge: true });
      const updated = (await docRef.get()).data();
      console.log(`[Gallery] Updated video: docId=${docRef.id}`);
      return { ...updated, _docId: docRef.id };
    }),

  deleteVideo: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Search through all documents to find the one with matching _docId or Firebase doc ID
      const snap = await db.collection(VIDEOS_COL).limit(1000).get();
      for (const doc of snap.docs) {
        const docData = doc.data();
        if (docData._docId === input.id || doc.id === input.id) {
          await doc.ref.delete();
          console.log(`[Gallery] Deleted video: docId=${doc.id}`);
          return { success: true };
        }
      }
      throw new Error(`Gallery video not found: ${input.id}`);
    }),
});
