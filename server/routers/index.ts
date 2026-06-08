import { z } from "zod";<font></font>
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";<font></font>
import { getSessionCookieOptions } from "../_core/cookies";<font></font>
import { systemRouter } from "../_core/systemRouter";<font></font>
import { publicProcedure, router } from "../_core/trpc";<font></font>
import { sdk } from "../_core/sdk";<font></font>
import { ENV } from "../_core/env";<font></font>
import { bookingsRouter } from "./bookings";<font></font>
import { reviewsRouter } from "./reviews";<font></font>
import { offersRouter } from "./offers";<font></font>
import { contactRouter } from "./contact";<font></font>
import { uploadsRouter } from "./uploads";<font></font>
import { galleryRouter } from "./gallery";<font></font>
import { usersRouter } from "./users";<font></font>
import { blogRouter } from "./blog";<font></font>
import { marketingRouter } from "./marketing";<font></font>
import { aiCommandRouter } from "./aiCommand";<font></font>
import { aiStudioRouter } from "./aiStudio";<font></font>
import { backupRouter } from "./backup";<font></font>
import { dataImportRouter } from "./dataImport";<font></font>
import { siteSettingsRouter } from "./siteSettings";<font></font>
import { adminBlogRouter } from "./admin.blog";<font></font>
import { adminDestinationsRouter } from "./admin.destinations";<font></font>
import { adminOffersRouter } from "./admin.offers";<font></font>
<font></font>
export const appRouter = router({<font></font>
  system: systemRouter,<font></font>
<font></font>
  auth: router({<font></font>
    me: publicProcedure.query((opts) => opts.ctx.user),<font></font>
<font></font>
    logout: publicProcedure.mutation(({ ctx }) => {<font></font>
      const cookieOptions = getSessionCookieOptions(ctx.req);<font></font>
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });<font></font>
      return { success: true } as const;<font></font>
    }),<font></font>
<font></font>
    passwordLogin: publicProcedure<font></font>
      .input(z.object({ email: z.string().email(), password: z.string() }))<font></font>
      .mutation(async ({ ctx, input }) => {<font></font>
        const expectedEmail = ENV.adminEmail;<font></font>
        const expectedHash = ENV.adminPasswordHash;<font></font>
<font></font>
        if (!expectedEmail || !expectedHash) {<font></font>
          throw new Error("Admin login not configured");<font></font>
        }<font></font>
<font></font>
        if (input.email.toLowerCase() !== expectedEmail.toLowerCase()) {<font></font>
          throw new Error("Invalid credentials");<font></font>
        }<font></font>
<font></font>
        const encoder = new TextEncoder();<font></font>
        const data = encoder.encode(input.password);<font></font>
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);<font></font>
        const hashHex = Array.from(new Uint8Array(hashBuffer))<font></font>
          .map((b) => b.toString(16).padStart(2, "0"))<font></font>
          .join("");<font></font>
<font></font>
        if (hashHex !== expectedHash) {<font></font>
          throw new Error("Invalid credentials");<font></font>
        }<font></font>
<font></font>
        const openId = `admin:${input.email}`;<font></font>
        const sessionToken = await sdk.createSessionToken(openId, {<font></font>
          name: "Admin",<font></font>
          expiresInMs: ONE_YEAR_MS,<font></font>
        });<font></font>
<font></font>
        const cookieOptions = getSessionCookieOptions(ctx.req);<font></font>
        ctx.res.cookie(COOKIE_NAME, sessionToken, {<font></font>
          ...cookieOptions,<font></font>
          maxAge: ONE_YEAR_MS,<font></font>
        });<font></font>
<font></font>
        return { success: true };<font></font>
      }),<font></font>
  }),<font></font>
<font></font>
  bookings: bookingsRouter,<font></font>
  reviews: reviewsRouter,<font></font>
  offers: offersRouter,<font></font>
  contact: contactRouter,<font></font>
  uploads: uploadsRouter,<font></font>
  gallery: galleryRouter,<font></font>
  users: usersRouter,<font></font>
  blog: blogRouter,<font></font>
  marketing: marketingRouter,<font></font>
  aiCommand: aiCommandRouter,<font></font>
  aiStudio: aiStudioRouter,<font></font>
  backup: backupRouter,<font></font>
  dataImport: dataImportRouter,<font></font>
  siteSettings: siteSettingsRouter,<font></font>
  adminBlog: adminBlogRouter,<font></font>
  adminDestinations: adminDestinationsRouter,<font></font>
  adminOffers: adminOffersRouter,<font></font>
});<font></font>
<font></font>
export type AppRouter = typeof appRouter;
