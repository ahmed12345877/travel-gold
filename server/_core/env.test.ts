import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("ENV configuration object", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("falls back to empty strings when env vars are not set", async () => {
    delete process.env.VITE_APP_ID;
    delete process.env.VITE_FIREBASE_APP_ID;
    delete process.env.JWT_SECRET;
    delete process.env.DATABASE_URL;
    delete process.env.OAUTH_SERVER_URL;
    delete process.env.OWNER_OPEN_ID;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;

    const { ENV } = await import("./env");
    expect(ENV.appId).toBe("");
    expect(ENV.cookieSecret).toBe("");
    expect(ENV.databaseUrl).toBe("");
    expect(ENV.oAuthServerUrl).toBe("");
    expect(ENV.ownerOpenId).toBe("");
    expect(ENV.openaiApiKey).toBe("");
    expect(ENV.geminiApiKey).toBe("");
    expect(ENV.adminEmail).toBe("");
    expect(ENV.adminPasswordHash).toBe("");
  });

  it("reads values from env vars when set", async () => {
    process.env.VITE_APP_ID = "test-app";
    process.env.JWT_SECRET = "secret123";
    process.env.DATABASE_URL = "postgres://localhost";
    process.env.NODE_ENV = "production";

    const { ENV } = await import("./env");
    expect(ENV.appId).toBe("test-app");
    expect(ENV.cookieSecret).toBe("secret123");
    expect(ENV.databaseUrl).toBe("postgres://localhost");
    expect(ENV.isProduction).toBe(true);
  });

  it("isProduction is false when NODE_ENV is not production", async () => {
    process.env.NODE_ENV = "development";

    const { ENV } = await import("./env");
    expect(ENV.isProduction).toBe(false);
  });

  it("falls back to VITE_FIREBASE_APP_ID when VITE_APP_ID is not set", async () => {
    delete process.env.VITE_APP_ID;
    process.env.VITE_FIREBASE_APP_ID = "firebase-app-id";

    const { ENV } = await import("./env");
    expect(ENV.appId).toBe("firebase-app-id");
  });
});
