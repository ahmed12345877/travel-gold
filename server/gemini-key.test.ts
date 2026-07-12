import { describe, it, expect } from "vitest";

const apiKey = process.env.GEMINI_API_KEY;

describe("Gemini API Key Validation", () => {
  it.skipIf(!apiKey)("should have GEMINI_API_KEY set", () => {
    expect(apiKey).toBeDefined();
    expect(apiKey!.length).toBeGreaterThan(10);
    expect(apiKey!.startsWith("AIza")).toBe(true);
  });

  it.skipIf(!apiKey)("should be able to reach Gemini API", async () => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.models).toBeDefined();
    expect(data.models.length).toBeGreaterThan(0);
  });
});
