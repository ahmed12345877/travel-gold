import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import {
  createOffer,
  getActiveOffers,
  getAllOffers,
  getOfferByPromoCode,
  updateOffer,
} from "../db";

export const offersRouter = router({
  /** List active offers (public) */
  listActive: publicProcedure.query(async () => {
    try {
      return await getActiveOffers();
    } catch (error) {
      console.error("[offers.listActive] query error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),

  /** Validate a promo code (public) */
  validatePromo: publicProcedure
    .input(z.object({ promoCode: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const offer = await getOfferByPromoCode(input.promoCode);
        if (!offer) return { valid: false, message: "رمز الخصم غير صالح" } as const;

        const now = Date.now();
        if (offer.isActive !== "active") return { valid: false, message: "هذا العرض غير نشط" } as const;
        if (now < offer.startDate) return { valid: false, message: "هذا العرض لم يبدأ بعد" } as const;
        if (now > offer.endDate) return { valid: false, message: "انتهت صلاحية هذا العرض" } as const;
        if (offer.totalSpots && offer.bookedSpots && offer.bookedSpots >= offer.totalSpots) {
          return { valid: false, message: "نفدت جميع الأماكن المتاحة" } as const;
        }

        return {
          valid: true,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          title: offer.title,
          message: "تم تطبيق رمز الخصم بنجاح",
        } as const;
      } catch (error) {
        console.error("[offers.validatePromo] query error:", {
          error: error instanceof Error ? error.message : String(error),
          promoCode: input.promoCode,
        });
        throw error;
      }
    }),

  /** List all offers (admin only) */
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
        return await getAllOffers(limit, offset);
      } catch (error) {
        console.error("[offers.listAll] query error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }),

  /** Create a new offer (admin only) */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.string(),
        promoCode: z.string().optional(),
        startDate: z.number(),
        endDate: z.number(),
        category: z.string().optional(),
        destination: z.string().optional(),
        imageUrl: z.string().optional(),
        totalSpots: z.number().optional(),
        badgeText: z.string().optional(),
        badgeColor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await createOffer({
          ...input,
          isActive: "active",
          bookedSpots: 0,
        });
      } catch (error) {
        console.error("[offers.create] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          title: input.title,
        });
        throw error;
      }
    }),

  /** Update an offer (admin only) */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.string().optional(),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        isActive: z.enum(["active", "inactive", "expired"]).optional(),
        totalSpots: z.number().optional(),
        badgeText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        return await updateOffer(id, data);
      } catch (error) {
        console.error("[offers.update] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),
});
