import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllUsers,
  getUsersCount,
  getUserById,
  updateUserRole,
  searchUsers,
  getUserStats,
  getUserBookings,
  getOrCreateAICredits,
  getDb,
  updateUserProfile,
} from "../db";
import { eq, sql } from "drizzle-orm";
import { reviews } from "../../drizzle/schema";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

export const usersRouter = router({
  // Get all users (admin only)
  list: adminProcedure
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
      const [usersList, total] = await Promise.all([
        getAllUsers(limit, offset),
        getUsersCount(),
      ]);
      return {
        users: usersList,
        total,
        limit,
        offset,
      };
    }),

  // Get single user by ID (admin only)
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return user;
    }),

  // Update user role (admin only)
  updateRole: adminProcedure
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await updateUserRole(input.id, input.role);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return user;
    }),

  // Search users (admin only)
  search: adminProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      return searchUsers(input.query, input.limit);
    }),

  // Get user statistics (admin only)
  stats: adminProcedure.query(async () => {
    return getUserStats();
  }),

  // Get current user profile
  profile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Update current user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        phone: z.string().max(32).nullable().optional(),
        avatarUrl: z.string().url().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await updateUserProfile(ctx.user.id, input);
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return updated;
    }),

  // Get profile stats for current user (bookings count, reviews count, AI credits)
  profileStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    let bookingsCount = 0;
    let reviewsCount = 0;
    let aiCreditsBalance = 0;

    try {
      const userBookings = await getUserBookings(userId);
      bookingsCount = userBookings.length;
    } catch {
      // bookings table might not exist yet
    }

    try {
      const db = await getDb();
      if (db) {
        const userReviews = await db
          .select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(eq(reviews.userId, userId));
        reviewsCount = userReviews[0]?.count ?? 0;
      }
    } catch {
      // reviews table might not exist yet
    }

    try {
      const credits = await getOrCreateAICredits(userId);
      aiCreditsBalance = parseFloat(credits.balance.toString());
    } catch {
      // AI credits table might not exist yet
    }

    return {
      bookings: bookingsCount,
      reviews: reviewsCount,
      aiCredits: aiCreditsBalance,
    };
  }),
});
