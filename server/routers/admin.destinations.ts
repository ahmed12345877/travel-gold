import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { list, update } from "../_core/firestore-db";
import { buildAdminCrudRouter } from "../utils/firestoreAdminCrud";
import { logError } from "../utils/errorLogger";

const COL = "destinations";

const crudRouter = buildAdminCrudRouter({
  collection: COL,
  tag: "adminDestinations",
  createSchema: z.object({
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
  }),
  updateSchema: z.object({
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
  }),
  sortFields: {
    name: "name",
    rating: "rating",
    price: "pricePerPerson",
    createdAt: "createdAt",
  },
  defaultSortBy: "name",
  defaultSortOrder: "asc",
  searchField: "name",
  statusField: "isActive",
  statusValues: ["active", "inactive"],
  createDefaults: { isActive: "active" },
});

export const adminDestinationsRouter = router({
  ...crudRouter._def.procedures,

  /** Update destination status (active/inactive) */
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.enum(["active", "inactive"]) }))
    .mutation(async ({ input }) => {
      try {
        await update(COL, input.id, { isActive: input.isActive });
        return { success: true };
      } catch (error) {
        logError("adminDestinations.updateStatus", "mutation error", error, { id: input.id });
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
      logError("adminDestinations.getStats", "query error", error);
      throw error;
    }
  }),
});
