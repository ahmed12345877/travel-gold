/**
 * Factory that generates the standard admin CRUD router for a Firestore
 * collection.
 *
 * `admin.blog.ts`, `admin.offers.ts`, and `admin.destinations.ts` all
 * repeated identical list/getById/create/update/delete/bulkDelete plumbing.
 * This factory eliminates ~150 lines of duplication per router by letting
 * callers supply only the Zod schemas and collection name.
 */

import { z, type ZodObject, type ZodRawShape } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { list, getById, insert, update, remove } from "../_core/firestore-db";
import { logError } from "./errorLogger";

interface SortMapping {
  [logicalName: string]: string;
}

export interface CrudRouterConfig<
  TCreate extends ZodRawShape,
  TUpdate extends ZodRawShape,
> {
  /** Firestore collection name */
  collection: string;
  /** Human-readable label used for logging (e.g. "adminBlog") */
  tag: string;
  /** Zod shape for the `create` mutation input */
  createSchema: ZodObject<TCreate>;
  /** Zod shape for the `update` mutation input (must include `id: z.number()`) */
  updateSchema: ZodObject<TUpdate>;
  /** Allowed sort-by values and their mapping to Firestore field names */
  sortFields: SortMapping;
  /** Default sort field key (must exist in sortFields) */
  defaultSortBy: string;
  /** Default sort order */
  defaultSortOrder?: "asc" | "desc";
  /** Field used for text search filtering (defaults to "title") */
  searchField?: string;
  /** Optional status field name used for status filtering (e.g. "status", "isActive") */
  statusField?: string;
  /** Allowed status enum values, if statusField is set */
  statusValues?: readonly [string, ...string[]];
  /** Extra fields to merge when creating (e.g. `{ isActive: "active", bookedSpots: 0 }`) */
  createDefaults?: Record<string, unknown>;
}

export function buildAdminCrudRouter<
  TCreate extends ZodRawShape,
  TUpdate extends ZodRawShape,
>(config: CrudRouterConfig<TCreate, TUpdate>) {
  const {
    collection: COL,
    tag,
    createSchema,
    updateSchema,
    sortFields,
    defaultSortBy,
    defaultSortOrder = "desc",
    searchField = "title",
    statusField,
    statusValues,
    createDefaults = {},
  } = config;

  const sortByEnum = z.enum(
    Object.keys(sortFields) as [string, ...string[]],
  );

  const statusEnum = statusValues
    ? z.enum(statusValues as [string, ...string[]])
    : undefined;

  return router({
    /** List with pagination, search, sort, optional status filter */
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
          search: z.string().optional(),
          status: statusEnum ? statusEnum.optional() : z.string().optional(),
          sortBy: sortByEnum.default(defaultSortBy),
          sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        }).optional(),
      )
      .query(async ({ input }) => {
        try {
          const {
            limit = 20,
            offset = 0,
            search = "",
            status,
            sortBy = defaultSortBy,
            sortOrder = defaultSortOrder,
          } = input ?? {};

          let rows = (await list(COL, {})) as any[];

          if (status && statusField) {
            rows = rows.filter((r) => r[statusField] === status);
          }
          if (search) {
            const q = search.toLowerCase();
            rows = rows.filter((r) =>
              (r[searchField] ?? "").toLowerCase().includes(q),
            );
          }

          const key = sortFields[sortBy] ?? "createdAt";
          rows.sort((a, b) => {
            const av = a[key];
            const bv = b[key];
            const an =
              typeof av === "string" && isNaN(Number(av))
                ? av
                : Number(av ?? 0);
            const bn =
              typeof bv === "string" && isNaN(Number(bv))
                ? bv
                : Number(bv ?? 0);
            if (an < bn) return sortOrder === "desc" ? 1 : -1;
            if (an > bn) return sortOrder === "desc" ? -1 : 1;
            return 0;
          });

          return rows.slice(offset, offset + limit);
        } catch (error) {
          logError(tag + ".list", "query error", error);
          throw error;
        }
      }),

    /** Get single document by ID */
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          return (await getById(COL, input.id)) || null;
        } catch (error) {
          logError(tag + ".getById", "query error", error, { id: input.id });
          throw error;
        }
      }),

    /** Create document */
    create: adminProcedure
      .input(createSchema)
      .mutation(async ({ input }) => {
        try {
          const result = await insert(COL, {
            ...(input as Record<string, unknown>),
            ...createDefaults,
          });
          return { success: true as const, id: result.id };
        } catch (error) {
          logError(tag + ".create", "mutation error", error);
          throw error;
        }
      }),

    /** Update document */
    update: adminProcedure
      .input(updateSchema)
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input as { id: number } & Record<string, unknown>;
          await update(COL, id, data);
          return { success: true as const };
        } catch (error) {
          logError(tag + ".update", "mutation error", error, {
            id: (input as any).id,
          });
          throw error;
        }
      }),

    /** Delete document */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await remove(COL, input.id);
          return { success: true as const };
        } catch (error) {
          logError(tag + ".delete", "mutation error", error, { id: input.id });
          throw error;
        }
      }),

    /** Bulk-delete documents */
    bulkDelete: adminProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        try {
          for (const id of input.ids) await remove(COL, id);
          return { success: true as const, deleted: input.ids.length };
        } catch (error) {
          logError(tag + ".bulkDelete", "mutation error", error, {
            count: input.ids.length,
          });
          throw error;
        }
      }),
  });
}
