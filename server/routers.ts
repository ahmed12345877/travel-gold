import { COOKIE_NAME } from "@shared/const";
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
});

export type AppRouter = typeof appRouter;
