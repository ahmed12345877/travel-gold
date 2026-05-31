import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { bookingsRouter } from "./routers/bookings";
import { reviewsRouter } from "./routers/reviews";
import { offersRouter } from "./routers/offers";
import { contactRouter } from "./routers/contact";
import { uploadsRouter } from "./routers/uploads";
import { galleryRouter } from "./routers/gallery";
import { aiStudioRouter } from "./routers/aiStudio";
import { usersRouter } from "./routers/users";
import { blogRouter } from "./routers/blog";
import { marketingRouter } from "./routers/marketing";
import { adminDestinationsRouter } from "./routers/admin.destinations";
import { adminOffersRouter } from "./routers/admin.offers";
import { adminBlogRouter } from "./routers/admin.blog";
import { aiCommandRouter } from "./routers/aiCommand";
import { siteSettingsRouter } from "./routers/siteSettings";
import { backupRouter } from "./routers/backup";
import { dataImportRouter } from "./routers/dataImport";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createHash, timingSafeEqual } from "crypto";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { getServerSupabase } from "./_core/supabase";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        try {
          console.log("[v0] Login attempt for:", input.email);
          const adminEmail = ENV.adminEmail;
          const adminPasswordHash = ENV.adminPasswordHash;

          console.log("[v0] ADMIN_EMAIL configured:", !!adminEmail);
          console.log("[v0] ADMIN_PASSWORD_HASH configured:", !!adminPasswordHash);

          if (!adminEmail || !adminPasswordHash) {
            console.log("[v0] Admin credentials not configured");
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Admin login is not configured on this server. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH environment variables.",
            });
          }

          // Case-insensitive email comparison
          if (input.email.toLowerCase() !== adminEmail.toLowerCase()) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
          }

          // Support both plain-text password and SHA-256 hash comparison
          // If stored hash looks like a 64-char hex string, compare as SHA-256
          // Otherwise compare directly (plain text fallback)
          const storedHash = adminPasswordHash.trim();
          const isHashFormat = /^[a-f0-9]{64}$/.test(storedHash.toLowerCase());

          let match = false;
          if (isHashFormat) {
            // Stored value is a SHA-256 hex hash
            const submittedHash = createHash("sha256").update(input.password).digest("hex");
            try {
              match = timingSafeEqual(
                Buffer.from(submittedHash, "utf8"),
                Buffer.from(storedHash.toLowerCase(), "utf8")
              );
            } catch {
              match = false;
            }
          } else {
            // Stored value is a plain-text password (development fallback)
            try {
              match = timingSafeEqual(
                Buffer.from(input.password, "utf8"),
                Buffer.from(storedHash, "utf8")
              );
            } catch {
              match = false;
            }
          }

          if (!match) {
            console.log("[v0] Password mismatch");
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
          }

          console.log("[v0] Password matched, creating session");
          // Use a stable openId for the admin account
          const openId = `admin:${adminEmail.toLowerCase()}`;

          // Upsert admin user in DB (best-effort; silently skipped when DB is unavailable).
          await db.upsertUser({
            openId,
            email: adminEmail,
            name: "Admin",
            loginMethod: "password",
            role: "admin",
            lastSignedIn: new Date(),
          }).catch((err) => {
            console.warn("[Auth] Could not persist admin user to DB (non-fatal):", err);
          });

          const sessionToken = await sdk.createSessionToken(openId, {
            expiresInMs: ONE_YEAR_MS,
            name: "Admin",
          });

          console.log("[v0] Session token created, setting cookie");
          const cookieOptions = getSessionCookieOptions(ctx.req);
          console.log("[v0] Cookie options:", JSON.stringify(cookieOptions));
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: ONE_YEAR_MS,
          });

          return { success: true } as const;
        } catch (err) {
          // Re-throw TRPCErrors as-is, wrap unexpected errors
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred during login. Please try again.",
          });
        }
      }),

    /**
     * Bridge: accept a Supabase Auth JWT access token, verify it server-side,
     * check app_metadata.role === 'admin', upsert the user in DB with role='admin',
     * then issue a session cookie so the rest of the app treats them as authenticated admin.
     */
    supabaseLogin: publicProcedure
      .input(z.object({ accessToken: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const supabase = getServerSupabase();
        if (!supabase) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Supabase is not configured on this server.",
          });
        }

        // Verify the token and get the Supabase user
        const { data, error } = await supabase.auth.getUser(input.accessToken);
        if (error || !data.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired Supabase session.",
          });
        }

        const supabaseUser = data.user;
        const appMeta = (supabaseUser.app_metadata ?? {}) as Record<string, unknown>;
        const userMeta = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
        // Accept role set via app_metadata (admin API) OR user_metadata (SQL UPDATE)
        const role = (appMeta["role"] ?? userMeta["role"]) as string | undefined;

        if (role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This account does not have admin privileges.",
          });
        }

        const name =
          (supabaseUser.user_metadata as any)?.full_name ||
          (supabaseUser.user_metadata as any)?.name ||
          supabaseUser.email?.split("@")[0] ||
          "Admin";

        // Use "admin:" prefix so authenticateRequest bypasses DB lookup entirely.
        // This makes the session self-contained (no DATABASE_URL required).
        const openId = `admin:${(supabaseUser.email ?? supabaseUser.id).toLowerCase()}`;

        // Best-effort DB write for audit trail; non-blocking so no MySQL = non-fatal
        db.upsertUser({
          openId,
          email: supabaseUser.email ?? null,
          name,
          loginMethod: "supabase",
          role: "admin",
          lastSignedIn: new Date(),
        }).catch((err) => {
          console.warn("[Auth] Could not persist Supabase admin user to DB (non-fatal):", err);
        });

        // Issue a session cookie
        const sessionToken = await sdk.createSessionToken(openId, {
          expiresInMs: ONE_YEAR_MS,
          name,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true } as const;
      }),

    /**
     * One-time server-side operation: create (or confirm) the admin user in Supabase Auth
     * with app_metadata.role = 'admin'. Requires SUPABASE_SERVICE_ROLE_KEY to be set.
     * Call this once during setup; subsequent calls are idempotent (returns existing user).
     */
    ensureAdmin: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8, "Password must be at least 8 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const supabase = getServerSupabase();
        if (!supabase) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Supabase service role key is not configured.",
          });
        }

        // Try to create the admin user
        const { data, error } = await supabase.auth.admin.createUser({
          email: input.email,
          password: input.password,
          email_confirm: true,
          app_metadata: { role: "admin" },
        });

        if (error) {
          // If user already exists, find them and update their app_metadata
          if (
            error.message?.toLowerCase().includes("already") ||
            error.message?.toLowerCase().includes("exists") ||
            (error as any).code === "email_exists"
          ) {
            // List users to find the existing one and update metadata
            const { data: listData, error: listError } =
              await supabase.auth.admin.listUsers();
            if (listError) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to list users: ${listError.message}`,
              });
            }
            const existing = listData.users.find(
              (u) => u.email?.toLowerCase() === input.email.toLowerCase()
            );
            if (existing) {
              const { error: updateError } =
                await supabase.auth.admin.updateUserById(existing.id, {
                  app_metadata: { role: "admin" },
                });
              if (updateError) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: `Failed to update admin metadata: ${updateError.message}`,
                });
              }
              return {
                success: true,
                action: "updated" as const,
                userId: existing.id,
              };
            }
            throw new TRPCError({
              code: "CONFLICT",
              message: "User already exists but could not be located.",
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Supabase error: ${error.message}`,
          });
        }

        return {
          success: true,
          action: "created" as const,
          userId: data.user?.id ?? null,
        };
      }),
  }),

  // Feature routers
  bookings: bookingsRouter,
  reviews: reviewsRouter,
  offers: offersRouter,
  contact: contactRouter,
  uploads: uploadsRouter,
  gallery: galleryRouter,
  aiStudio: aiStudioRouter,
  users: usersRouter,
  blog: blogRouter,
  marketing: marketingRouter,

  // Admin routers
  admin: router({
    destinations: adminDestinationsRouter,
    offers: adminOffersRouter,
    blog: adminBlogRouter,
  }),

  // AI Command Center
  aiCommand: aiCommandRouter,

  // Site Settings (real DB-backed)
  siteSettings: siteSettingsRouter,

  // Backup & Export (real DB export)
  backup: backupRouter,

  // Data Import (import records from external tools via CSV/JSON)
  dataImport: dataImportRouter,
});

export type AppRouter = typeof appRouter;
