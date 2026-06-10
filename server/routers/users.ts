import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
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

function docToUser(docId: string, data: DocumentData) {
  return {
    id: docId,
    openId: data.openId ?? docId,
    name: data.name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    avatarUrl: data.avatarUrl ?? null,
    role: (data.role as "user" | "admin") ?? "user",
    loginMethod: data.loginMethod ?? null,
    createdAt: toDateValue(data.createdAt),
    lastSignedIn: toDateValue(data.lastSignedIn),
    updatedAt: toDateValue(data.updatedAt),
  };
}

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
      const { limit = 50 } = input ?? {};

      const [pageSnap, countSnap] = await Promise.all([
        db.collection("users").orderBy("createdAt", "desc").limit(limit).get(),
        db.collection("users").count().get(),
      ]);

      const users = pageSnap.docs.map((d) => docToUser(d.id, d.data()));
      const total = countSnap.data().count;

      return { users, total, limit, offset: input?.offset ?? 0 };
    }),

  // Get single user by ID (admin only)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const snap = await db.collection("users").doc(input.id).get();
      if (!snap.exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      return docToUser(snap.id, snap.data()!);
    }),

  // Update user role (admin only)
  updateRole: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const ref = db.collection("users").doc(input.id);
      const snap = await ref.get();
      if (!snap.exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      await ref.update({ role: input.role, updatedAt: new Date() });
      const updated = await ref.get();
      return docToUser(updated.id, updated.data()!);
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
      const q = input.query.toLowerCase();
      // Firestore doesn't support full-text search; fetch a broad set and filter client-side
      const snap = await db
        .collection("users")
        .orderBy("createdAt", "desc")
        .limit(500)
        .get();

      const results = snap.docs
        .map((d) => docToUser(d.id, d.data()))
        .filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.openId?.toLowerCase().includes(q)
        )
        .slice(0, input.limit);

      return results;
    }),

  // Get user statistics (admin only)
  stats: adminProcedure.query(async () => {
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [totalSnap, adminSnap, recentSnap, todaySnap] = await Promise.all([
      db.collection("users").count().get(),
      db.collection("users").where("role", "==", "admin").count().get(),
      db.collection("users").where("createdAt", ">=", thirtyDaysAgo).count().get(),
      db.collection("users").where("createdAt", ">=", todayStart).count().get(),
    ]);

    return {
      total: totalSnap.data().count,
      admins: adminSnap.data().count,
      recentSignups: recentSnap.data().count,
      todaySignups: todaySnap.data().count,
    };
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Try Firestore first; fall back to SQL helper if Firestore doc doesn't exist
      const openId = ctx.user.openId;
      if (openId) {
        const snap = await db
          .collection("users")
          .where("openId", "==", openId)
          .limit(1)
          .get();

        if (!snap.empty) {
          const ref = snap.docs[0].ref;
          const updateData: Record<string, unknown> = { updatedAt: new Date() };
          if (input.name !== undefined) updateData.name = input.name;
          if (input.phone !== undefined) updateData.phone = input.phone;
          if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;
          await ref.update(updateData);
          const updated = await ref.get();
          return docToUser(updated.id, updated.data()!);
        }
      }

      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }),

  // Get profile stats for current user (bookings count, reviews count)
  profileStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.openId;
    let bookingsCount = 0;
    let reviewsCount = 0;

    try {
      const bSnap = await db
        .collection("bookings")
        .where("userId", "==", userId)
        .count()
        .get();
      bookingsCount = bSnap.data().count;
    } catch {
      // collection may be empty or index missing
    }

    try {
      const rSnap = await db
        .collection("reviews")
        .where("userId", "==", userId)
        .count()
        .get();
      reviewsCount = rSnap.data().count;
    } catch {
      // collection may be empty or index missing
    }

    return {
      bookings: bookingsCount,
      reviews: reviewsCount,
      aiCredits: 0,
    };
  }),
});
