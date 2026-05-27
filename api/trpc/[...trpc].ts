import type { IncomingMessage, ServerResponse } from "http";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

// Define a minimal cookie options shape to avoid express typing issues
type CookieOptionsLite = {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none" | boolean;
  maxAge?: number;
  domain?: string;
  expires?: Date;
};

// Minimal cookie serializer to support ctx.res.clearCookie in routers
function serializeCookie(name: string, value: string, options: CookieOptionsLite = {}) {
  const enc = encodeURIComponent;
  const segments: string[] = [`${name}=${value}`];
  if (options.path) segments.push(`Path=${options.path}`);
  if (options.httpOnly) segments.push("HttpOnly");
  if (options.secure) segments.push("Secure");
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);
  if (options.maxAge != null) segments.push(`Max-Age=${Math.floor(Number(options.maxAge) / 1000)}`);
  if (options.domain) segments.push(`Domain=${options.domain}`);
  if (options.expires instanceof Date) segments.push(`Expires=${options.expires.toUTCString()}`);
  return segments.join("; ");
}

// Build a minimal Express-like response setter for cookies; we'll attach it to the tRPC context
function buildResShim(nodeRes: ServerResponse) {
  return {
    clearCookie(name: string, cookieOptions?: CookieOptionsLite) {
      const header = serializeCookie(name, "", { ...(cookieOptions ?? {}), maxAge: -1 });
      const current = nodeRes.getHeader("Set-Cookie");
      const next = current
        ? Array.isArray(current)
          ? [...current, header]
          : [String(current), header]
        : [header];
      nodeRes.setHeader("Set-Cookie", next);
    },
    cookie(name: string, value: string, cookieOptions?: CookieOptionsLite) {
      const header = serializeCookie(name, value, cookieOptions ?? {});
      const current = nodeRes.getHeader("Set-Cookie");
      const next = current
        ? Array.isArray(current)
          ? [...current, header]
          : [String(current), header]
        : [header];
      nodeRes.setHeader("Set-Cookie", next);
    },
    setHeader(key: string, value: string | string[]) {
      nodeRes.setHeader(key, value);
    },
  } as unknown as any;
}

async function nodeToWebRequest(req: IncomingMessage): Promise<Request> {
  const proto = (req.headers?.["x-forwarded-proto"] as string) ||
    // @ts-ignore - not all Node versions type this
    ((req.socket as any)?.encrypted ? "https" : "http");
  const host = req.headers?.host || "localhost";
  const url = `${proto}://${host}${req.url || "/"}`;

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (Array.isArray(v)) {
      for (const vv of v) headers.append(k, vv);
    } else if (typeof v === "string") {
      headers.set(k, v);
    }
  }

  // Only supply a body for non-GET/HEAD
  let body: Uint8Array | undefined;
  const method = (req.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    body = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  }

  return new Request(url, { method, headers, body: body as any });
}

export default async function trpcHandler(req: IncomingMessage, res: ServerResponse) {
  const webReq = await nodeToWebRequest(req);

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: webReq,
    router: appRouter,
    createContext: async (_fetchCtx: any) => {
      const resShim = buildResShim(res);
      return createContext({ req: req as any, res: resShim } as any);
    },
  });

  // Write back the response to Node's ServerResponse
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    // Handle multiple Set-Cookie headers when possible
    if (key.toLowerCase() === "set-cookie") {
      const getCookies = (response.headers as any).getSetCookie?.();
      if (getCookies && Array.isArray(getCookies)) {
        res.setHeader("Set-Cookie", getCookies);
        return;
      }
    }
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}

// Ensure this function runs in the Node.js runtime on Vercel
export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
  },
};
