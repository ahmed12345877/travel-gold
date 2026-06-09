import type { IncomingMessage, ServerResponse } from "node:http";

function getSupabaseBase(): string {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set");
  return base.replace(/\/$/, "");
}

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const base = getSupabaseBase();
    const upstream = `${base}/auth/v1/.well-known/jwks.json`;
    const r = await fetch(upstream, { headers: { Accept: "application/json" } });
    const body = await r.text();

    res.writeHead(r.status, { "Content-Type": "application/json" });
    res.end(body);

  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch JWKS keys" }));
  }
}

// اترك هذا السطر كما هو في النهاية 👇
export const runtime = "nodejs";

