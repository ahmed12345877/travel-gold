import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { list, update } from "../_core/firestore-db";
import { buildAdminCrudRouter } from "../utils/firestoreAdminCrud";
import { logError } from "../utils/errorLogger";

const COL = "offers";

const crudRouter = buildAdminCrudRouter({
  collection: COL,
  tag: "adminOffers",
  createSchema: z.object({
    title: z.string().min(1, "عنوان العرض مطلوب"),
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
  }),
  updateSchema: z.object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    discountType: z.enum(["percentage", "fixed"]).optional(),
    discountValue: z.string().optional(),
    promoCode: z.string().optional(),
    startDate: z.number().optional(),
    endDate: z.number().optional(),
    category: z.string().optional(),
    destination: z.string().optional(),
    imageUrl: z.string().optional(),
    totalSpots: z.number().optional(),
    badgeText: z.string().optional(),
    badgeColor: z.string().optional(),
    isActive: z.enum(["active", "inactive", "expired"]).optional(),
  }),
  sortFields: {
    title: "title",
    discount: "discountValue",
    createdAt: "createdAt",
    startDate: "startDate",
  },
  defaultSortBy: "createdAt",
  statusField: "isActive",
  statusValues: ["active", "inactive", "expired"],
  createDefaults: { isActive: "active", bookedSpots: 0 },
});

export const adminOffersRouter = router({
  ...crudRouter._def.procedures,

  /** Update offer status */
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.enum(["active", "inactive", "expired"]) }))
    .mutation(async ({ input }) => {
      try {
        await update(COL, input.id, { isActive: input.isActive });
        return { success: true };
      } catch (error) {
        logError("adminOffers.updateStatus", "mutation error", error, { id: input.id });
        throw error;
      }
    }),

  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    try {
      const allOffers = (await list(COL, {})) as any[];
      const activeCount = allOffers.filter((o) => o.isActive === "active").length;
      const totalDiscount = allOffers.reduce(
        (sum, o) => sum + (parseFloat(o.discountValue as string) || 0),
        0,
      );
      const avgDiscount = allOffers.length > 0 ? (totalDiscount / allOffers.length).toFixed(2) : 0;

      return {
        total: allOffers.length,
        active: activeCount,
        inactive: allOffers.length - activeCount,
        avgDiscount: parseFloat(avgDiscount as string),
      };
    } catch (error) {
      logError("adminOffers.getStats", "query error", error);
      throw error;
    }
  }),
});
