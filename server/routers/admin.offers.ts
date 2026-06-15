import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { list, getById, insert, update, remove } from "../_core/firestore-db";

const COL = "offers";

export const adminOffersRouter = router({
  /** List all offers with pagination and filtering */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        status: z.enum(["active", "inactive", "expired"]).optional(),
        sortBy: z.enum(["title", "discount", "createdAt", "startDate"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 20, offset = 0, search = "", status, sortBy = "createdAt", sortOrder = "desc" } = input ?? {};

      let rows = (await list(COL, {})) as any[];

      if (status) rows = rows.filter((o) => o.isActive === status);
      if (search) {
        const q = search.toLowerCase();
        rows = rows.filter((o) => (o.title ?? "").toLowerCase().includes(q));
      }

      const key =
        sortBy === "title" ? "title" :
        sortBy === "discount" ? "discountValue" :
        sortBy === "startDate" ? "startDate" :
        "createdAt";

      rows.sort((a, b) => {
        const av = a[key], bv = b[key];
        const an = typeof av === "string" && isNaN(Number(av)) ? av : Number(av ?? 0);
        const bn = typeof bv === "string" && isNaN(Number(bv)) ? bv : Number(bv ?? 0);
        if (an < bn) return sortOrder === "desc" ? 1 : -1;
        if (an > bn) return sortOrder === "desc" ? -1 : 1;
        return 0;
      });

      return rows.slice(offset, offset + limit);
    }),

  /** Get single offer by ID */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return (await getById(COL, input.id)) || null;
    }),

  /** Create new offer */
  create: adminProcedure
    .input(
      z.object({
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
      })
    )
    .mutation(async ({ input }) => {
      await insert(COL, { ...input, isActive: "active", bookedSpots: 0 });
      return { success: true };
    }),

  /** Update offer */
  update: adminProcedure
    .input(
      z.object({
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
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await update(COL, id, data);
      return { success: true };
    }),

  /** Delete offer */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await remove(COL, input.id);
      return { success: true };
    }),

  /** Bulk delete offers */
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      for (const id of input.ids) await remove(COL, id);
      return { success: true, deleted: input.ids.length };
    }),

  /** Update offer status */
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.enum(["active", "inactive", "expired"]) }))
    .mutation(async ({ input }) => {
      await update(COL, input.id, { isActive: input.isActive });
      return { success: true };
    }),

  /** Get statistics */
  getStats: adminProcedure.query(async () => {
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
  }),
});
