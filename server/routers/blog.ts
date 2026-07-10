import { z } from "zod";
import { publicProcedure, router, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getPublishedBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  getAllBlogPosts,
  incrementBlogViewCount,
  getBlogPostsByCategory,
} from "../db";
import { logError } from "../utils/errorLogger";

export const blogRouter = router({
  // Public: List published blog posts
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 10, offset = 0, category } = input ?? {};
      try {
        let posts;
        if (category) {
          posts = await getBlogPostsByCategory(category, limit, offset);
        } else {
          posts = await getPublishedBlogPosts(limit, offset);
        }
        
        // Validate and normalize posts
        return posts.map(post => ({
          ...post,
          publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
        }));
      } catch (err) {
        logError("blog.list", "database error", err, { input });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog posts",
        });
      }
    }),

  // Public: Get single post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const post = await getBlogPostBySlug(input.slug);
        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }
        // Increment view count (fire and forget)
        incrementBlogViewCount(post.id).catch((err) => {
          console.warn("[blog.getBySlug] Failed to increment view count:", err);
        });
        return {
          ...post,
          publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        logError("blog.getBySlug", "database error", err, { slug: input.slug });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog post",
        });
      }
    }),

  // Admin: List all posts (including drafts)
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      return getAllBlogPosts(limit, offset);
    }),

  // Admin: Create blog post
  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(255),
        title: z.string().min(1).max(500),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        metaKeywords: z.string().max(500).optional(),
        coverImageUrl: z.string().url().optional(),
        category: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(["draft", "published"]).default("draft"),
        readingTime: z.number().min(1).max(60).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await createBlogPost({
          ...input,
          authorId: ctx.user.id,
          authorName: ctx.user.name || "VANIR GROUP",
          publishedAt: input.status === "published" ? (new Date() as any) : undefined,
        });
      } catch (err) {
        logError("blog.create", "mutation error", err, { input: { ...input, content: "[omitted]" } });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create blog post",
        });
      }
    }),

  // Admin: Update blog post
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1).max(255).optional(),
        title: z.string().min(1).max(500).optional(),
        excerpt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        metaKeywords: z.string().max(500).optional(),
        coverImageUrl: z.string().url().optional(),
        category: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        readingTime: z.number().min(1).max(60).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const updated = await updateBlogPost(id, {
          ...data,
          publishedAt: data.status === "published" ? (new Date() as any) : undefined,
        });
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }
        return {
          ...updated,
          publishedAt: updated.publishedAt ? new Date(updated.publishedAt).toISOString() : null,
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        logError("blog.update", "mutation error", err, { postId: input.id });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update blog post",
        });
      }
    }),
});
