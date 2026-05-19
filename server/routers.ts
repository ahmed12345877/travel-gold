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
    me: publicProcedure.query(async ({ ctx }) => {
      // إذا لم يجد المتصفح جلسة، سنقوم بحقن كوكيز الآدمن فوراً تلقائياً
      if (!ctx.user) {
        const cookieOptions = {
          httpOnly: true,
          secure: false,
          sameSite: "lax" as const,
          path: "/",
        };
        // إنشاء توكن الجلسة للمالك من المعرف الخاص بك
        const mockOpenId = process.env.OWNER_OPEN_ID || "310519663477605010";
        const sessionToken = await sdk.createSessionToken(mockOpenId, { name: "Ahmed Roshdi" });

        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });

        // جلب بيانات الآدمن بعد زرع الكوكيز مباشرة
        const adminUser = await db.getUserByOpenId(mockOpenId);
        return adminUser;
      }
      return ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "lax" as const,
        path: "/",
      };
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
});