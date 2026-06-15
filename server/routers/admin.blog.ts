import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { list, getById, insert, update, remove, findOne } from "../_core/firestore-db";

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
    }),

  /** Get single blog post by ID */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return (await getById(COL, input.id)) || null;
    }),

  /** Get blog post by slug */
  getBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return (await findOne(COL, [["slug", "==", input.slug]])) || null;
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
      const now = new Date().toISOString();
      await insert(COL, { 
        ...input, 
        status: "draft", 
        viewCount: 0,
        createdAt: now,
      });
      return { success: true };
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
      const { id, ...data } = input;
      await update(COL, id, data);
      return { success: true };
    }),

  /** Delete blog post */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await remove(COL, input.id);
      return { success: true };
    }),

  /** Bulk delete blog posts */
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      for (const id of input.ids) await remove(COL, id);
      return { success: true, deleted: input.ids.length };
    }),

  /** Publish blog post */
  publish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await update(COL, input.id, { status: "published", publishedAt: new Date().toISOString() });
      return { success: true };
    }),

  /** Archive blog post */
  archive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await update(COL, input.id, { status: "archived" });
      return { success: true };
    }),

  /** Get statistics */
  getStats: adminProcedure.query(async () => {
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
  }),
});
