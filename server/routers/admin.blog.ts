import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { list, getById, insert, update, remove, findOne } from "../_core/firestore-db";

// Admin Blog Router - Production Fix v2 (June 15, 2026 - Force Rebuild)
const COL = "blogPosts";

export const adminBlogRouter = router({
  /** List all blog posts with pagination and filtering */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        category: z.string().optional(),
        sortBy: z.enum(["title", "publishedAt", "createdAt", "viewCount"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const { limit = 20, offset = 0, search = "", status, category, sortBy = "createdAt", sortOrder = "desc" } = input ?? {};

        let rows = (await list(COL, {})) as any[];

        if (status) rows = rows.filter((p) => p.status === status);
        if (category) rows = rows.filter((p) => p.category === category);
        if (search) {
          const q = search.toLowerCase();
          rows = rows.filter((p) => (p.title ?? "").toLowerCase().includes(q));
        }

        const key =
          sortBy === "title" ? "title" :
          sortBy === "publishedAt" ? "publishedAt" :
          sortBy === "viewCount" ? "viewCount" :
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
      } catch (error) {
        console.error("[adminBlog.list] database error:", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    }),

  /** Get single blog post by ID */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        return (await getById(COL, input.id)) || null;
      } catch (error) {
        console.error("[adminBlog.getById] database error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Get blog post by slug */
  getBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        return (await findOne(COL, [["slug", "==", input.slug]])) || null;
      } catch (error) {
        console.error("[adminBlog.getBySlug] database error:", {
          error: error instanceof Error ? error.message : String(error),
          slug: input.slug,
        });
        throw error;
      }
    }),

  /** Create new blog post */
  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1, "الرابط الودود مطلوب"),
        title: z.string().min(1, "عنوان المقالة مطلوب"),
        excerpt: z.string().min(1, "الملخص مطلوب"),
        content: z.string().min(1, "محتوى المقالة مطلوب"),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        coverImageUrl: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        authorName: z.string().optional(),
        readingTime: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const now = new Date().toISOString();
        const result = await insert(COL, { 
          ...input, 
          status: "draft", 
          viewCount: 0,
          createdAt: now,
        });
        return { success: true, id: result.id };
      } catch (error) {
        console.error("[adminBlog.create] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          slug: input.slug,
        });
        throw error;
      }
    }),

  /** Update blog post */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        coverImageUrl: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        authorName: z.string().optional(),
        readingTime: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        await update(COL, id, data);
        return { success: true };
      } catch (error) {
        console.error("[adminBlog.update] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Delete blog post */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await remove(COL, input.id);
        return { success: true };
      } catch (error) {
        console.error("[adminBlog.delete] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Bulk delete blog posts */
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      try {
        for (const id of input.ids) await remove(COL, id);
        return { success: true, deleted: input.ids.length };
      } catch (error) {
        console.error("[adminBlog.bulkDelete] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          count: input.ids.length,
        });
        throw error;
      }
    }),

  /** Publish blog post */
  publish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await update(COL, input.id, { status: "published", publishedAt: new Date().toISOString() });
        return { success: true };
      } catch (error) {
        console.error("[adminBlog.publish] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Archive blog post */
  archive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await update(COL, input.id, { status: "archived" });
        return { success: true };
      } catch (error) {
        console.error("[adminBlog.archive] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    try {
      const allPosts = (await list(COL, {})) as any[];
      const publishedCount = allPosts.filter((p) => p.status === "published").length;
      const draftCount = allPosts.filter((p) => p.status === "draft").length;
      const totalViews = allPosts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const avgViews = allPosts.length > 0 ? (totalViews / allPosts.length).toFixed(0) : 0;

      return {
        total: allPosts.length,
        published: publishedCount,
        draft: draftCount,
        archived: allPosts.length - publishedCount - draftCount,
        totalViews,
        avgViews: parseInt(avgViews as string),
      };
    } catch (error) {
      console.error("[adminBlog.getStats] query error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),
});
