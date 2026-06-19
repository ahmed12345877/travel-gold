import type { Request, Response, NextFunction } from "express";

/**
 * Security headers middleware — equivalent to a minimal helmet configuration.
 * Sets headers that protect against clickjacking, MIME sniffing, XSS, etc.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Basic XSS protection for older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy — don't leak full URL to third parties
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Prevent exposing server information
  res.removeHeader("X-Powered-By");

  next();
}

/**
 * Simple in-memory rate limiter for critical endpoints (login, contact, etc.).
 * Uses a sliding window approach. NOT suitable for distributed/multi-instance
 * deployments — use Redis-backed rate limiting in that case.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

export function rateLimit(options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}) {
  const { windowMs, max, keyPrefix = "rl" } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    entry.count++;
    next();
  };
}
