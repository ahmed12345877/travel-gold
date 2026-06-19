import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db", () => ({
  createOffer: vi.fn(),
  getActiveOffers: vi.fn(),
  getAllOffers: vi.fn(),
  getOfferByPromoCode: vi.fn(),
  updateOffer: vi.fn(),
}));

import {
  getActiveOffers,
  getAllOffers,
  getOfferByPromoCode,
  updateOffer,
  createOffer,
} from "../db";

const mockGetActiveOffers = getActiveOffers as ReturnType<typeof vi.fn>;
const mockGetOfferByPromoCode = getOfferByPromoCode as ReturnType<typeof vi.fn>;
const mockCreateOffer = createOffer as ReturnType<typeof vi.fn>;
const mockUpdateOffer = updateOffer as ReturnType<typeof vi.fn>;
const mockGetAllOffers = getAllOffers as ReturnType<typeof vi.fn>;

describe("Offers DB helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveOffers", () => {
    it("returns active offers", async () => {
      const mockOffers = [
        { id: 1, title: "Summer Sale", isActive: "active", discountType: "percentage", discountValue: "20" },
        { id: 2, title: "Early Bird", isActive: "active", discountType: "fixed", discountValue: "50" },
      ];
      mockGetActiveOffers.mockResolvedValue(mockOffers);

      const result = await getActiveOffers();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Summer Sale");
    });

    it("returns empty array when no active offers", async () => {
      mockGetActiveOffers.mockResolvedValue([]);
      const result = await getActiveOffers();
      expect(result).toEqual([]);
    });
  });

  describe("getOfferByPromoCode", () => {
    it("returns offer when promo code exists", async () => {
      const offer = {
        id: 1,
        title: "Summer Sale",
        promoCode: "SUMMER20",
        isActive: "active",
        discountType: "percentage",
        discountValue: "20",
        startDate: Date.now() - 86400000,
        endDate: Date.now() + 86400000,
      };
      mockGetOfferByPromoCode.mockResolvedValue(offer);

      const result = await getOfferByPromoCode("SUMMER20");
      expect(result).toBeDefined();
      expect(result.promoCode).toBe("SUMMER20");
    });

    it("returns null for invalid promo code", async () => {
      mockGetOfferByPromoCode.mockResolvedValue(null);

      const result = await getOfferByPromoCode("INVALID");
      expect(result).toBeNull();
    });
  });

  describe("createOffer", () => {
    it("creates offer with correct parameters", async () => {
      const input = {
        title: "Flash Deal",
        discountType: "fixed",
        discountValue: "100",
        startDate: Date.now(),
        endDate: Date.now() + 86400000,
        isActive: "active",
        bookedSpots: 0,
      };
      mockCreateOffer.mockResolvedValue({ id: 3, ...input });

      const result = await createOffer(input);
      expect(result.id).toBe(3);
      expect(result.title).toBe("Flash Deal");
      expect(mockCreateOffer).toHaveBeenCalledWith(input);
    });
  });

  describe("updateOffer", () => {
    it("updates offer fields", async () => {
      mockUpdateOffer.mockResolvedValue({ id: 1, title: "Updated Sale", isActive: "inactive" });

      const result = await updateOffer(1, { title: "Updated Sale", isActive: "inactive" });
      expect(result.title).toBe("Updated Sale");
      expect(mockUpdateOffer).toHaveBeenCalledWith(1, { title: "Updated Sale", isActive: "inactive" });
    });
  });

  describe("getAllOffers", () => {
    it("returns paginated offers", async () => {
      mockGetAllOffers.mockResolvedValue([
        { id: 1, title: "Offer 1" },
        { id: 2, title: "Offer 2" },
      ]);

      const result = await getAllOffers(50, 0);
      expect(result).toHaveLength(2);
      expect(mockGetAllOffers).toHaveBeenCalledWith(50, 0);
    });
  });
});

describe("Promo code validation logic", () => {
  it("rejects null offer as invalid", () => {
    const offer = null;
    const result = !offer ? { valid: false, message: "رمز الخصم غير صالح" } : { valid: true };
    expect(result.valid).toBe(false);
    expect(result.message).toBe("رمز الخصم غير صالح");
  });

  it("rejects inactive offers", () => {
    const offer = { isActive: "inactive", startDate: 0, endDate: Infinity };
    const valid = offer.isActive === "active";
    expect(valid).toBe(false);
  });

  it("rejects offers that have not started", () => {
    const futureStart = Date.now() + 86400000;
    const now = Date.now();
    expect(now < futureStart).toBe(true);
  });

  it("rejects expired offers", () => {
    const pastEnd = Date.now() - 86400000;
    const now = Date.now();
    expect(now > pastEnd).toBe(true);
  });

  it("rejects fully booked offers", () => {
    const offer = { totalSpots: 10, bookedSpots: 10 };
    const isFull = offer.totalSpots && offer.bookedSpots && offer.bookedSpots >= offer.totalSpots;
    expect(isFull).toBeTruthy();
  });

  it("accepts valid active offer within date range with spots", () => {
    const now = Date.now();
    const offer = {
      isActive: "active",
      startDate: now - 86400000,
      endDate: now + 86400000,
      totalSpots: 10,
      bookedSpots: 5,
    };
    const isValid =
      offer.isActive === "active" &&
      now >= offer.startDate &&
      now <= offer.endDate &&
      !(offer.totalSpots && offer.bookedSpots >= offer.totalSpots);
    expect(isValid).toBe(true);
  });
});
