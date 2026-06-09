import type { IncomingMessage, ServerResponse } from "node:http";

function getSupabaseBase(): string {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set");
  return base.replace(/\/$/, "");
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const base = getSupabaseBase();
    // Preserve original query string
    const url = (req as any).url as string | undefined;
    const qsIndex = url ? url.indexOf("?") : -1;
    const qs = qsIndex >= 0 ? url!.substring(qsIndex) : "";
    const location = `${base}/auth/v1/oauth/authorize${qs}`;
    res.statusCode = 307; // temporary redirect, safe to repeat
    res.setHeader("Location", location);
    res.end();
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "AUTHZ_REDIRECT_ERROR", message: err?.message || String(err) }));
  }
}

export const runtime = "nodejs";
