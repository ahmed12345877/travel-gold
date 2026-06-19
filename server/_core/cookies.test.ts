import { describe, it, expect } from "vitest";
import { getSessionCookieOptions } from "./cookies";

describe("getSessionCookieOptions", () => {
  it("returns lax + insecure for plain HTTP request", () => {
    const req = { headers: {}, protocol: "http" };
    const opts = getSessionCookieOptions(req);
    expect(opts.httpOnly).toBe(true);
    expect(opts.path).toBe("/");
    expect(opts.sameSite).toBe("lax");
    expect(opts.secure).toBe(false);
  });

  it("returns none + secure for HTTPS request (protocol)", () => {
    const req = { headers: {}, protocol: "https" };
    const opts = getSessionCookieOptions(req);
    expect(opts.sameSite).toBe("none");
    expect(opts.secure).toBe(true);
  });

  it("detects HTTPS from x-forwarded-proto header (string)", () => {
    const req = { headers: { "x-forwarded-proto": "https" } };
    const opts = getSessionCookieOptions(req);
    expect(opts.sameSite).toBe("none");
    expect(opts.secure).toBe(true);
  });

  it("detects HTTPS from x-forwarded-proto header (array)", () => {
    const req = { headers: { "x-forwarded-proto": ["https", "http"] } };
    const opts = getSessionCookieOptions(req);
    expect(opts.sameSite).toBe("none");
    expect(opts.secure).toBe(true);
  });

  it("detects HTTPS from comma-separated x-forwarded-proto", () => {
    const req = { headers: { "x-forwarded-proto": "https, http" } };
    const opts = getSessionCookieOptions(req);
    expect(opts.sameSite).toBe("none");
    expect(opts.secure).toBe(true);
  });

  it("returns insecure when x-forwarded-proto is only http", () => {
    const req = { headers: { "x-forwarded-proto": "http" } };
    const opts = getSessionCookieOptions(req);
    expect(opts.sameSite).toBe("lax");
    expect(opts.secure).toBe(false);
  });

  it("returns insecure when no protocol info is available", () => {
    const req = { headers: {} };
    const opts = getSessionCookieOptions(req);
    expect(opts.sameSite).toBe("lax");
    expect(opts.secure).toBe(false);
  });
});
