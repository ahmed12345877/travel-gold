import { describe, it, expect } from "vitest";

const key = process.env.OPENAI_API_KEY;

describe("OpenAI API Key Validation", () => {
  it.skipIf(!key)("should have OPENAI_API_KEY environment variable set", () => {
    expect(key).toBeDefined();
    expect(key).not.toBe("");
    expect(key!.startsWith("sk-")).toBe(true);
  });

  it.skipIf(!key)("should be able to reach OpenAI API with the key", async () => {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    // 200 = valid key, 401 = invalid key
    expect(response.status).toBe(200);
  });
});
