import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
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

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

export const blogRouter = router({
  // Public: List published blog posts
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
          offset: z.number().min(0).default(0),
          category: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { limit = 10, offset = 0, category } = input ?? {};
      if (category) {
        return getBlogPostsByCategory(category, limit, offset);
      }
      return getPublishedBlogPosts(limit, offset);
    }),

  // Public: Get single post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await getBlogPostBySlug(input.slug);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
        });
      }
      // Increment view count (fire and forget)
      incrementBlogViewCount(post.id).catch(() => {});
      return post;
    }),

  // Admin: List all posts (including drafts)
  adminList: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createBlogPost({
        ...input,
        authorId: ctx.user.id,
        authorName: ctx.user.name || "VANIR GROUP",
        publishedAt: input.status === "published" ? new Date() : undefined,
      });
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
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updated = await updateBlogPost(id, {
        ...data,
        publishedAt: data.status === "published" ? new Date() : undefined,
      });
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
        });
      }
      return updated;
    }),
});
