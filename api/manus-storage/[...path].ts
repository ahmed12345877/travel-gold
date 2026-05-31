import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServerSupabase } from "../../server/_core/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Expect path from dynamic segment
  // /api/manus-storage/[...path] -> path array
  const segments = req.query.path;
  const key = Array.isArray(segments) ? segments.join("/") : (segments ?? "");
  if (!key) {
    res.status(400).send("Missing storage key");
    return;
  }

  const supabase = getServerSupabase();
  const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET;

  try {
    // If Supabase is configured, return a signed URL for this key
    if (supabase && supabaseBucket) {
      const expiresInSec = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL || 60);
      const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .createSignedUrl(key, expiresInSec);
      if (!error && data?.signedUrl) {
        res.setHeader("Cache-Control", "no-store");
        res.status(307).setHeader("Location", data.signedUrl).end();
        return;
      }
      // If signing fails, attempt public URL
      const { data: pub } = supabase.storage.from(supabaseBucket).getPublicUrl(key);
      if (pub.publicUrl) {
        res.setHeader("Cache-Control", "no-store");
        res.status(307).setHeader("Location", pub.publicUrl).end();
        return;
      }
      // No external fallback permitted
    }
    res.status(404).send("Image not found or storage not configured");
  } catch (e) {
    console.error("[StorageProxy] failed:", e);
    res.status(502).send("Storage proxy error");
  }
}

// Requires Node.js runtime for @vercel/node types and Node fetch polyfills
export const runtime = "nodejs";
