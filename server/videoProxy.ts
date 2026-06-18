/**
 * Video Proxy - Fetches videos from blob storage and serves them through the app's origin
 * to bypass CSP restrictions. Allows video playback on the hero section.
 */
import type { Express, Request, Response } from "express";

export function registerVideoProxy(app: Express) {
  app.get("/api/video-proxy", async (req: Request, res: Response) => {
    try {
      const videoUrl = req.query.url as string;

      if (!videoUrl) {
        res.status(400).json({ error: "Missing 'url' query parameter" });
        return;
      }

      // Validate URL - only allow Vercel Blob URLs for security (SSRF prevention)
      const allowedDomains = [
        "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        "blob.vercel-storage.com",
        "d2xsxph8kpxj0f.cloudfront.net",
      ];

      let isAllowed = false;
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(videoUrl);
        isAllowed = allowedDomains.some((domain) =>
          parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(domain)
        );
      } catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
      }

      if (!isAllowed) {
        res.status(403).json({ error: "URL domain not allowed for video proxy" });
        return;
      }

      // Fetch the video from blob storage
      const response = await fetch(videoUrl);

      if (!response.ok) {
        res.status(response.status).json({
          error: `Failed to fetch video: ${response.statusText}`,
        });
        return;
      }

      // Set appropriate video headers
      const contentType = response.headers.get("content-type") || "video/mp4";
      const contentLength = response.headers.get("content-length");

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");

      // Support range requests for video seeking
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
        res.setHeader("Accept-Ranges", "bytes");
      }

      // Stream the video directly
      if (response.body) {
        response.body.pipeTo(res as any);
      } else {
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (error) {
      console.error("[Video Proxy] Error:", error);
      res.status(500).json({ error: "Internal server error during video proxy" });
    }
  });
}
