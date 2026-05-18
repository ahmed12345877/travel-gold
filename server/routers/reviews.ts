import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import {
  createReview,
  getApprovedReviews,
  getAllReviews,
  getReviewById,
  updateReviewApproval,
  addAdminReply,
  incrementHelpfulCount,
  getReviewStats,
  getDb,
} from "../db";
import { eq, desc } from "drizzle-orm";
import { reviews } from "../../drizzle/schema";

export const reviewsRouter = router({
  /** List approved reviews (public) */
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      return getApprovedReviews(limit, offset);
    }),

  /** Get review stats (public) */
  stats: publicProcedure.query(async () => {
    return getReviewStats();
  }),

  /** Get single review by ID (public) */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getReviewById(input.id);
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createReview({
        ...input,
        userId: ctx.user?.id ?? null,
        isApproved: "pending",
        helpfulCount: 0,
      });
    }),

  /** Get current user's reviews */
  myReviews: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, ctx.user.id))
      .orderBy(desc(reviews.createdAt));
  }),

  /** Mark review as helpful (public) */
  markHelpful: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return incrementHelpfulCount(input.id);
    }),

  /** List all reviews including pending (admin only) */
  listAll: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      return getAllReviews(limit, offset);
    }),

  /** Approve or reject a review (admin only) */
  moderate: adminProcedure
    .input(
      z.object({
        id: z.number(),
        isApproved: z.enum(["pending", "approved", "rejected"]),
      }),
    )
    .mutation(async ({ input }) => {
      return updateReviewApproval(input.id, input.isApproved);
    }),

  /** Add admin reply to a review (admin only) */
  reply: adminProcedure
    .input(
      z.object({
        id: z.number(),
        adminReply: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return addAdminReply(input.id, input.adminReply);
    }),
});
