import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { systemRouter } from "../_core/systemRouter";
import { publicProcedure, router } from "../_core/trpc";
import { sdk } from "../_core/sdk";
import { ENV } from "../_core/env";
import { bookingsRouter } from "./bookings";
import { reviewsRouter } from "./reviews";
import { offersRouter } from "./offers";
import { contactRouter } from "./contact";
import { uploadsRouter } from "./uploads";
import { galleryRouter } from "./gallery";
import { usersRouter } from "./users";
import { blogRouter } from "./blog";
import { marketingRouter } from "./marketing";
import { aiCommandRouter } from "./aiCommand";
import { aiStudioRouter } from "./aiStudio";
import { backupRouter } from "./backup";
import { dataImportRouter } from "./dataImport";
import { siteSettingsRouter } from "./siteSettings";
import { adminBlogRouter } from "./admin.blog";
import { adminDestinationsRouter } from "./admin.destinations";
import { adminOffersRouter } from "./admin.offers";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const expectedEmail = ENV.adminEmail;
        const expectedHash = ENV.adminPasswordHash;

        if (!expectedEmail || !expectedHash) {
          throw new Error("Admin login not configured");
        }

        if (input.email.toLowerCase() !== expectedEmail.toLowerCase()) {
          throw new Error("Invalid credentials");
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(input.password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashHex = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        if (hashHex !== expectedHash) {
          throw new Error("Invalid credentials");
        }

        const openId = `admin:${input.email}`;
        const sessionToken = await sdk.createSessionToken(openId, {
          name: "Admin",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true };
      }),

    supabaseLogin: publicProcedure
      .input(z.object({ accessToken: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { getServerSupabase } = await import("../_core/supabase");
        const supa = getServerSupabase();
        if (!supa) throw new Error("Supabase not configured");

        const { data: authData, error } = await supa.auth.getUser(input.accessToken);
        if (error || !authData.user) throw new Error("Invalid token");

        const { upsertUser, getUserByOpenId } = await import("../db");
        const u = authData.user;
        await upsertUser({
          openId: u.id,
          name: u.user_metadata?.full_name || u.email?.split("@")[0] || null,
          email: u.email ?? null,
          loginMethod: "supabase",
          lastSignedIn: new Date(),
        });

        const dbUser = await getUserByOpenId(u.id);
        if (!dbUser || dbUser.role !== "admin") throw new Error("Admin access denied");

        const sessionToken = await sdk.createSessionToken(u.id, {
          name: dbUser.name || "Admin",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true };
      }),
  }),

  bookings: bookingsRouter,
  reviews: reviewsRouter,
  offers: offersRouter,
  contact: contactRouter,
  uploads: uploadsRouter,
  gallery: galleryRouter,
  users: usersRouter,
  blog: blogRouter,
  marketing: marketingRouter,
  aiCommand: aiCommandRouter,
  aiStudio: aiStudioRouter,
  backup: backupRouter,
  dataImport: dataImportRouter,
  siteSettings: siteSettingsRouter,
  adminBlog: adminBlogRouter,
  adminDestinations: adminDestinationsRouter,
  adminOffers: adminOffersRouter,
});

export type AppRouter = typeof appRouter;
