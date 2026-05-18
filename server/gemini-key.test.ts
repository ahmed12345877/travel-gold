import { describe, it, expect } from "vitest";

describe("Gemini API Key Validation", () => {
  it("should have GEMINI_API_KEY set", () => {
    expect(process.env.GEMINI_API_KEY).toBeDefined();
    expect(process.env.GEMINI_API_KEY!.length).toBeGreaterThan(10);
    expect(process.env.GEMINI_API_KEY!.startsWith("AIza")).toBe(true);
  });

  it("should be able to reach Gemini API", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.models).toBeDefined();
    expect(data.models.length).toBeGreaterThan(0);
  });
});
