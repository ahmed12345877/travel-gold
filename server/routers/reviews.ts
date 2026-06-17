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
} from "../db";
import { list } from "../_core/firestore-db";

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
      try {
        const { limit = 50, offset = 0 } = input ?? {};
        const reviews = await getApprovedReviews(limit, offset);
        console.log(`[reviews.list] retrieved ${reviews.length} approved reviews`);
        return reviews;
      } catch (error) {
        console.error("[reviews.list] query error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }),

  /** Get review stats (public) */
  stats: publicProcedure.query(async () => {
    try {
      const stats = await getReviewStats();
      console.log("[reviews.stats] retrieved review statistics");
      return stats;
    } catch (error) {
      console.error("[reviews.stats] query error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),

  /** Get single review by ID (public) */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const review = await getReviewById(input.id);
        console.log(`[reviews.getById] retrieved review: id=${input.id}`);
        return review;
      } catch (error) {
        console.error("[reviews.getById] query error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
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
      try {
        const review = await createReview({
          ...input,
          userId: ctx.user?.id ?? null,
          isApproved: "pending",
          helpfulCount: 0,
        });
        console.log(`[reviews.create] created review: tripName=${input.tripName}, rating=${input.rating}`);
        return review;
      } catch (error) {
        console.error("[reviews.create] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          tripName: input.tripName,
        });
        throw error;
      }
    }),

  /** Get current user's reviews */
  myReviews: protectedProcedure.query(async ({ ctx }) => {
    try {
      const reviews = await list("reviews", {
        where: [["userId", "==", ctx.user.id]],
        orderBy: [["createdAt", "desc"]],
      });
      console.log(`[reviews.myReviews] retrieved ${reviews.length} reviews for user: ${ctx.user.id}`);
      return reviews;
    } catch (error) {
      console.error("[reviews.myReviews] query error:", {
        error: error instanceof Error ? error.message : String(error),
        userId: ctx.user.id,
      });
      throw error;
    }
  }),

  /** Mark review as helpful (public) */
  markHelpful: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const result = await incrementHelpfulCount(input.id);
        console.log(`[reviews.markHelpful] marked review as helpful: id=${input.id}`);
        return result;
      } catch (error) {
        console.error("[reviews.markHelpful] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
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
      try {
        const { limit = 50, offset = 0 } = input ?? {};
        const reviews = await getAllReviews(limit, offset);
        console.log(`[reviews.listAll] retrieved ${reviews.length} reviews (including pending)`);
        return reviews;
      } catch (error) {
        console.error("[reviews.listAll] query error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }),

  /** Approve or reject a review (admin only) */
  moderate: adminProcedure
    .input(
      z.object({
        id: z.number(),
        isApproved: z.enum(["pending", "approved", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updateReviewApproval(input.id, input.isApproved);
        console.log(`[reviews.moderate] updated review approval: id=${input.id}, status=${input.isApproved}`);
        return result;
      } catch (error) {
        console.error("[reviews.moderate] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Add admin reply to a review (admin only) */
  reply: adminProcedure
    .input(
      z.object({
        id: z.number(),
        adminReply: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await addAdminReply(input.id, input.adminReply);
        console.log(`[reviews.reply] added admin reply to review: id=${input.id}`);
        return result;
      } catch (error) {
        console.error("[reviews.reply] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),
});
