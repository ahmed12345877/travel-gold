import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database helpers
vi.mock("../db", () => ({
  getAllUsers: vi.fn(),
  getUsersCount: vi.fn(),
  getUserById: vi.fn(),
  updateUserRole: vi.fn(),
  searchUsers: vi.fn(),
  getUserStats: vi.fn(),
  getUserBookings: vi.fn(),
  getOrCreateAICredits: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("../../drizzle/schema", () => ({
  reviews: { userId: "userId" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  sql: vi.fn(),
}));

import {
  getAllUsers,
  getUsersCount,
  getUserById,
  updateUserRole,
  searchUsers,
  getUserStats,
  getUserBookings,
  getOrCreateAICredits,
  getDb,
} from "../db";

const mockGetAllUsers = vi.mocked(getAllUsers);
const mockGetUsersCount = vi.mocked(getUsersCount);
const mockGetUserById = vi.mocked(getUserById);
const mockUpdateUserRole = vi.mocked(updateUserRole);
const mockSearchUsers = vi.mocked(searchUsers);
const mockGetUserStats = vi.mocked(getUserStats);
const mockGetUserBookings = vi.mocked(getUserBookings);
const mockGetOrCreateAICredits = vi.mocked(getOrCreateAICredits);
const mockGetDb = vi.mocked(getDb);

// Mock user data
const mockUser = {
  id: 1,
  openId: "test-open-id",
  name: "Test User",
  email: "test@example.com",
  phone: null,
  avatarUrl: null,
  role: "user" as const,
  createdAt: new Date("2024-01-01"),
  lastSignedIn: new Date("2024-01-15"),
};

const mockAdminUser = {
  ...mockUser,
  id: 2,
  name: "Admin User",
  email: "admin@example.com",
  role: "admin" as const,
};

describe("Users Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should return users list with default pagination", async () => {
      mockGetAllUsers.mockResolvedValue([mockUser, mockAdminUser]);
      const result = await getAllUsers(50, 0);
      expect(result).toHaveLength(2);
      expect(mockGetAllUsers).toHaveBeenCalledWith(50, 0);
    });

    it("should return users list with custom pagination", async () => {
      mockGetAllUsers.mockResolvedValue([mockUser]);
      const result = await getAllUsers(10, 20);
      expect(result).toHaveLength(1);
      expect(mockGetAllUsers).toHaveBeenCalledWith(10, 20);
    });

    it("should return empty array when no users", async () => {
      mockGetAllUsers.mockResolvedValue([]);
      const result = await getAllUsers(50, 0);
      expect(result).toHaveLength(0);
    });
  });

  describe("getUsersCount", () => {
    it("should return total user count", async () => {
      mockGetUsersCount.mockResolvedValue(42);
      const result = await getUsersCount();
      expect(result).toBe(42);
    });

    it("should return 0 when no users", async () => {
      mockGetUsersCount.mockResolvedValue(0);
      const result = await getUsersCount();
      expect(result).toBe(0);
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      mockGetUserById.mockResolvedValue(mockUser);
      const result = await getUserById(1);
      expect(result).toEqual(mockUser);
      expect(result?.name).toBe("Test User");
    });

    it("should return null when user not found", async () => {
      mockGetUserById.mockResolvedValue(null);
      const result = await getUserById(999);
      expect(result).toBeNull();
    });
  });

  describe("updateUserRole", () => {
    it("should update user role to admin", async () => {
      mockUpdateUserRole.mockResolvedValue({ ...mockUser, role: "admin" });
      const result = await updateUserRole(1, "admin");
      expect(result?.role).toBe("admin");
      expect(mockUpdateUserRole).toHaveBeenCalledWith(1, "admin");
    });

    it("should update admin role to user", async () => {
      mockUpdateUserRole.mockResolvedValue({ ...mockAdminUser, role: "user" });
      const result = await updateUserRole(2, "user");
      expect(result?.role).toBe("user");
      expect(mockUpdateUserRole).toHaveBeenCalledWith(2, "user");
    });

    it("should return null when user not found", async () => {
      mockUpdateUserRole.mockResolvedValue(null);
      const result = await updateUserRole(999, "admin");
      expect(result).toBeNull();
    });
  });

  describe("searchUsers", () => {
    it("should search users by name", async () => {
      mockSearchUsers.mockResolvedValue([mockUser]);
      const result = await searchUsers("Test", 20);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test User");
    });

    it("should search users by email", async () => {
      mockSearchUsers.mockResolvedValue([mockUser]);
      const result = await searchUsers("test@example.com", 20);
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no matches", async () => {
      mockSearchUsers.mockResolvedValue([]);
      const result = await searchUsers("nonexistent", 20);
      expect(result).toHaveLength(0);
    });

    it("should respect limit parameter", async () => {
      mockSearchUsers.mockResolvedValue([mockUser]);
      await searchUsers("test", 5);
      expect(mockSearchUsers).toHaveBeenCalledWith("test", 5);
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", async () => {
      mockGetUserStats.mockResolvedValue({
        total: 100,
        admins: 3,
        recentSignups: 15,
        todaySignups: 2,
      });
      const result = await getUserStats();
      expect(result.total).toBe(100);
      expect(result.admins).toBe(3);
      expect(result.recentSignups).toBe(15);
      expect(result.todaySignups).toBe(2);
    });

    it("should return zeros when no users", async () => {
      mockGetUserStats.mockResolvedValue({
        total: 0,
        admins: 0,
        recentSignups: 0,
        todaySignups: 0,
      });
      const result = await getUserStats();
      expect(result.total).toBe(0);
      expect(result.admins).toBe(0);
    });
  });

  describe("getUserBookings (for profileStats)", () => {
    it("should return user bookings", async () => {
      const mockBookings = [
        { id: 1, userId: 1, packageName: "Cairo Tour", status: "confirmed" },
        { id: 2, userId: 1, packageName: "Luxor Trip", status: "pending" },
      ];
      mockGetUserBookings.mockResolvedValue(mockBookings as any);
      const result = await getUserBookings(1);
      expect(result).toHaveLength(2);
      expect(mockGetUserBookings).toHaveBeenCalledWith(1);
    });

    it("should return empty array when no bookings", async () => {
      mockGetUserBookings.mockResolvedValue([]);
      const result = await getUserBookings(1);
      expect(result).toHaveLength(0);
    });
  });

  describe("getOrCreateAICredits (for profileStats)", () => {
    it("should return existing AI credits", async () => {
      const mockCredits = {
        id: 1,
        userId: 1,
        balance: "25",
        totalUsed: "10",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockGetOrCreateAICredits.mockResolvedValue(mockCredits as any);
      const result = await getOrCreateAICredits(1);
      expect(parseFloat(result.balance.toString())).toBe(25);
    });

    it("should create default credits for new user", async () => {
      const mockCredits = {
        id: 2,
        userId: 2,
        balance: "5",
        totalUsed: "0",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockGetOrCreateAICredits.mockResolvedValue(mockCredits as any);
      const result = await getOrCreateAICredits(2);
      expect(parseFloat(result.balance.toString())).toBe(5);
    });
  });

  describe("getDb (for profileStats reviews count)", () => {
    it("should return database instance", async () => {
      const mockDbInstance = { select: vi.fn() };
      mockGetDb.mockResolvedValue(mockDbInstance as any);
      const db = await getDb();
      expect(db).toBeDefined();
      expect(db).toBe(mockDbInstance);
    });

    it("should return null when database not available", async () => {
      mockGetDb.mockResolvedValue(null);
      const db = await getDb();
      expect(db).toBeNull();
    });
  });
});
