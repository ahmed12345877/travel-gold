import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Expect path from dynamic segment
  // /api/manus-storage/[...path] -> path array
  const segments = req.query.path;
  const key = Array.isArray(segments) ? segments.join("/") : (segments ?? "");
  if (!key) {
    res.status(400).send("Missing storage key");
    return;
  }

  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL ?? "";
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY ?? "";
  if (!forgeApiUrl || !forgeApiKey) {
    res.status(500).send("Storage proxy not configured");
    return;
  }

  try {
    const base = forgeApiUrl.replace(/\/+$/, "") + "/";
    const url = new URL("v1/storage/presign/get", base);
    url.searchParams.set("path", key);
    const r = await fetch(url, { headers: { Authorization: `Bearer ${forgeApiKey}` } });
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.error(`[StorageProxy] forge error: ${r.status} ${body}`);
      res.status(502).send("Storage backend error");
      return;
    }
    const { url: signed } = (await r.json()) as { url?: string };
    if (!signed) {
      res.status(502).send("Empty signed URL from backend");
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    res.status(307).setHeader("Location", signed).end();
  } catch (e) {
    console.error("[StorageProxy] failed:", e);
    res.status(502).send("Storage proxy error");
  }
}
