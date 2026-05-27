import type { Express, Request, Response } from "express";
import { getServerSupabase } from "./supabase";

// Serve legacy /manus-storage/* by issuing Supabase signed redirects only.
// No Manus/Forge backend is used.
export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req: Request, res: Response) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) return void res.status(400).send("Missing storage key");

    const supabase = getServerSupabase();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!supabase || !bucket) {
      return void res.status(404).send("Storage not configured");
    }

    try {
      const ttl = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL || 60);
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(key, ttl);
      if (!error && data?.signedUrl) {
        res.set("Cache-Control", "no-store");
        return void res.redirect(307, data.signedUrl);
      }
      // Fallback to public URL if bucket is public
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
      if (pub.publicUrl) {
        res.set("Cache-Control", "no-store");
        return void res.redirect(307, pub.publicUrl);
      }
      return void res.status(404).send("Image not found");
    } catch (err) {
      console.error("[StorageProxy] supabase error:", err);
      return void res.status(502).send("Storage proxy error");
    }
  });
}
