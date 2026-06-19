import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { list, update, findOne } from "../_core/firestore-db";
import { buildAdminCrudRouter } from "../utils/firestoreAdminCrud";
import { logError } from "../utils/errorLogger";

const COL = "blogPosts";

const crudRouter = buildAdminCrudRouter({
  collection: COL,
  tag: "adminBlog",
  createSchema: z.object({
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
  updateSchema: z.object({
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
  sortFields: {
    title: "title",
    publishedAt: "publishedAt",
    createdAt: "createdAt",
    viewCount: "viewCount",
  },
  defaultSortBy: "createdAt",
  statusField: "status",
  statusValues: ["draft", "published", "archived"],
  createDefaults: { status: "draft", viewCount: 0 },
});

export const adminBlogRouter = router({
  ...crudRouter._def.procedures,

  /** Get blog post by slug */
  getBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        return (await findOne(COL, [["slug", "==", input.slug]])) || null;
      } catch (error) {
        logError("adminBlog.getBySlug", "database error", error, { slug: input.slug });
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
        logError("adminBlog.publish", "mutation error", error, { id: input.id });
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
        logError("adminBlog.archive", "mutation error", error, { id: input.id });
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
      logError("adminBlog.getStats", "query error", error);
      throw error;
    }
  }),
});
