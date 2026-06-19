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
  updateUserProfile,
} from "../db";
import { count } from "../_core/firestore-db";

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
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const { limit = 50, offset = 0 } = input ?? {};
        const [usersList, total] = await Promise.all([
          getAllUsers(limit, offset),
          getUsersCount(),
        ]);
        console.log(`[users.list] retrieved ${usersList.length} users out of ${total} total`);
        return {
          users: usersList,
          total,
          limit,
          offset,
        };
      } catch (error) {
        console.error("[users.list] query error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }),

  // Get single user by ID (admin only)
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const user = await getUserById(input.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        console.log(`[users.getById] retrieved user: id=${input.id}`);
        return user;
      } catch (error) {
        console.error("[users.getById] query error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  // Update user role (admin only)
  updateRole: adminProcedure
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const user = await updateUserRole(input.id, input.role);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        console.log(`[users.updateRole] updated user: id=${input.id}, role=${input.role}`);
        return user;
      } catch (error) {
        console.error("[users.updateRole] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
          role: input.role,
        });
        throw error;
      }
    }),

  // Search users (admin only)
  search: adminProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await searchUsers(input.query, input.limit);
        console.log(`[users.search] found ${results.length} users matching: ${input.query}`);
        return results;
      } catch (error) {
        console.error("[users.search] query error:", {
          error: error instanceof Error ? error.message : String(error),
          query: input.query,
        });
        throw error;
      }
    }),

  // Get user statistics (admin only)
  stats: adminProcedure.query(async () => {
    try {
      const stats = await getUserStats();
      console.log("[users.stats] retrieved user statistics");
      return stats;
    } catch (error) {
      console.error("[users.stats] query error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),

  // Get current user profile
  profile: protectedProcedure.query(async ({ ctx }) => {
    try {
      console.log(`[users.profile] retrieved profile for user: ${ctx.user.id}`);
      return ctx.user;
    } catch (error) {
      console.error("[users.profile] query error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),

  // Update current user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        phone: z.string().max(32).nullable().optional(),
        avatarUrl: z.string().url().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updated = await updateUserProfile(ctx.user.id, input);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        console.log(`[users.updateProfile] updated profile for user: ${ctx.user.id}`);
        return updated;
      } catch (error) {
        console.error("[users.updateProfile] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          userId: ctx.user.id,
        });
        throw error;
      }
    }),

  // Get profile stats for current user (bookings count, reviews count, AI credits)
  profileStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    let bookingsCount = 0;
    let reviewsCount = 0;
    let aiCreditsBalance = 0;

    try {
      try {
        const userBookings = await getUserBookings(userId);
        bookingsCount = userBookings.length;
      } catch (error) {
        console.warn("[users.profileStats] Failed to fetch bookings (table may not exist):", error instanceof Error ? error.message : String(error));
      }

      try {
        reviewsCount = await count("reviews", [["userId", "==", userId]]);
      } catch (error) {
        console.warn("[users.profileStats] Failed to count reviews (collection may not exist):", error instanceof Error ? error.message : String(error));
      }

      try {
        const credits = await getOrCreateAICredits(userId);
        aiCreditsBalance = parseFloat(credits.balance.toString());
      } catch (error) {
        console.warn("[users.profileStats] Failed to fetch AI credits (table may not exist):", error instanceof Error ? error.message : String(error));
      }

      console.log(`[users.profileStats] retrieved stats for user: ${userId}, bookings=${bookingsCount}, reviews=${reviewsCount}`);

      return {
        bookings: bookingsCount,
        reviews: reviewsCount,
        aiCredits: aiCreditsBalance,
      };
    } catch (error) {
      console.error("[users.profileStats] query error:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
      throw error;
    }
  }),
});
