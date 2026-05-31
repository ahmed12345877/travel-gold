import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { destinations } from "../../drizzle/schema";
import { eq, like, desc, asc, inArray } from "drizzle-orm";

export const adminDestinationsRouter = router({
  /** List all destinations with pagination and filtering */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        sortBy: z.enum(["name", "rating", "price", "createdAt"]).default("name"),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { limit = 20, offset = 0, search = "", sortBy = "name", sortOrder = "asc" } = input ?? {};
      
      let query: any = db.select().from(destinations);
      
      if (search) {
        query = query.where(like(destinations.name, `%${search}%`));
      }
      
      const orderColumn = 
        sortBy === "name" ? destinations.name :
        sortBy === "rating" ? destinations.rating :
        sortBy === "price" ? destinations.pricePerPerson :
        destinations.createdAt;
      
      query = query.orderBy(sortOrder === "desc" ? desc(orderColumn) : asc(orderColumn));
      query = query.limit(limit).offset(offset);
      
      return await query;
    }),

  /** Get single destination by ID */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db
        .select()
        .from(destinations)
        .where(eq(destinations.id, input.id));
      return result[0] || null;
    }),

  /** Create new destination */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "اسم الوجهة مطلوب"),
        description: z.string().optional(),
        location: z.string().min(1, "الموقع مطلوب"),
        pricePerPerson: z.string().optional(),
        rating: z.string().optional(),
        imageUrl: z.string().optional(),
        highlights: z.string().optional(),
        bestTimeToVisit: z.string().optional(),
        duration: z.string().optional(),
        difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
        groupSize: z.string().optional(),
        inclusions: z.string().optional(),
        exclusions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(destinations).values({
        ...input,
        isActive: "active",
      });
      return { success: true };
    }),

  /** Update destination */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        pricePerPerson: z.string().optional(),
        rating: z.string().optional(),
        imageUrl: z.string().optional(),
        highlights: z.string().optional(),
        bestTimeToVisit: z.string().optional(),
        duration: z.string().optional(),
        difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
        groupSize: z.string().optional(),
        inclusions: z.string().optional(),
        exclusions: z.string().optional(),
        isActive: z.enum(["active", "inactive"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      
      await db
        .update(destinations)
        .set(data)
        .where(eq(destinations.id, id));
      return { success: true };
    }),

  /** Delete destination */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(destinations)
        .where(eq(destinations.id, input.id));
      return { success: true };
    }),

  /** Bulk delete destinations */
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(destinations)
        .where(inArray(destinations.id, input.ids));
      return { success: true, deleted: input.ids.length };
    }),

  /** Update destination status (active/inactive) */
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.enum(["active", "inactive"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(destinations)
        .set({
          isActive: input.isActive,
        })
        .where(eq(destinations.id, input.id));
      return { success: true };
    }),

  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const allDestinations = await db.select().from(destinations);
    const activeCount = allDestinations.filter((d: any) => d.isActive === "active").length;
    const avgRating = allDestinations.length > 0 
      ? (allDestinations.reduce((sum: number, d: any) => sum + (parseFloat(d.rating as string) || 0), 0) / allDestinations.length).toFixed(2)
      : 0;
    const avgPrice = allDestinations.length > 0
      ? (allDestinations.reduce((sum: number, d: any) => sum + (parseFloat(d.pricePerPerson as string) || 0), 0) / allDestinations.length).toFixed(2)
      : 0;

    return {
      total: allDestinations.length,
      active: activeCount,
      inactive: allDestinations.length - activeCount,
      avgRating: parseFloat(avgRating as string),
      avgPrice: parseFloat(avgPrice as string),
    };
  }),
});
