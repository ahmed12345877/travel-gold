import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { offers } from "../../drizzle/schema";
import { eq, like, desc, asc, inArray } from "drizzle-orm";

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
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { limit = 20, offset = 0, search = "", status, sortBy = "createdAt", sortOrder = "desc" } = input ?? {};
      
      let query: any = db.select().from(offers);
      
      if (search) {
        query = query.where(like(offers.title, `%${search}%`));
      }
      
      if (status) {
        query = query.where(eq(offers.isActive, status));
      }
      
      const orderColumn = 
        sortBy === "title" ? offers.title :
        sortBy === "discount" ? offers.discountValue :
        sortBy === "startDate" ? offers.startDate :
        offers.createdAt;
      
      query = query.orderBy(sortOrder === "desc" ? desc(orderColumn) : asc(orderColumn));
      query = query.limit(limit).offset(offset);
      
      return await query;
    }),

  /** Get single offer by ID */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db
        .select()
        .from(offers)
        .where(eq(offers.id, input.id));
      return result[0] || null;
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
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(offers).values({
        ...input,
        isActive: "active",
        bookedSpots: 0,
      });
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
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      
      await db
        .update(offers)
        .set(data)
        .where(eq(offers.id, id));
      return { success: true };
    }),

  /** Delete offer */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(offers)
        .where(eq(offers.id, input.id));
      return { success: true };
    }),

  /** Bulk delete offers */
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(offers)
        .where(inArray(offers.id, input.ids));
      return { success: true, deleted: input.ids.length };
    }),

  /** Update offer status */
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.enum(["active", "inactive", "expired"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(offers)
        .set({
          isActive: input.isActive,
        })
        .where(eq(offers.id, input.id));
      return { success: true };
    }),

  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const allOffers = await db.select().from(offers);
    const activeCount = allOffers.filter((o: any) => o.isActive === "active").length;
    const totalDiscount = allOffers.reduce((sum: number, o: any) => sum + (parseFloat(o.discountValue as string) || 0), 0);
    const avgDiscount = allOffers.length > 0 ? (totalDiscount / allOffers.length).toFixed(2) : 0;

    return {
      total: allOffers.length,
      active: activeCount,
      inactive: allOffers.length - activeCount,
      avgDiscount: parseFloat(avgDiscount as string),
    };
  }),
});
