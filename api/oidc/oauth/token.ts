import type { IncomingMessage, ServerResponse } from "http";

function getSupabaseBase(): string {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set");
  return base.replace(/\/$/, "");
}

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "OPTIONS") {
    // Restrict CORS for token exchange - only allow same origin requests
    res.statusCode = 204;
    const origin = (req as any).headers?.origin || "";
    const requestUrl = (req as any).headers?.host || "";
    // Only allow if origin matches the current host (same-origin policy)
    if (origin && requestUrl && origin.includes(requestUrl)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "null");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST, OPTIONS");
    res.end();
    return;
  }
  try {
    const base = getSupabaseBase();
    const body = await readRawBody(req);
    // Forward only safe, relevant headers
    const incoming = (req as any).headers || {};
    const headers: Record<string, string> = {};
    const copyKeys = [
      "content-type",
      "authorization",
      "accept",
      "x-client-info",
    ];
    for (const k of copyKeys) {
      const v = incoming[k];
      if (typeof v === "string") headers[k] = v;
    }
    const r = await fetch(`${base}/auth/v1/oauth/token`, {
      method: "POST",
      headers,
      body: body as unknown as BodyInit,
    });
    const text = await r.text();
    res.statusCode = r.status;
    // Mirror content type from upstream
    const ct = r.headers.get("content-type") || "application/json; charset=utf-8";
    res.setHeader("Content-Type", ct);
    // Restrict CORS for token exchange - only allow same origin requests
    const origin = (req as any).headers?.origin || "";
    const requestUrl = (req as any).headers?.host || "";
    if (origin && requestUrl && origin.includes(requestUrl)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "null");
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.end(text);
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "TOKEN_PROXY_ERROR", message: err?.message || String(err) }));
  }
}

export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
  },
};
