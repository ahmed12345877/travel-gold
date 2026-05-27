import type { IncomingMessage, ServerResponse } from "http";
import { createHTTPHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";
import type { CookieOptions } from "express";

// Minimal cookie serializer to support ctx.res.clearCookie in routers
function serializeCookie(name: string, value: string, options: Partial<CookieOptions> = {}) {
  const enc = encodeURIComponent;
  const segments: string[] = [`${name}=${value}`];
  if (options.path) segments.push(`Path=${options.path}`);
  if (options.httpOnly) segments.push("HttpOnly");
  if (options.secure) segments.push("Secure");
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);
  if (options.maxAge != null) segments.push(`Max-Age=${Math.floor(Number(options.maxAge) / 1000)}`);
  if ((options as any).domain) segments.push(`Domain=${(options as any).domain}`);
  if ((options as any).expires instanceof Date) segments.push(`Expires=${((options as any).expires as Date).toUTCString()}`);
  return segments.join("; ");
}

const handler = createHTTPHandler({
  router: appRouter,
  endpoint: "/api/trpc",
  createContext: async (opts: any) => {
    // Build a minimal Express-like response object that supports clearCookie
    const resShim = {
      // Mirror Express's res.clearCookie signature while targeting the underlying node res
      clearCookie(name: string, cookieOptions?: Partial<CookieOptions>) {
        const header = serializeCookie(name, "", { ...(cookieOptions ?? {}), maxAge: -1 });
        // Vercel/node-http may have multiple Set-Cookie headers
        const current = opts.res.getHeader("Set-Cookie");
        const next = current
          ? Array.isArray(current)
            ? [...current, header]
            : [String(current), header]
          : [header];
        opts.res.setHeader("Set-Cookie", next);
      },
      // Provide res.cookie similar to Express
      cookie(name: string, value: string, cookieOptions?: Partial<CookieOptions>) {
        const header = serializeCookie(name, value, cookieOptions ?? {});
        const current = opts.res.getHeader("Set-Cookie");
        const next = current
          ? Array.isArray(current)
            ? [...current, header]
            : [String(current), header]
          : [header];
        opts.res.setHeader("Set-Cookie", next);
      },
      // Expose setHeader to future uses if needed
      setHeader(key: string, value: string | string[]) {
        opts.res.setHeader(key, value);
      },
    } as unknown as any;

    // Wire into existing createContext; pass the shim so logout works
    return createContext({ req: opts.req as any, res: resShim } as any);
  },
});

export default async function trpcHandler(req: IncomingMessage, res: ServerResponse) {
  return handler(req, res);
}

// Ensure this function runs in the Node.js runtime on Vercel
export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
  },
};
