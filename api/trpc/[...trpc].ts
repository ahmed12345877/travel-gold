import type { IncomingMessage, ServerResponse } from "http";
import { createHTTPHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../server/routers.js";
import { createContext } from "../../server/_core/context.js";
import type { CookieOptions } from "express";

// Minimal cookie serializer (no external deps)
function serializeCookie(name: string, value: string, options: Partial<CookieOptions> = {}) {
  const segments: string[] = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) segments.push(`Path=${options.path}`);
  if (options.httpOnly) segments.push("HttpOnly");
  if (options.secure) segments.push("Secure");
  if (options.sameSite) {
    const sm = typeof options.sameSite === "boolean" ? "Strict" : options.sameSite;
    segments.push(`SameSite=${sm}`);
  }
  if (options.maxAge != null) {
    // Express maxAge is ms; Set-Cookie Max-Age is seconds
    const maxAgeMs = Number(options.maxAge);
    segments.push(`Max-Age=${Math.floor(maxAgeMs > 1e9 ? maxAgeMs / 1000 : maxAgeMs)}`);
  }
  if ((options as any).domain) segments.push(`Domain=${(options as any).domain}`);
  if ((options as any).expires instanceof Date) {
    segments.push(`Expires=${((options as any).expires as Date).toUTCString()}`);
  }
  return segments.join("; ");
}

function appendSetCookie(res: ServerResponse, header: string) {
  const current = res.getHeader("Set-Cookie");
  const next = current
    ? Array.isArray(current) ? [...current, header] : [String(current), header]
    : [header];
  res.setHeader("Set-Cookie", next);
}

const handler = createHTTPHandler({
  router: appRouter,
  endpoint: "/api/trpc",
  createContext: async (opts: any) => {
    const resShim = {
      // Pass through the raw node req so getSessionCookieOptions can read
      // x-forwarded-proto and correctly set Secure/SameSite on HTTPS.
      _req: opts.req,
      clearCookie(name: string, cookieOptions?: Partial<CookieOptions>) {
        appendSetCookie(opts.res, serializeCookie(name, "", { ...(cookieOptions ?? {}), maxAge: 0 }));
      },
      cookie(name: string, value: string, cookieOptions?: Partial<CookieOptions>) {
        appendSetCookie(opts.res, serializeCookie(name, value, cookieOptions ?? {}));
      },
      setHeader(key: string, value: string | string[]) {
        opts.res.setHeader(key, value);
      },
      // Expose headers from the underlying node req so cookies.ts can read x-forwarded-proto
      get headers() { return opts.req.headers; },
      get protocol() {
        const fwd = opts.req.headers["x-forwarded-proto"];
        if (typeof fwd === "string") return fwd.split(",")[0].trim();
        return "http";
      },
    } as unknown as any;

    return createContext({ req: opts.req as any, res: resShim } as any);
  },
});

export default async function trpcHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    return await handler(req, res);
  } catch (err: unknown) {
    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : "Internal server error";
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: { message, code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } },
      }));
    }
  }
}

export const runtime = "nodejs";

export const config = {
  api: { bodyParser: false },
};
