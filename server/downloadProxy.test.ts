import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { registerDownloadProxy } from "./downloadProxy";

// Mock sharp
vi.mock("sharp", () => {
  const mockSharp = () => ({
    jpeg: () => ({
      toBuffer: () => Promise.resolve(Buffer.from("jpeg-data")),
    }),
    webp: () => ({
      toBuffer: () => Promise.resolve(Buffer.from("webp-data")),
    }),
    png: () => ({
      toBuffer: () => Promise.resolve(Buffer.from("png-data")),
    }),
  });
  return { default: mockSharp };
});

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createMockResponse(data: Buffer, contentType = "image/png") {
  return {
    ok: true,
    status: 200,
    headers: {
      get: (name: string) => {
        const map: Record<string, string> = {
          "content-type": contentType,
          "content-length": String(data.length),
        };
        return map[name] || null;
      },
    },
    arrayBuffer: () =>
      Promise.resolve(
        data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      ),
  };
}

describe("Download Proxy", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    registerDownloadProxy(app);
    vi.clearAllMocks();
  });

  it("should return 400 if no url parameter is provided", async () => {
    const res = await request(app).get("/api/download-image");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing 'url' query parameter");
  });

  it("should return 400 for invalid URL format", async () => {
    const res = await request(app).get(
      "/api/download-image?url=not-a-valid-url"
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid URL format");
  });

  it("should return 400 for invalid format parameter", async () => {
    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/test.png&format=bmp"
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid format");
    expect(res.body.error).toContain("png, jpg, jpeg, webp");
  });

  it("should return 403 for disallowed domains", async () => {
    const res = await request(app).get(
      "/api/download-image?url=https://evil-site.com/malware.exe"
    );
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("URL domain not allowed for download");
  });

  it("should allow S3 URLs and set correct download headers", async () => {
    const mockImageBuffer = Buffer.from("fake-image-data");
    mockFetch.mockResolvedValue(createMockResponse(mockImageBuffer));

    const res = await request(app).get(
      "/api/download-image?url=https://test-bucket.s3.amazonaws.com/ai-generated/test.png&filename=my-image.png"
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="my-image.png"'
    );
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test-bucket.s3.amazonaws.com/ai-generated/test.png"
    );
  });

  it("should allow URLs containing ai-generated pattern", async () => {
    const mockImageBuffer = Buffer.from("fake-image-data");
    mockFetch.mockResolvedValue(createMockResponse(mockImageBuffer));

    const res = await request(app).get(
      "/api/download-image?url=https://some-cdn.example.com/ai-generated/image.png"
    );

    expect(res.status).toBe(200);
  });

  it("should generate default filename if none provided", async () => {
    const mockImageBuffer = Buffer.from("fake-image-data");
    mockFetch.mockResolvedValue(createMockResponse(mockImageBuffer));

    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/ai-generated/test.png"
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toMatch(
      /attachment; filename="vanir-ai-\d+\.png"/
    );
  });

  it("should handle fetch errors from upstream", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/ai-generated/missing.png"
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Failed to fetch image");
  });

  it("should handle network errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/ai-generated/test.png"
    );

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error during download");
  });

  // --- Format conversion tests ---

  it("should convert to JPG format when format=jpg is specified", async () => {
    const mockImageBuffer = Buffer.from("fake-image-data");
    mockFetch.mockResolvedValue(createMockResponse(mockImageBuffer));

    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/ai-generated/test.png&format=jpg&filename=my-image"
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/jpeg");
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="my-image.jpg"'
    );
  });

  it("should convert to WebP format when format=webp is specified", async () => {
    const mockImageBuffer = Buffer.from("fake-image-data");
    mockFetch.mockResolvedValue(createMockResponse(mockImageBuffer));

    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/ai-generated/test.png&format=webp&filename=my-image"
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/webp");
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="my-image.webp"'
    );
  });

  it("should convert to PNG format when format=png is specified", async () => {
    const mockImageBuffer = Buffer.from("fake-image-data");
    mockFetch.mockResolvedValue(createMockResponse(mockImageBuffer));

    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/ai-generated/test.png&format=png&filename=my-image"
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="my-image.png"'
    );
  });

  it("should strip existing extension from filename before adding new one", async () => {
    const mockImageBuffer = Buffer.from("fake-image-data");
    mockFetch.mockResolvedValue(createMockResponse(mockImageBuffer));

    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/ai-generated/test.png&format=webp&filename=my-image.png"
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="my-image.webp"'
    );
  });

  it("should serve original format when no format parameter is given", async () => {
    const mockImageBuffer = Buffer.from("fake-image-data");
    mockFetch.mockResolvedValue(createMockResponse(mockImageBuffer));

    const res = await request(app).get(
      "/api/download-image?url=https://test.s3.amazonaws.com/ai-generated/test.png"
    );

    expect(res.status).toBe(200);
    // No conversion, original content-type preserved
    expect(res.headers["content-type"]).toBe("image/png");
  });
});
