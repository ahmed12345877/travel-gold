/**
 * Download Proxy - Fetches images from S3, optionally converts format,
 * and serves them with Content-Disposition: attachment header for direct download.
 * Supports format conversion: png, jpg/jpeg, webp via sharp.
 */
import type { Express, Request, Response } from "express";
import sharp from "sharp";

const ALLOWED_FORMATS = ["png", "jpg", "jpeg", "webp"] as const;
type ImageFormat = (typeof ALLOWED_FORMATS)[number];

const FORMAT_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export function registerDownloadProxy(app: Express) {
  app.get("/api/download-image", async (req: Request, res: Response) => {
    try {
      const imageUrl = req.query.url as string;
      const requestedFormat = (req.query.format as string)?.toLowerCase();

      if (!imageUrl) {
        res.status(400).json({ error: "Missing 'url' query parameter" });
        return;
      }

      // Validate format if provided
      if (
        requestedFormat &&
        !ALLOWED_FORMATS.includes(requestedFormat as ImageFormat)
      ) {
        res.status(400).json({
          error: `Invalid format '${requestedFormat}'. Allowed: ${ALLOWED_FORMATS.join(", ")}`,
        });
        return;
      }

      // Validate URL - only allow S3/CDN URLs for security
      const allowedDomains = [
        "s3.amazonaws.com",
        "s3.us-east-1.amazonaws.com",
        ".s3.amazonaws.com",
        "cloudfront.net",
        "manus-storage",
      ];

      let isAllowed = false;
      try {
        const parsedUrl = new URL(imageUrl);
        isAllowed = allowedDomains.some(
          (domain) =>
            parsedUrl.hostname.endsWith(domain) ||
            parsedUrl.hostname.includes(domain),
        );
      } catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
      }

      if (!isAllowed) {
        const s3Patterns = ["vanir", "ai-generated", "manus"];
        isAllowed = s3Patterns.some((pattern) =>
          imageUrl.toLowerCase().includes(pattern),
        );
      }

      if (!isAllowed) {
        res.status(403).json({ error: "URL domain not allowed for download" });
        return;
      }

      // Fetch the image from S3
      const response = await fetch(imageUrl);

      if (!response.ok) {
        res.status(response.status).json({
          error: `Failed to fetch image: ${response.statusText}`,
        });
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      let outputBuffer: Buffer = Buffer.from(
        arrayBuffer,
      ) as Buffer<ArrayBuffer>;
      let outputMime = response.headers.get("content-type") || "image/png";
      let outputExt = "png";

      // Convert format if requested
      if (requestedFormat) {
        const normalizedFormat =
          requestedFormat === "jpg" ? "jpeg" : requestedFormat;
        const sharpInstance = sharp(outputBuffer);

        if (normalizedFormat === "jpeg") {
          outputBuffer = (await sharpInstance
            .jpeg({ quality: 92 })
            .toBuffer()) as Buffer<ArrayBuffer>;
        } else if (normalizedFormat === "webp") {
          outputBuffer = (await sharpInstance
            .webp({ quality: 90 })
            .toBuffer()) as Buffer<ArrayBuffer>;
        } else {
          outputBuffer = (await sharpInstance
            .png()
            .toBuffer()) as Buffer<ArrayBuffer>;
        }

        outputMime = FORMAT_MIME[requestedFormat] || "image/png";
        outputExt = requestedFormat === "jpeg" ? "jpg" : requestedFormat;
      }

      // Generate filename
      const baseFilename =
        (req.query.filename as string) || `vanir-ai-${Date.now()}`;
      // Remove existing extension from base filename if present
      const cleanBase = baseFilename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
      const filename = `${cleanBase}.${outputExt}`;

      // Set headers for download
      res.setHeader("Content-Type", outputMime);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Length", outputBuffer.length);
      res.setHeader("Cache-Control", "no-cache");

      res.send(outputBuffer);
    } catch (error) {
      console.error("[Download Proxy] Error:", error);
      res.status(500).json({ error: "Internal server error during download" });
    }
  });
}
