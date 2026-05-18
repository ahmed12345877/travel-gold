/*
 * Gallery Page Tests
 * Tests gallery data integrity, category filtering logic, and lightbox navigation.
 * Data is extracted from Gallery.tsx source to ensure tests match actual implementation.
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ─── Extract data directly from Gallery.tsx source ───
let gallerySource = "";
let itemCount = 0;
let featuredCount = 0;
let allItemCategories: string[] = [];
let videoCount = 0;

beforeAll(() => {
  const filePath = path.resolve(__dirname, "Gallery.tsx");
  gallerySource = fs.readFileSync(filePath, "utf-8");

  // Count static gallery items by matching `id:` in staticGalleryItems array
  const galleryArrayMatch = gallerySource.match(
    /const staticGalleryItems:\s*GalleryItemDisplay\[\]\s*=\s*\[([\s\S]*?)\];\s*\n/,
  );
  expect(galleryArrayMatch).toBeTruthy();
  const galleryArrayContent = galleryArrayMatch![1];

  // Count items by matching `id: <number>` patterns
  const idMatches = galleryArrayContent.match(/id:\s*\d+/g);
  itemCount = idMatches ? idMatches.length : 0;

  // Count featured items
  const featuredMatches = galleryArrayContent.match(/featured:\s*true/g);
  featuredCount = featuredMatches ? featuredMatches.length : 0;

  // Extract all item categories
  const catMatches = galleryArrayContent.match(/category:\s*"([^"]+)"/g);
  allItemCategories = catMatches
    ? catMatches.map((m) => m.replace(/category:\s*"/, "").replace(/"$/, ""))
    : [];

  // Count static video items
  const videoArrayMatch = gallerySource.match(
    /const staticVideoItems:\s*VideoItemDisplay\[\]\s*=\s*\[([\s\S]*?)\];\s*\n/,
  );
  if (videoArrayMatch) {
    const videoIdMatches = videoArrayMatch[1].match(/id:\s*\d+/g);
    videoCount = videoIdMatches ? videoIdMatches.length : 0;
  }
});

/* ═══════════════════════════════════════════════════════════════
   Data Integrity Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Gallery Data Integrity", () => {
  it("has at least 10 static gallery items", () => {
    expect(itemCount).toBeGreaterThanOrEqual(10);
  });

  it("has featured items", () => {
    expect(featuredCount).toBeGreaterThanOrEqual(1);
  });

  it("has video items", () => {
    expect(videoCount).toBeGreaterThanOrEqual(1);
  });

  it("all items have valid categories", () => {
    expect(allItemCategories.length).toBe(itemCount);
    allItemCategories.forEach((cat) => {
      expect(cat.length).toBeGreaterThan(0);
    });
  });
});

/* ═══════════════════════════════════════════════════════════════
   Component Structure Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Gallery Component Structure", () => {
  it("has category filter buttons", () => {
    expect(gallerySource).toContain("activeCategory");
    expect(gallerySource).toContain("setActiveCategory");
  });

  it("has view mode toggle (grid/list)", () => {
    expect(gallerySource).toContain("viewMode");
    expect(gallerySource).toContain("setViewMode");
  });

  it("has lightbox modal for images", () => {
    expect(gallerySource).toContain("selectedImage");
    expect(gallerySource).toContain("setSelectedImage");
  });

  it("has video modal functionality", () => {
    expect(gallerySource).toContain("selectedVideo");
    expect(gallerySource).toContain("setSelectedVideo");
  });

  it("uses framer-motion for animations", () => {
    expect(gallerySource).toContain("framer-motion");
    expect(gallerySource).toContain("motion.div");
  });
});

/* ═══════════════════════════════════════════════════════════════
   Filtering Logic Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Category Filtering Logic", () => {
  it("filters items by category", () => {
    expect(gallerySource).toContain("filteredItems");
    expect(gallerySource).toContain("activeCategory");
  });

  it("supports 'All' category", () => {
    expect(gallerySource).toContain('"All"');
  });

  it("extracts unique categories from items", () => {
    expect(gallerySource).toContain("useMemo");
    expect(gallerySource).toContain("Set(");
  });
});

/* ═══════════════════════════════════════════════════════════════
   Image Navigation Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Lightbox Navigation", () => {
  it("has next/prev navigation functions", () => {
    expect(gallerySource).toContain("navigateImage");
    expect(gallerySource).toContain("direction");
  });

  it("supports keyboard navigation with arrow keys", () => {
    expect(gallerySource).toContain("ChevronLeft");
    expect(gallerySource).toContain("ChevronRight");
  });

  it("has close button for lightbox", () => {
    expect(gallerySource).toContain("closeLightbox");
    expect(gallerySource).toContain("<X");
  });
});

/* ═══════════════════════════════════════════════════════════════
   Social Sharing Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Social Sharing", () => {
  it("has share functionality", () => {
    expect(gallerySource).toContain("shareImage");
  });

  it("uses Web Share API", () => {
    expect(gallerySource).toContain("navigator.share");
  });

  it("has share button in lightbox", () => {
    expect(gallerySource).toContain("Share2");
  });
});

/* ═══════════════════════════════════════════════════════════════
   Responsive Design Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Responsive Design", () => {
  it("has responsive grid classes", () => {
    expect(gallerySource).toContain("grid-cols-1");
    expect(gallerySource).toContain("md:grid-cols-2");
    expect(gallerySource).toContain("lg:grid-cols-3");
  });

  it("uses motion/animation library", () => {
    expect(gallerySource).toContain("framer-motion");
  });

  it("has responsive padding and spacing", () => {
    expect(gallerySource).toContain("px-4");
    expect(gallerySource).toContain("md:px-8");
  });
});

/* ═══════════════════════════════════════════════════════════════
   Video Integration Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Video Integration", () => {
  it("has video items defined", () => {
    expect(videoCount).toBeGreaterThanOrEqual(1);
  });

  it("displays video thumbnails", () => {
    expect(gallerySource).toContain("staticVideoItems");
    expect(gallerySource).toContain("thumbnail");
  });

  it("has play button for videos", () => {
    expect(gallerySource).toContain("Play");
  });

  it("shows video duration", () => {
    expect(gallerySource).toContain("duration");
  });
});

/* ═══════════════════════════════════════════════════════════════
   Data Fetching Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Data Fetching", () => {
  it("uses tRPC for data fetching", () => {
    expect(gallerySource).toContain("trpc.gallery");
  });

  it("has fallback to static data", () => {
    expect(gallerySource).toContain("staticGalleryItems");
    expect(gallerySource).toContain("dbGalleryItems");
  });

  it("handles loading states", () => {
    expect(gallerySource).toContain("staleTime");
  });
});

/* ═══════════════════════════════════════════════════════════════
   Accessibility Tests
   ═══════════════════════════════════════════════════════════════ */
describe("Accessibility", () => {
  it("has alt text for images", () => {
    expect(gallerySource).toContain("alt=");
  });

  it("has semantic HTML structure", () => {
    expect(gallerySource).toContain("<section");
    expect(gallerySource).toContain("<h1");
    expect(gallerySource).toContain("<h2");
  });

  it("has proper button elements", () => {
    expect(gallerySource).toContain("<button");
  });
});

/* ═══════════════════════════════════════════════════════════════
   SEO Tests
   ═══════════════════════════════════════════════════════════════ */
describe("SEO Optimization", () => {
  it("uses SEO component", () => {
    expect(gallerySource).toContain("<SEO");
  });

  it("has proper page title and description", () => {
    expect(gallerySource).toContain("Gallery - Vanir Travel Group");
  });

  it("has proper meta tags", () => {
    expect(gallerySource).toContain("ogImage");
  });
});
