
import type { IncomingMessage, ServerResponse } from "node:http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
// ✅ الصحيح: تحديد الملف والامتداد بدقة
import { appRouter } from '../../server/routers/index.js';
import { createContext } from "../../server/_core/context.js";






// Cookie options type (inline to avoid express dependency issues)
interface CookieOpts {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  maxAge?: number;
  domain?: string;
  expires?: Date;
}

// Minimal cookie serializer (no external deps)
function serializeCookie(name: string, value: string, options: CookieOpts = {}) {
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
  if (options.domain) segments.push(`Domain=${options.domain}`);
  if (options.expires instanceof Date) {
    segments.push(`Expires=${options.expires.toUTCString()}`);
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

export default async function trpcHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    const resShim = {
      clearCookie(name: string, cookieOptions?: CookieOpts) {
        appendSetCookie(res, serializeCookie(name, "", { ...(cookieOptions ?? {}), maxAge: 0 }));
      },
      cookie(name: string, value: string, cookieOptions?: CookieOpts) {
        appendSetCookie(res, serializeCookie(name, value, cookieOptions ?? {}));
      },
      setHeader(key: string, value: string | string[]) {
        res.setHeader(key, value);
      },
      get headers() { return req.headers; },
      get protocol() {
        const fwd = req.headers["x-forwarded-proto"];
        if (typeof fwd === "string") return fwd.split(",")[0].trim();
        return "http";
      },
    } as any;

    return await nodeHTTPRequestHandler({
      req,
      res,
      path: req.url?.replace("/api/trpc", "") || "",
      router: appRouter,
      createContext: async () => createContext({ req: req as any, res: resShim }),
    });
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
