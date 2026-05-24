import type { IncomingMessage, ServerResponse } from "http";

function getSupabaseBase(): string {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set");
  return base.replace(/\/$/, "");
}

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const base = getSupabaseBase();
    const upstream = `${base}/auth/v1/.well-known/openid-configuration`;
    const r = await fetch(upstream, { headers: { Accept: "application/json" } });
    const body = await r.text();
    res.statusCode = r.status;
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/json; charset=utf-8");
    // Permissive CORS for discovery documents
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(body);
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "OIDC_DISCOVERY_ERROR", message: err?.message || String(err) }));
  }
}

export const runtime = "nodejs";
