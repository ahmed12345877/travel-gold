import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, like, desc, asc, inArray } from "drizzle-orm";

export const adminBlogRouter = router({
  /** List all blog posts with pagination and filtering */
  list: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
          search: z.string().optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
          category: z.string().optional(),
          sortBy: z
            .enum(["title", "publishedAt", "createdAt", "viewCount"])
            .default("createdAt"),
          sortOrder: z.enum(["asc", "desc"]).default("desc"),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const {
        limit = 20,
        offset = 0,
        search = "",
        status,
        category,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = input ?? {};

      let query: any = db.select().from(blogPosts);

      if (search) {
        query = query.where(like(blogPosts.title, `%${search}%`));
      }

      if (status) {
        query = query.where(eq(blogPosts.status, status));
      }

      if (category) {
        query = query.where(eq(blogPosts.category, category));
      }

      const orderColumn =
        sortBy === "title"
          ? blogPosts.title
          : sortBy === "publishedAt"
            ? blogPosts.publishedAt
            : sortBy === "viewCount"
              ? blogPosts.viewCount
              : blogPosts.createdAt;

      query = query.orderBy(
        sortOrder === "desc" ? desc(orderColumn) : asc(orderColumn),
      );
      query = query.limit(limit).offset(offset);

      return await query;
    }),

  /** Get single blog post by ID */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id));
      return result[0] || null;
    }),

  /** Get blog post by slug */
  getBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug));
      return result[0] || null;
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
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(blogPosts).values({
        ...input,
        status: "draft",
        viewCount: 0,
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
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;

      await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  /** Delete blog post */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  /** Bulk delete blog posts */
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(blogPosts).where(inArray(blogPosts.id, input.ids));
      return { success: true, deleted: input.ids.length };
    }),

  /** Publish blog post */
  publish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(blogPosts)
        .set({
          status: "published",
          publishedAt: new Date(),
        })
        .where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  /** Archive blog post */
  archive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(blogPosts)
        .set({
          status: "archived",
        })
        .where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allPosts = await db.select().from(blogPosts);
    const publishedCount = allPosts.filter(
      (p: any) => p.status === "published",
    ).length;
    const draftCount = allPosts.filter((p: any) => p.status === "draft").length;
    const totalViews = allPosts.reduce(
      (sum: number, p: any) => sum + (p.viewCount || 0),
      0,
    );
    const avgViews =
      allPosts.length > 0 ? (totalViews / allPosts.length).toFixed(0) : 0;

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
