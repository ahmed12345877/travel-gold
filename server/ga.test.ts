import { describe, it, expect } from "vitest";

describe("Google Analytics configuration", () => {
  it("VITE_GA_MEASUREMENT_ID is set and follows GA4 format", () => {
    const gaId = process.env.VITE_GA_MEASUREMENT_ID;
    expect(gaId).toBeDefined();
    expect(gaId).toBeTruthy();
    // GA4 IDs start with G- followed by alphanumeric characters
    expect(gaId).toMatch(/^G-[A-Z0-9]+$/);
  });
});
