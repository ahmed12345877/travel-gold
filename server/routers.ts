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
          const adminEmail = ENV.adminEmail;
          const adminPasswordHash = ENV.adminPasswordHash;

          if (!adminEmail || !adminPasswordHash) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Admin login is not configured on this server. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH environment variables.",
            });
          }

          if (input.email.toLowerCase() !== adminEmail.toLowerCase()) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
          }

          const storedHash = adminPasswordHash.trim();
          const isHashFormat = /^[a-f0-9]{64}$/.test(storedHash.toLowerCase());

          let match = false;
          if (isHashFormat) {
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
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
          }

          const openId = `admin:${adminEmail.toLowerCase()}`;

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

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: ONE_YEAR_MS,
          });

          return { success: true } as const;
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred during login. Please try again.",
          });
        }
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
