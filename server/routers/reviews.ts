import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import { db } from "../_core/firebaseAdmin";
import type { Timestamp, DocumentData } from "firebase-admin/firestore";

function toDateValue(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof (v as Timestamp).toDate === "function") return (v as Timestamp).toDate();
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") return new Date(v);
  return null;
}

function docToReview(docId: string, data: DocumentData) {
  return {
    id: docId,
    tripName: data.tripName ?? "",
    destination: data.destination ?? null,
    rating: data.rating ?? 0,
    title: data.title ?? null,
    content: data.content ?? "",
    photoUrls: data.photoUrls ?? [],
    travelDate: data.travelDate ?? null,
    guestName: data.guestName ?? null,
    guestAvatarUrl: data.guestAvatarUrl ?? null,
    userId: data.userId ?? null,
    isApproved: data.isApproved ?? "pending",
    helpfulCount: data.helpfulCount ?? 0,
    adminReply: data.adminReply ?? null,
    adminReplyAt: toDateValue(data.adminReplyAt),
    createdAt: toDateValue(data.createdAt),
    updatedAt: toDateValue(data.updatedAt),
  };
}

export const reviewsRouter = router({
  /** List approved reviews (public) */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50 } = input ?? {};
      const snap = await db
        .collection("reviews")
        .where("isApproved", "==", "approved")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();
      return snap.docs.map((d) => docToReview(d.id, d.data()));
    }),

  /** Get review stats (public) */
  stats: publicProcedure.query(async () => {
    const snap = await db
      .collection("reviews")
      .where("isApproved", "==", "approved")
      .get();

    const all = snap.docs.map((d) => d.data());
    const total = all.length;
    if (total === 0) {
      return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const sum = all.reduce((acc, r) => acc + (r.rating ?? 0), 0);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    all.forEach((r) => {
      const rating = r.rating;
      if (rating >= 1 && rating <= 5) distribution[rating]++;
    });

    return { total, average: Math.round((sum / total) * 10) / 10, distribution };
  }),

  /** Get single review by ID (public) */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const snap = await db.collection("reviews").doc(input.id).get();
      if (!snap.exists) return null;
      return docToReview(snap.id, snap.data()!);
    }),

  /** Create a new review (public - guests can review too) */
  create: publicProcedure
    .input(
      z.object({
        tripName: z.string().min(1),
        destination: z.string().optional(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        content: z.string().min(10),
        photoUrls: z.array(z.string()).optional(),
        travelDate: z.number().optional(),
        guestName: z.string().optional(),
        guestAvatarUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const docData = {
        ...input,
        userId: ctx.user?.openId ?? null,
        isApproved: "pending",
        helpfulCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      const ref = await db.collection("reviews").add(docData);
      return docToReview(ref.id, docData);
    }),

  /** Get current user's reviews */
  myReviews: protectedProcedure.query(async ({ ctx }) => {
    const snap = await db
      .collection("reviews")
      .where("userId", "==", ctx.user.openId)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => docToReview(d.id, d.data()));
  }),

  /** Mark review as helpful (public) */
  markHelpful: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const ref = db.collection("reviews").doc(input.id);
      const snap = await ref.get();
      if (!snap.exists) return null;
      const current = snap.data()!.helpfulCount ?? 0;
      await ref.update({ helpfulCount: current + 1 });
      const updated = await ref.get();
      return docToReview(updated.id, updated.data()!);
    }),

  /** List all reviews including pending (admin only) */
  listAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50 } = input ?? {};
      const snap = await db
        .collection("reviews")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();
      return snap.docs.map((d) => docToReview(d.id, d.data()));
    }),

  /** Approve or reject a review (admin only) */
  moderate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isApproved: z.enum(["pending", "approved", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const ref = db.collection("reviews").doc(input.id);
      await ref.update({ isApproved: input.isApproved, updatedAt: new Date() });
      const snap = await ref.get();
      if (!snap.exists) return null;
      return docToReview(snap.id, snap.data()!);
    }),

  /** Add admin reply to a review (admin only) */
  reply: adminProcedure
    .input(
      z.object({
        id: z.string(),
        adminReply: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const ref = db.collection("reviews").doc(input.id);
      await ref.update({
        adminReply: input.adminReply,
        adminReplyAt: new Date(),
        updatedAt: new Date(),
      });
      const snap = await ref.get();
      if (!snap.exists) return null;
      return docToReview(snap.id, snap.data()!);
    }),
});
