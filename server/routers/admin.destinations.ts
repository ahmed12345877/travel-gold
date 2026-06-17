import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { list, getById, insert, update, remove } from "../_core/firestore-db";

const COL = "destinations";

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
      const { limit = 20, offset = 0, search = "", sortBy = "name", sortOrder = "asc" } = input ?? {};

      let rows = (await list(COL, {})) as any[];

      if (search) {
        const q = search.toLowerCase();
        rows = rows.filter((d) => (d.name ?? "").toLowerCase().includes(q));
      }

      const key =
        sortBy === "name" ? "name" :
        sortBy === "rating" ? "rating" :
        sortBy === "price" ? "pricePerPerson" :
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

  /** Get single destination by ID */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return (await getById(COL, input.id)) || null;
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
      try {
        const result = await insert(COL, { ...input, isActive: "active" });
        console.log(`[adminDestinations.create] created destination: id=${result.id}, name=${input.name}`);
        return { success: true, id: result.id };
      } catch (error) {
        console.error("[adminDestinations.create] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          name: input.name,
        });
        throw error;
      }
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
      try {
        const { id, ...data } = input;
        await update(COL, id, data);
        console.log(`[adminDestinations.update] updated destination: id=${id}`);
        return { success: true };
      } catch (error) {
        console.error("[adminDestinations.update] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Delete destination */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await remove(COL, input.id);
        console.log(`[adminDestinations.delete] deleted destination: id=${input.id}`);
        return { success: true };
      } catch (error) {
        console.error("[adminDestinations.delete] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Bulk delete destinations */
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      try {
        for (const id of input.ids) await remove(COL, id);
        console.log(`[adminDestinations.bulkDelete] deleted ${input.ids.length} destinations`);
        return { success: true, deleted: input.ids.length };
      } catch (error) {
        console.error("[adminDestinations.bulkDelete] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          count: input.ids.length,
        });
        throw error;
      }
    }),

  /** Update destination status (active/inactive) */
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.enum(["active", "inactive"]) }))
    .mutation(async ({ input }) => {
      try {
        await update(COL, input.id, { isActive: input.isActive });
        console.log(`[adminDestinations.updateStatus] updated status: id=${input.id}, status=${input.isActive}`);
        return { success: true };
      } catch (error) {
        console.error("[adminDestinations.updateStatus] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    try {
      const allDestinations = (await list(COL, {})) as any[];
      const activeCount = allDestinations.filter((d) => d.isActive === "active").length;
      const avgRating = allDestinations.length > 0
        ? (allDestinations.reduce((sum, d) => sum + (parseFloat(d.rating as string) || 0), 0) / allDestinations.length).toFixed(2)
        : 0;
      const avgPrice = allDestinations.length > 0
        ? (allDestinations.reduce((sum, d) => sum + (parseFloat(d.pricePerPerson as string) || 0), 0) / allDestinations.length).toFixed(2)
        : 0;

      return {
        total: allDestinations.length,
        active: activeCount,
        inactive: allDestinations.length - activeCount,
        avgRating: parseFloat(avgRating as string),
        avgPrice: parseFloat(avgPrice as string),
      };
    } catch (error) {
      console.error("[adminDestinations.getStats] query error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),
});
