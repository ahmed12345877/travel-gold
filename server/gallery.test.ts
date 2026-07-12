import { describe, expect, it, vi, beforeEach } from "vitest";

/* ─── Shared state via vi.hoisted so mock factories can access them ─── */
const { mockItems, mockVideos, nextItemId, nextVideoId } = vi.hoisted(() => ({
  mockItems: [] as any[],
  mockVideos: [] as any[],
  nextItemId: { value: 1 },
  nextVideoId: { value: 1 },
}));

// Mock Firebase Admin with a stateful Firestore backed by mockItems/mockVideos
vi.mock("./_core/firebaseAdmin", () => {
  function getArr(col: string) {
    if (col === "gallery_items") return mockItems;
    if (col === "gallery_videos") return mockVideos;
    return [];
  }

  function makeDoc(item: any, col: string) {
    const docId = String(item._docId ?? item.id ?? "doc");
    const ref: any = {
      id: docId,
      set: vi.fn(async (data: any) => { Object.assign(item, data); }),
      get: vi.fn(async () => ({ data: () => item })),
      delete: vi.fn(async () => {
        const arr = getArr(col);
        const idx = arr.indexOf(item);
        if (idx !== -1) arr.splice(idx, 1);
      }),
    };
    return { id: docId, ref, data: () => item };
  }

  return {
    db: {
      collection: vi.fn((col: string) => {
        const filters: { field: string; op: string; value: any }[] = [];
        const q: any = {};
        q.where = vi.fn((f: string, o: string, v: any) => { filters.push({ field: f, op: o, value: v }); return q; });
        q.orderBy = vi.fn(() => q);
        q.offset = vi.fn(() => q);
        q.limit = vi.fn(() => q);
        q.get = vi.fn(async () => {
          let items = [...getArr(col)];
          for (const f of filters) {
            if (f.op === "==") items = items.filter((i: any) => i[f.field] === f.value);
          }
          // Ensure items have _docId for router lookup
          for (const i of items) { if (i._docId === undefined && i.id !== undefined) i._docId = i.id; }
          const docs = items.map((i: any) => makeDoc(i, col));
          return { empty: docs.length === 0, docs };
        });
        q.doc = vi.fn(() => ({
          get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
          set: vi.fn().mockResolvedValue(undefined),
          delete: vi.fn().mockResolvedValue(undefined),
        }));
        q.add = vi.fn(async (data: any) => {
          const id = col === "gallery_videos" ? nextVideoId.value++ : nextItemId.value++;
          const item = { ...data, id, _docId: id };
          getArr(col).push(item);
          return {
            id: String(id),
            get: vi.fn(async () => ({ data: () => item })),
          };
        });
        return q;
      }),
      runTransaction: vi.fn(async (fn: any) => fn({
        get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
        set: vi.fn(),
      })),
    },
    getBucket: vi.fn(() => ({})),
  };
});

vi.mock("./_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-session-token"),
    verifySession: vi.fn().mockResolvedValue(null),
  },
}));

/* ─── Mock S3 storage ─── */
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://cdn.example.com/gallery/test.jpg",
    key: "gallery/test.jpg",
  }),
}));

/* ─── Mock DB (full replacement, no importOriginal to avoid Firebase import) ─── */
vi.mock("./db", () => ({
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  createBooking: vi.fn().mockResolvedValue({ id: 1 }),
  getBookingById: vi.fn().mockResolvedValue(null),
  getBookingByConfirmationCode: vi.fn().mockResolvedValue(null),
  getUserBookings: vi.fn().mockResolvedValue([]),
  updateBookingStatus: vi.fn().mockResolvedValue({}),
  updateBookingPaymentStatus: vi.fn().mockResolvedValue({}),
  getAllBookings: vi.fn().mockResolvedValue([]),
  createReview: vi.fn().mockResolvedValue({ id: 1 }),
  getApprovedReviews: vi.fn().mockResolvedValue([]),
  getAllReviews: vi.fn().mockResolvedValue([]),
  getReviewById: vi.fn().mockResolvedValue(null),
  updateReviewApproval: vi.fn().mockResolvedValue({}),
  addAdminReply: vi.fn().mockResolvedValue({}),
  incrementHelpfulCount: vi.fn().mockResolvedValue({}),
  getReviewStats: vi.fn().mockResolvedValue({ total: 0, average: 0, distribution: {} }),
  createContactMessage: vi.fn().mockResolvedValue({ id: 1 }),
  getAllContactMessages: vi.fn().mockResolvedValue([]),
  updateContactMessageStatus: vi.fn().mockResolvedValue(undefined),
  createOffer: vi.fn().mockResolvedValue({ id: 1 }),
  getActiveOffers: vi.fn().mockResolvedValue([]),
  getAllOffers: vi.fn().mockResolvedValue([]),
  getOfferByPromoCode: vi.fn().mockResolvedValue(null),
  updateOffer: vi.fn().mockResolvedValue({}),
  createFileUpload: vi.fn().mockResolvedValue({ id: 1 }),
  getUserFiles: vi.fn().mockResolvedValue([]),
  getAllUsers: vi.fn().mockResolvedValue([]),
  getUsersCount: vi.fn().mockResolvedValue(0),
  getUserById: vi.fn().mockResolvedValue(null),
  updateUserRole: vi.fn().mockResolvedValue(null),
  searchUsers: vi.fn().mockResolvedValue([]),
  getUserStats: vi.fn().mockResolvedValue({ total: 0, admins: 0, recentSignups: 0, todaySignups: 0 }),
  updateUserProfile: vi.fn().mockResolvedValue({}),
  getOrCreateAICredits: vi.fn().mockResolvedValue({ id: 1, balance: "10", totalUsed: "0" }),
  getDb: vi.fn().mockResolvedValue({}),
  getBlogPosts: vi.fn().mockResolvedValue([]),
  getBlogPostBySlug: vi.fn().mockResolvedValue(null),
  incrementBlogViewCount: vi.fn().mockResolvedValue(undefined),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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
  nextItemId.value = 1;
  nextVideoId.value = 1;
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
      { id: 2, title: "Hidden", isVisible: "hidden" }
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
      { id: 2, title: "Hidden Video", isVisible: "hidden" }
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
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.gallery.create({
        imageUrl: "https://cdn.example.com/test.jpg",
        title: "Test",
        category: "Pyramids & Ancient Sites",
      })
    ).rejects.toThrow();
  });
});

describe("gallery.listAll (admin)", () => {
  it("returns all items for admin", async () => {
    mockItems.push(
      { id: 1, title: "Item 1", isVisible: "visible" },
      { id: 2, title: "Item 2", isVisible: "hidden" }
    );
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.listAll({ limit: 100, offset: 0 });
    expect(result).toHaveLength(2);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.gallery.listAll({ limit: 100, offset: 0 })).rejects.toThrow();
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
    const tinyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
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
      })
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
      })
    ).rejects.toThrow();
  });
});

describe("gallery.listAllVideos (admin)", () => {
  it("returns all videos for admin", async () => {
    mockVideos.push(
      { id: 1, title: "Video 1", isVisible: "visible" },
      { id: 2, title: "Video 2", isVisible: "hidden" }
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
