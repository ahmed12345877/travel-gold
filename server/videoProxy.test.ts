import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { registerVideoProxy } from "./videoProxy";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("Video Proxy", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    registerVideoProxy(app);
    vi.clearAllMocks();
  });

  it("returns 400 when no url parameter is provided", async () => {
    const res = await request(app).get("/api/video-proxy");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing 'url' query parameter");
  });

  it("returns 400 for invalid URL format", async () => {
    const res = await request(app)
      .get("/api/video-proxy")
      .query({ url: "not-a-url" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid URL format");
  });

  it("returns 403 for disallowed domains", async () => {
    const res = await request(app)
      .get("/api/video-proxy")
      .query({ url: "https://evil.com/video.mp4" });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("URL domain not allowed for video proxy");
  });

  it("allows Vercel blob storage URLs", async () => {
    const videoData = Buffer.from("fake-video-data");
    mockFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: (name: string) => {
          if (name === "content-type") return "video/mp4";
          if (name === "content-length") return String(videoData.length);
          return null;
        },
      },
      arrayBuffer: () => Promise.resolve(videoData.buffer.slice(videoData.byteOffset, videoData.byteOffset + videoData.byteLength)),
      body: null,
    });

    const res = await request(app)
      .get("/api/video-proxy")
      .query({ url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/video.mp4" });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("video/mp4");
    expect(res.headers["cache-control"]).toBe("public, max-age=31536000, immutable");
  });

  it("allows CloudFront URLs", async () => {
    const videoData = Buffer.from("cloudfront-video");
    mockFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: (name: string) => {
          if (name === "content-type") return "video/webm";
          if (name === "content-length") return String(videoData.length);
          return null;
        },
      },
      arrayBuffer: () => Promise.resolve(videoData.buffer.slice(videoData.byteOffset, videoData.byteOffset + videoData.byteLength)),
      body: null,
    });

    const res = await request(app)
      .get("/api/video-proxy")
      .query({ url: "https://d2xsxph8kpxj0f.cloudfront.net/video.webm" });
    expect(res.status).toBe(200);
  });

  it("returns upstream error status when fetch fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    const res = await request(app)
      .get("/api/video-proxy")
      .query({ url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/missing.mp4" });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Failed to fetch video");
  });

  it("returns 500 on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const res = await request(app)
      .get("/api/video-proxy")
      .query({ url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/video.mp4" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error during video proxy");
  });
});
