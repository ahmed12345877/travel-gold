import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => {
  let bookingIdCounter = 0;
  let reviewIdCounter = 0;
  let contactIdCounter = 0;
  let offerIdCounter = 0;

  return {
    createBooking: vi.fn(async (data: any) => {
      bookingIdCounter++;
      return {
        id: bookingIdCounter,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    getBookingById: vi.fn(async (id: number) => ({
      id,
      packageName: "Test Package",
      status: "pending",
      confirmationCode: "VNR-TEST1234",
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getBookingByConfirmationCode: vi.fn(async (code: string) => ({
      id: 1,
      packageName: "Test Package",
      confirmationCode: code,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getUserBookings: vi.fn(async () => []),
    updateBookingStatus: vi.fn(async (id: number, status: string) => ({
      id,
      status,
      packageName: "Test Package",
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    updateBookingPaymentStatus: vi.fn(async (id: number, paymentStatus: string) => ({
      id,
      paymentStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getAllBookings: vi.fn(async () => []),
    createReview: vi.fn(async (data: any) => {
      reviewIdCounter++;
      return {
        id: reviewIdCounter,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    getApprovedReviews: vi.fn(async () => []),
    getAllReviews: vi.fn(async () => []),
    getReviewById: vi.fn(async (id: number) => ({
      id,
      tripName: "Test Trip",
      rating: 5,
      content: "Great experience!",
      isApproved: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    updateReviewApproval: vi.fn(async (id: number, isApproved: string) => ({
      id,
      isApproved,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    addAdminReply: vi.fn(async (id: number, reply: string) => ({
      id,
      adminReply: reply,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    incrementHelpfulCount: vi.fn(async (id: number) => ({
      id,
      helpfulCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getReviewStats: vi.fn(async () => ({
      total: 10,
      average: 4.5,
      distribution: { 1: 0, 2: 1, 3: 1, 4: 3, 5: 5 },
    })),
    createContactMessage: vi.fn(async (data: any) => {
      contactIdCounter++;
      return {
        id: contactIdCounter,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    getAllContactMessages: vi.fn(async () => []),
    updateContactMessageStatus: vi.fn(async () => {}),
    createOffer: vi.fn(async (data: any) => {
      offerIdCounter++;
      return {
        id: offerIdCounter,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    getActiveOffers: vi.fn(async () => []),
    getAllOffers: vi.fn(async () => []),
    getOfferByPromoCode: vi.fn(async (code: string) => {
      if (code === "VALID20") {
        return {
          id: 1,
          title: "20% Off",
          promoCode: "VALID20",
          discountType: "percentage",
          discountValue: "20.00",
          isActive: "active",
          startDate: Date.now() - 86400000,
          endDate: Date.now() + 86400000,
          totalSpots: 10,
          bookedSpots: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    }),
    updateOffer: vi.fn(async (id: number, data: any) => ({
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    upsertUser: vi.fn(async () => {}),
    getUserByOpenId: vi.fn(async () => undefined),
    createFileUpload: vi.fn(async (data: any) => ({
      id: 1,
      ...data,
      createdAt: new Date(),
    })),
    getUserFiles: vi.fn(async () => []),
    // User management helpers
    getAllUsers: vi.fn(async () => []),
    getUsersCount: vi.fn(async () => 0),
    getUserById: vi.fn(async () => null),
    updateUserRole: vi.fn(async () => null),
    searchUsers: vi.fn(async () => []),
    getUserStats: vi.fn(async () => ({ total: 0, admins: 0, recentSignups: 0, todaySignups: 0 })),
    // Profile update helper
    updateUserProfile: vi.fn(async (id: number, data: any) => ({
      id,
      openId: "test-user-123",
      name: data.name ?? "Test User",
      email: "test@example.com",
      phone: data.phone ?? null,
      avatarUrl: data.avatarUrl ?? null,
      role: "user",
      loginMethod: "manus",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    })),
    // Profile stats helpers
    getOrCreateAICredits: vi.fn(async () => ({ id: 1, userId: 1, balance: "10", totalUsed: "5", createdAt: new Date(), updatedAt: new Date() })),
    getDb: vi.fn(async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };
      return mockDb;
    }),
  };
});

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: () => "ABCD1234",
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ============ BOOKING TESTS ============
describe("bookings router", () => {
  it("creates a booking as a guest (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.bookings.create({
      packageName: "Pyramids & Nile Cruise",
      destination: "Cairo, Egypt",
      adults: 2,
      children: 0,
      guestName: "John Doe",
      guestEmail: "john@example.com",
    });

    expect(result).toBeDefined();
    expect(result.packageName).toBe("Pyramids & Nile Cruise");
    expect(result.confirmationCode).toBe("VNR-ABCD1234");
  });

  it("creates a booking as an authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.bookings.create({
      packageName: "Sharm El Sheikh Beach",
      adults: 1,
    });

    expect(result).toBeDefined();
    expect(result.userId).toBe(1);
  });

  it("gets booking by ID (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.bookings.getById({ id: 1 });

    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
  });

  it("gets booking by confirmation code (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.bookings.getByCode({ code: "VNR-TEST1234" });

    expect(result).toBeDefined();
    expect(result?.confirmationCode).toBe("VNR-TEST1234");
  });

  it("rejects myBookings for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.bookings.myBookings()).rejects.toThrow();
  });

  it("returns user bookings for authenticated users", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.bookings.myBookings();
    expect(result).toEqual([]);
  });

  it("rejects admin operations for non-admin users", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(
      caller.bookings.updateStatus({ id: 1, status: "confirmed" })
    ).rejects.toThrow();
  });

  it("allows admin to update booking status", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.bookings.updateStatus({
      id: 1,
      status: "confirmed",
    });
    expect(result?.status).toBe("confirmed");
  });

  it("allows admin to list all bookings", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.bookings.listAll();
    expect(result).toEqual([]);
  });
});

// ============ REVIEWS TESTS ============
describe("reviews router", () => {
  it("lists approved reviews (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.list();
    expect(result).toEqual([]);
  });

  it("returns review stats (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.stats();
    expect(result.total).toBe(10);
    expect(result.average).toBe(4.5);
    expect(result.distribution).toBeDefined();
  });

  it("creates a review as a guest", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.create({
      tripName: "Pyramids Tour",
      rating: 5,
      content: "Amazing experience, highly recommended!",
      title: "Best Trip Ever",
      guestName: "Jane Doe",
    });

    expect(result).toBeDefined();
    expect(result.tripName).toBe("Pyramids Tour");
    expect(result.rating).toBe(5);
    expect(result.isApproved).toBe("pending");
  });

  it("marks a review as helpful (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.markHelpful({ id: 1 });
    expect(result?.helpfulCount).toBe(1);
  });

  it("rejects admin operations for non-admin users", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(
      caller.reviews.moderate({ id: 1, isApproved: "approved" })
    ).rejects.toThrow();
  });

  it("allows admin to moderate reviews", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.reviews.moderate({
      id: 1,
      isApproved: "approved",
    });
    expect(result?.isApproved).toBe("approved");
  });

  it("allows admin to reply to reviews", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.reviews.reply({
      id: 1,
      adminReply: "Thank you for your feedback!",
    });
    expect(result?.adminReply).toBe("Thank you for your feedback!");
  });
});

// ============ CONTACT TESTS ============
describe("contact router", () => {
  it("submits a contact message (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.contact.submit({
      name: "Ahmed",
      email: "ahmed@example.com",
      phone: "+201234567890",
      subject: "Trip Inquiry",
      message: "I would like to know more about the Pyramids tour package.",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("validates required fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.contact.submit({
        name: "",
        email: "test@test.com",
        message: "Short message that is at least 10 chars",
      })
    ).rejects.toThrow();
  });

  it("validates email format", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.contact.submit({
        name: "Test",
        email: "invalid-email",
        message: "This is a test message for validation",
      })
    ).rejects.toThrow();
  });

  it("rejects admin operations for non-admin users", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.contact.listAll()).rejects.toThrow();
  });

  it("allows admin to list all messages", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.contact.listAll();
    expect(result).toEqual([]);
  });
});

// ============ OFFERS TESTS ============
describe("offers router", () => {
  it("lists active offers (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.offers.listActive();
    expect(result).toEqual([]);
  });

  it("validates a valid promo code", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.offers.validatePromo({ promoCode: "VALID20" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.discountType).toBe("percentage");
      expect(result.discountValue).toBe("20.00");
    }
  });

  it("rejects an invalid promo code", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.offers.validatePromo({ promoCode: "INVALID" });
    expect(result.valid).toBe(false);
  });

  it("rejects admin operations for non-admin users", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.offers.listAll()).rejects.toThrow();
  });

  it("allows admin to create an offer", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.offers.create({
      title: "Summer Sale",
      discountType: "percentage",
      discountValue: "30",
      startDate: Date.now(),
      endDate: Date.now() + 86400000 * 7,
      promoCode: "SUMMER30",
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Summer Sale");
  });
});

// ============ ADMIN OFFERS MANAGEMENT TESTS ============
describe("admin offers management", () => {
  it("allows admin to list all offers", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.offers.listAll();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to create an offer with all fields", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.offers.create({
      title: "Winter Special",
      description: "Enjoy 40% off all winter destinations",
      discountType: "percentage",
      discountValue: "40",
      promoCode: "WINTER40",
      startDate: Date.now(),
      endDate: Date.now() + 86400000 * 14,
      category: "Beach",
      destination: "Hurghada",
      totalSpots: 50,
      badgeText: "HOT DEAL",
      badgeColor: "#FF0000",
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Winter Special");
    expect(result.discountType).toBe("percentage");
    expect(result.discountValue).toBe("40");
    expect(result.isActive).toBe("active");
  });

  it("allows admin to create a fixed-amount offer", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.offers.create({
      title: "$100 Off Nile Cruise",
      discountType: "fixed",
      discountValue: "100",
      startDate: Date.now(),
      endDate: Date.now() + 86400000 * 7,
    });

    expect(result).toBeDefined();
    expect(result.discountType).toBe("fixed");
    expect(result.discountValue).toBe("100");
  });

  it("allows admin to update an offer", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.offers.update({
      id: 1,
      title: "Updated Summer Sale",
      discountValue: "50",
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Updated Summer Sale");
    expect(result.discountValue).toBe("50");
  });

  it("allows admin to deactivate an offer", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.offers.update({
      id: 1,
      isActive: "inactive",
    });

    expect(result).toBeDefined();
    expect(result.isActive).toBe("inactive");
  });

  it("allows admin to reactivate an offer", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.offers.update({
      id: 1,
      isActive: "active",
    });

    expect(result).toBeDefined();
    expect(result.isActive).toBe("active");
  });

  it("allows admin to mark an offer as expired", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.offers.update({
      id: 1,
      isActive: "expired",
    });

    expect(result).toBeDefined();
    expect(result.isActive).toBe("expired");
  });

  it("rejects regular user from creating offers", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(
      caller.offers.create({
        title: "Unauthorized Offer",
        discountType: "percentage",
        discountValue: "10",
        startDate: Date.now(),
        endDate: Date.now() + 86400000,
      })
    ).rejects.toThrow();
  });

  it("rejects regular user from updating offers", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(
      caller.offers.update({ id: 1, title: "Hacked" })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated user from listing all offers", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.offers.listAll()).rejects.toThrow();
  });
});

// ============ AUTH TESTS ============
describe("auth router", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test User");
    expect(result?.email).toBe("test@example.com");
  });
});

// ============ ADMIN DASHBOARD ACCESS TESTS ============
describe("admin dashboard access control", () => {
  it("rejects unauthenticated users from admin bookings list", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.bookings.listAll()).rejects.toThrow();
  });

  it("rejects unauthenticated users from admin reviews list", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.reviews.listAll()).rejects.toThrow();
  });

  it("rejects unauthenticated users from admin contact messages", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.contact.listAll()).rejects.toThrow();
  });

  it("rejects regular users from admin bookings list", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.bookings.listAll()).rejects.toThrow();
  });

  it("rejects regular users from admin reviews list", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.reviews.listAll()).rejects.toThrow();
  });

  it("rejects regular users from admin contact messages", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.contact.listAll()).rejects.toThrow();
  });

  it("allows admin to access all admin endpoints", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));

    const bookings = await caller.bookings.listAll();
    expect(bookings).toBeDefined();

    const reviews = await caller.reviews.listAll();
    expect(reviews).toBeDefined();

    const messages = await caller.contact.listAll();
    expect(messages).toBeDefined();

    const offers = await caller.offers.listAll();
    expect(offers).toBeDefined();
  });

  it("allows admin to update booking status", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.bookings.updateStatus({
      id: 1,
      status: "confirmed",
    });
    expect(result?.status).toBe("confirmed");
  });

  it("allows admin to update booking payment status", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.bookings.updatePaymentStatus({
      id: 1,
      paymentStatus: "paid",
    });
    expect(result?.paymentStatus).toBe("paid");
  });

  it("allows admin to moderate a review", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.reviews.moderate({
      id: 1,
      isApproved: "rejected",
    });
    expect(result?.isApproved).toBe("rejected");
  });

  it("allows admin to reply to a review", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.reviews.reply({
      id: 1,
      adminReply: "We appreciate your feedback!",
    });
    expect(result?.adminReply).toBe("We appreciate your feedback!");
  });

  it("allows admin to update contact message status", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.contact.updateStatus({
      id: 1,
      status: "replied",
    });
    expect(result).toBeDefined();
  });

  it("rejects regular user from updating booking status", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(
      caller.bookings.updateStatus({ id: 1, status: "confirmed" })
    ).rejects.toThrow();
  });

  it("rejects regular user from updating contact message status", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(
      caller.contact.updateStatus({ id: 1, status: "read" })
    ).rejects.toThrow();
  });
});

// ============ USER PROFILE TESTS ============
describe("users router - profile", () => {
  it("returns current user profile for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.users.profile();
    expect(result).toBeDefined();
    expect(result.name).toBe("Test User");
    expect(result.email).toBe("test@example.com");
    expect(result.role).toBe("user");
  });

  it("rejects profile access for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.users.profile()).rejects.toThrow();
  });

  it("returns profile stats for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.users.profileStats();
    expect(result).toBeDefined();
    expect(typeof result.bookings).toBe("number");
    expect(typeof result.reviews).toBe("number");
    expect(typeof result.aiCredits).toBe("number");
  });

  it("rejects profileStats for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.users.profileStats()).rejects.toThrow();
  });

  it("returns admin profile with admin role", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.users.profile();
    expect(result).toBeDefined();
    expect(result.role).toBe("admin");
  });
});

// ============ REVIEWS - MY REVIEWS TESTS ============
describe("reviews router - myReviews", () => {
  it("returns user reviews for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.reviews.myReviews();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects myReviews for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.reviews.myReviews()).rejects.toThrow();
  });
});

// ============ USERS - UPDATE PROFILE TESTS ============
describe("users router - updateProfile", () => {
  it("updates user name for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.users.updateProfile({ name: "New Name" });
    expect(result).toBeDefined();
    expect(result.name).toBe("New Name");
  });

  it("updates user phone for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.users.updateProfile({ phone: "+20123456789" });
    expect(result).toBeDefined();
    expect(result.phone).toBe("+20123456789");
  });

  it("updates avatar URL for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.users.updateProfile({ avatarUrl: "https://example.com/avatar.jpg" });
    expect(result).toBeDefined();
    expect(result.avatarUrl).toBe("https://example.com/avatar.jpg");
  });

  it("removes avatar by setting null", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.users.updateProfile({ avatarUrl: null });
    expect(result).toBeDefined();
    expect(result.avatarUrl).toBeNull();
  });

  it("updates multiple fields at once", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.users.updateProfile({
      name: "Updated Name",
      phone: "+201234567890",
      avatarUrl: "https://example.com/new-avatar.png",
    });
    expect(result).toBeDefined();
    expect(result.name).toBe("Updated Name");
    expect(result.phone).toBe("+201234567890");
    expect(result.avatarUrl).toBe("https://example.com/new-avatar.png");
  });

  it("rejects updateProfile for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.users.updateProfile({ name: "Hacker" })).rejects.toThrow();
  });

  it("rejects empty name", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.users.updateProfile({ name: "" })).rejects.toThrow();
  });

  it("rejects invalid avatar URL", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.users.updateProfile({ avatarUrl: "not-a-url" })).rejects.toThrow();
  });
});
