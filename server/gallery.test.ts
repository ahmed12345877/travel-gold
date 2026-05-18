import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/* ─── Mock S3 storage ─── */
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://cdn.example.com/gallery/test.jpg",
    key: "gallery/test.jpg",
  }),
}));

/* ─── Mock DB helpers ─── */
const mockItems: any[] = [];
const mockVideos: any[] = [];
let nextItemId = 1;
let nextVideoId = 1;

vi.mock("./db", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    createGalleryItem: vi.fn((data: any) => {
      const item = {
        id: nextItemId++,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockItems.push(item);
      return item;
    }),
    getVisibleGalleryItems: vi.fn(() =>
      mockItems.filter((i) => i.isVisible === "visible"),
    ),
    getAllGalleryItems: vi.fn((_limit?: number, _offset?: number) => mockItems),
    getGalleryItemById: vi.fn(
      (id: number) => mockItems.find((i) => i.id === id) || null,
    ),
    updateGalleryItem: vi.fn((id: number, data: any) => {
      const idx = mockItems.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error("Not found");
      mockItems[idx] = { ...mockItems[idx], ...data, updatedAt: new Date() };
      return mockItems[idx];
    }),
    deleteGalleryItem: vi.fn((id: number) => {
      const idx = mockItems.findIndex((i) => i.id === id);
      if (idx !== -1) mockItems.splice(idx, 1);
    }),
    createGalleryVideo: vi.fn((data: any) => {
      const video = {
        id: nextVideoId++,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockVideos.push(video);
      return video;
    }),
    getVisibleGalleryVideos: vi.fn(() =>
      mockVideos.filter((v) => v.isVisible === "visible"),
    ),
    getAllGalleryVideos: vi.fn(
      (_limit?: number, _offset?: number) => mockVideos,
    ),
    getGalleryVideoById: vi.fn(
      (id: number) => mockVideos.find((v) => v.id === id) || null,
    ),
    updateGalleryVideo: vi.fn((id: number, data: any) => {
      const idx = mockVideos.findIndex((v) => v.id === id);
      if (idx === -1) throw new Error("Not found");
      mockVideos[idx] = { ...mockVideos[idx], ...data, updatedAt: new Date() };
      return mockVideos[idx];
    }),
    deleteGalleryVideo: vi.fn((id: number) => {
      const idx = mockVideos.findIndex((v) => v.id === id);
      if (idx !== -1) mockVideos.splice(idx, 1);
    }),
  };
});

/* ─── Context Helpers ─── */
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@vanirgroup.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "normal-user",
      email: "user@example.com",
      name: "User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  mockItems.length = 0;
  mockVideos.length = 0;
  nextItemId = 1;
  nextVideoId = 1;
});

/* ═══════════════════════════════════════════════════════════════
   Gallery Items Tests
   ═══════════════════════════════════════════════════════════════ */
describe("gallery.listVisible (public)", () => {
  it("returns empty array when no items exist", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.gallery.listVisible();
    expect(result).toEqual([]);
  });

  it("returns only visible items", async () => {
    mockItems.push(
      { id: 1, title: "Visible", isVisible: "visible" },
      { id: 2, title: "Hidden", isVisible: "hidden" },
    );
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.gallery.listVisible();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Visible");
  });
});

describe("gallery.listVisibleVideos (public)", () => {
  it("returns empty array when no videos exist", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.gallery.listVisibleVideos();
    expect(result).toEqual([]);
  });

  it("returns only visible videos", async () => {
    mockVideos.push(
      { id: 1, title: "Visible Video", isVisible: "visible" },
      { id: 2, title: "Hidden Video", isVisible: "hidden" },
    );
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.gallery.listVisibleVideos();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Visible Video");
  });
});

describe("gallery.create (admin)", () => {
  it("creates a gallery item as admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.create({
      imageUrl: "https://cdn.example.com/test.jpg",
      title: "Great Pyramids",
      titleAr: "الأهرامات العظيمة",
      category: "Pyramids & Ancient Sites",
      categoryAr: "الأهرامات والمواقع الأثرية",
      featured: "no",
      aspect: "landscape",
    });
    expect(result.title).toBe("Great Pyramids");
    expect(result.isVisible).toBe("visible");
    expect(result.id).toBe(1);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.gallery.create({
        imageUrl: "https://cdn.example.com/test.jpg",
        title: "Test",
        category: "Pyramids & Ancient Sites",
      }),
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.gallery.create({
        imageUrl: "https://cdn.example.com/test.jpg",
        title: "Test",
        category: "Pyramids & Ancient Sites",
      }),
    ).rejects.toThrow();
  });
});

describe("gallery.listAll (admin)", () => {
  it("returns all items for admin", async () => {
    mockItems.push(
      { id: 1, title: "Item 1", isVisible: "visible" },
      { id: 2, title: "Item 2", isVisible: "hidden" },
    );
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.listAll({ limit: 100, offset: 0 });
    expect(result).toHaveLength(2);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.gallery.listAll({ limit: 100, offset: 0 }),
    ).rejects.toThrow();
  });
});

describe("gallery.update (admin)", () => {
  it("updates a gallery item", async () => {
    mockItems.push({
      id: 1,
      title: "Old Title",
      isVisible: "visible",
      featured: "no",
    });
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.update({
      id: 1,
      title: "New Title",
      featured: "yes",
    });
    expect(result.title).toBe("New Title");
    expect(result.featured).toBe("yes");
  });

  it("toggles visibility", async () => {
    mockItems.push({ id: 1, title: "Test", isVisible: "visible" });
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.update({ id: 1, isVisible: "hidden" });
    expect(result.isVisible).toBe("hidden");
  });
});

describe("gallery.delete (admin)", () => {
  it("deletes a gallery item", async () => {
    mockItems.push({ id: 1, title: "To Delete" });
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.delete({ id: 1 });
    expect(result).toEqual({ success: true });
    expect(mockItems).toHaveLength(0);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.gallery.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("gallery.uploadImage (admin)", () => {
  it("uploads an image and returns URL", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    // Small base64 encoded 1x1 pixel PNG
    const tinyPng =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await caller.gallery.uploadImage({
      fileData: tinyPng,
      filename: "test.png",
      mimeType: "image/png",
    });
    expect(result.url).toBeDefined();
    expect(result.fileKey).toBeDefined();
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.gallery.uploadImage({
        fileData: "dGVzdA==",
        filename: "test.png",
        mimeType: "image/png",
      }),
    ).rejects.toThrow();
  });
});

/* ═══════════════════════════════════════════════════════════════
   Gallery Videos Tests
   ═══════════════════════════════════════════════════════════════ */
describe("gallery.createVideo (admin)", () => {
  it("creates a gallery video", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.createVideo({
      thumbnailUrl: "https://img.youtube.com/vi/test/maxresdefault.jpg",
      title: "Nile Cruise Tour",
      titleAr: "جولة نيلية",
      youtubeId: "dQw4w9WgXcQ",
      duration: "8:45",
      views: "12.5K",
    });
    expect(result.title).toBe("Nile Cruise Tour");
    expect(result.youtubeId).toBe("dQw4w9WgXcQ");
    expect(result.isVisible).toBe("visible");
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.gallery.createVideo({
        thumbnailUrl: "https://img.youtube.com/vi/test/maxresdefault.jpg",
        title: "Test",
        youtubeId: "test123",
      }),
    ).rejects.toThrow();
  });
});

describe("gallery.listAllVideos (admin)", () => {
  it("returns all videos for admin", async () => {
    mockVideos.push(
      { id: 1, title: "Video 1", isVisible: "visible" },
      { id: 2, title: "Video 2", isVisible: "hidden" },
    );
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.listAllVideos({ limit: 50, offset: 0 });
    expect(result).toHaveLength(2);
  });
});

describe("gallery.updateVideo (admin)", () => {
  it("updates a gallery video", async () => {
    mockVideos.push({
      id: 1,
      title: "Old Video",
      isVisible: "visible",
    });
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.updateVideo({
      id: 1,
      title: "Updated Video",
      isVisible: "hidden",
    });
    expect(result.title).toBe("Updated Video");
    expect(result.isVisible).toBe("hidden");
  });
});

describe("gallery.deleteVideo (admin)", () => {
  it("deletes a gallery video", async () => {
    mockVideos.push({ id: 1, title: "To Delete" });
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.deleteVideo({ id: 1 });
    expect(result).toEqual({ success: true });
    expect(mockVideos).toHaveLength(0);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.gallery.deleteVideo({ id: 1 })).rejects.toThrow();
  });
});
