import { describe, expect, it } from "vitest";
import {
  getMetaDescription,
  getMetaTitle,
  getSEOMetadata,
  normalizeRoute,
  vanirSeoMatrix,
} from "./seoMatrix";

describe("seoMatrix helpers", () => {
  it("contains the expected route entries", () => {
    expect(Object.keys(vanirSeoMatrix)).toHaveLength(23);
  });

  it("returns metadata for exact routes", () => {
    expect(getMetaTitle("/about")).toBe("The Sovereign Standard | About Vanir Group");
    expect(getMetaDescription("/news")).toContain("curated market reviews");
  });

  it("resolves metadata for key production routes", () => {
    const routes = [
      "/",
      "/about",
      "/hotels",
      "/day-trips",
      "/private-jet",
      "/visa",
      "/packages",
      "/destinations/egypt",
      "/destinations/dubai",
      "/destinations/italy",
    ];
    for (const route of routes) {
      expect(getSEOMetadata(route)).not.toBeNull();
      expect(getMetaTitle(route)).toBeTruthy();
      expect(getMetaDescription(route)).toBeTruthy();
    }
  });

  it("normalizes routes before lookup", () => {
    expect(normalizeRoute("/hotels/?source=ad#hero")).toBe("/hotels");
    expect(getSEOMetadata("/hotels/?source=ad#hero")?.route).toBe("/hotels");
  });

  it("falls back destination sub-routes to the destination root metadata", () => {
    expect(getSEOMetadata("/destinations/dubai/hotels")?.route).toBe("/destinations/dubai");
  });

  it("returns null for unknown routes", () => {
    expect(getSEOMetadata("/not-in-matrix")).toBeNull();
  });
});
