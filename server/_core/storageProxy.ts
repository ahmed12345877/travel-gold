import type { Express, Request, Response } from "express";
import { getServerSupabase } from "./supabase";

// Serve legacy /api/storage/* by issuing Supabase signed redirects only.
// No backend storage proxy is used - Supabase handles all storage operations.
export function registerStorageProxy(app: Express) {
  app.get("/api/storage/*", async (req: Request, res: Response) => {
    const key = (req.params as Record<string, string>)[0];
    
    console.log("[StorageProxy] Request for key:", key);
    
    if (!key) {
      console.warn("[StorageProxy] Missing storage key in request");
      return void res.status(400).json({ error: "Missing storage key" });
    }

    const supabase = getServerSupabase();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    
    if (!supabase) {
      console.error("[StorageProxy] Supabase client not initialized");
      return void res.status(503).json({ error: "Storage service unavailable" });
    }
    
    if (!bucket) {
      console.error("[StorageProxy] SUPABASE_STORAGE_BUCKET not configured");
      return void res.status(503).json({ error: "Storage bucket not configured" });
    }

    try {
      const ttl = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL || 60);
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(key, ttl);
      
      if (error) {
        console.warn("[StorageProxy] Failed to create signed URL:", {
          key,
          error: error.message,
        });
      }
      
      if (!error && data?.signedUrl) {
        res.set("Cache-Control", "no-store");
        return void res.redirect(307, data.signedUrl);
      }
      
      // Fallback to public URL if bucket is public
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
      if (pub && pub.publicUrl) {
        res.set("Cache-Control", "no-store");
        return void res.redirect(307, pub.publicUrl);
      }
      
      console.warn("[StorageProxy] Image not found:", key);
      return void res.status(404).json({ error: "Image not found", key });
    } catch (err) {
      console.error("[StorageProxy] Unexpected error:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        key,
      });
      return void res.status(502).json({ error: "Storage proxy error" });
    }
  });
}
