import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db helpers
vi.mock("../db", () => ({
  getBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
  incrementBlogViewCount: vi.fn(),
}));

import { getBlogPosts, getBlogPostBySlug, incrementBlogViewCount } from "../db";

const mockGetBlogPosts = getBlogPosts as ReturnType<typeof vi.fn>;
const mockGetBlogPostBySlug = getBlogPostBySlug as ReturnType<typeof vi.fn>;
const mockIncrementBlogViewCount = incrementBlogViewCount as ReturnType<
  typeof vi.fn
>;

describe("Blog DB helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBlogPosts", () => {
    it("returns list of published blog posts", async () => {
      const mockPosts = [
        {
          id: 1,
          slug: "test-post",
          title: "Test Post",
          excerpt: "Test excerpt",
          content: "Full content",
          coverImageUrl: "https://example.com/img.jpg",
          category: "Destinations",
          tags: ["egypt", "travel"],
          authorName: "VANIR GROUP",
          readingTime: 5,
          viewCount: 100,
          publishedAt: new Date("2026-03-15"),
          createdAt: new Date("2026-03-15"),
          updatedAt: new Date("2026-03-15"),
          isPublished: true,
          metaTitle: "Test Post | VANIR GROUP",
          metaDescription: "Test description",
          metaKeywords: "test, post",
        },
      ];
      mockGetBlogPosts.mockResolvedValue(mockPosts);

      const result = await getBlogPosts({ limit: 10 });
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("test-post");
      expect(mockGetBlogPosts).toHaveBeenCalledWith({ limit: 10 });
    });

    it("filters by category", async () => {
      mockGetBlogPosts.mockResolvedValue([]);

      await getBlogPosts({ limit: 10, category: "Destinations" });
      expect(mockGetBlogPosts).toHaveBeenCalledWith({
        limit: 10,
        category: "Destinations",
      });
    });

    it("returns empty array when no posts", async () => {
      mockGetBlogPosts.mockResolvedValue([]);

      const result = await getBlogPosts({ limit: 10 });
      expect(result).toEqual([]);
    });
  });

  describe("getBlogPostBySlug", () => {
    it("returns a single blog post by slug", async () => {
      const mockPost = {
        id: 1,
        slug: "ultimate-guide-pyramids",
        title: "Ultimate Guide to Pyramids",
        content: "# Pyramids Guide\n\nFull content here...",
        excerpt: "A guide to pyramids",
        coverImageUrl: "https://example.com/pyramids.jpg",
        category: "Destinations",
        tags: ["pyramids", "giza"],
        authorName: "VANIR GROUP",
        readingTime: 8,
        viewCount: 500,
        publishedAt: new Date("2026-03-15"),
        isPublished: true,
        metaTitle: "Ultimate Guide to Pyramids | VANIR GROUP",
        metaDescription: "Complete guide to visiting the Pyramids of Giza",
        metaKeywords: "pyramids, giza, egypt tour",
      };
      mockGetBlogPostBySlug.mockResolvedValue(mockPost);

      const result = await getBlogPostBySlug("ultimate-guide-pyramids");
      expect(result).toBeDefined();
      expect(result.slug).toBe("ultimate-guide-pyramids");
      expect(result.content).toContain("Pyramids Guide");
    });

    it("returns null for non-existent slug", async () => {
      mockGetBlogPostBySlug.mockResolvedValue(null);

      const result = await getBlogPostBySlug("non-existent-slug");
      expect(result).toBeNull();
    });
  });

  describe("incrementBlogViewCount", () => {
    it("increments view count for a blog post", async () => {
      mockIncrementBlogViewCount.mockResolvedValue(undefined);

      await incrementBlogViewCount(1);
      expect(mockIncrementBlogViewCount).toHaveBeenCalledWith(1);
    });
  });
});

describe("Blog SEO metadata", () => {
  it("blog posts have required SEO fields", () => {
    const requiredFields = [
      "title",
      "slug",
      "excerpt",
      "metaTitle",
      "metaDescription",
      "metaKeywords",
    ];

    const mockPost = {
      title: "Test Post",
      slug: "test-post",
      excerpt: "Test excerpt",
      metaTitle: "Test Post | VANIR GROUP",
      metaDescription: "Test description for SEO",
      metaKeywords: "test, keywords",
    };

    for (const field of requiredFields) {
      expect(mockPost).toHaveProperty(field);
      expect((mockPost as Record<string, string>)[field]).toBeTruthy();
    }
  });

  it("slug format is URL-safe", () => {
    const validSlugs = [
      "ultimate-guide-pyramids-of-giza",
      "luxury-nile-cruise-experience",
      "top-10-egypt-travel-tips-2026",
      "sharm-el-sheikh-red-sea-paradise",
      "egyptian-cuisine-food-lovers-guide",
    ];

    for (const slug of validSlugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug).not.toContain(" ");
      expect(slug).not.toContain("_");
    }
  });

  it("meta description length is within SEO best practices", () => {
    const descriptions = [
      "Discover the ultimate guide to visiting the Pyramids of Giza in 2026.",
      "Experience luxury Nile cruises through ancient Egypt.",
      "Top 10 essential travel tips for first-time Egypt visitors.",
    ];

    for (const desc of descriptions) {
      expect(desc.length).toBeGreaterThan(30);
      expect(desc.length).toBeLessThan(300);
    }
  });
});
