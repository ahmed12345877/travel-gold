// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)

import fs from 'fs';
import path from 'path';
import { ENV } from './_core/env';
import { getServerSupabase } from './_core/supabase';

// Optional Supabase Storage integration only (no Manus fallback allowed)
// If SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set and SUPABASE_STORAGE_BUCKET is provided,
// storagePut/storageGet will use Supabase Storage with signed URLs.
// Otherwise falls back to local filesystem storage under public/uploads/.

const DIRNAME = typeof __dirname !== 'undefined'
  ? __dirname
  : new URL('.', import.meta.url).pathname;

// Resolve the project-root public/uploads directory regardless of CWD
const LOCAL_UPLOADS_DIR = path.resolve(DIRNAME, '..', 'public', 'uploads');

function ensureLocalDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Try Supabase first if configured
  const supabase = getServerSupabase();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (supabase && bucket) {
    // Ensure we upload binary data correctly
    const blob =
      typeof data === 'string'
        ? new Blob([data], { type: contentType })
        : new Blob([data as any], { type: contentType });

    const { error } = await supabase.storage
      .from(bucket)
      .upload(key, blob, { contentType, upsert: true });
    if (error) {
      throw new Error(`[Supabase Storage] upload failed: ${error.message}`);
    }

    // Prefer signed URL to avoid public bucket requirement
    const expiresInSec = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL || 3600);
    const { data: signed, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(key, expiresInSec);
    if (signErr) {
      // Fallback to public URL if signing fails (e.g., public bucket)
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
      if (!pub.publicUrl) {
        throw new Error('[Supabase Storage] failed to obtain URL after upload');
      }
      return { key, url: pub.publicUrl };
    }
    return { key, url: signed.signedUrl };
  }

  // Local filesystem fallback
  const localPath = path.join(LOCAL_UPLOADS_DIR, key);
  ensureLocalDir(localPath);
  const buffer =
    typeof data === 'string'
      ? Buffer.from(data, 'utf-8')
      : Buffer.from(data as any);
  fs.writeFileSync(localPath, buffer);
  return { key, url: `/uploads/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const key = normalizeKey(relKey);

  // Try Supabase first if configured
  const supabase = getServerSupabase();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (supabase && bucket) {
    const expiresInSec = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL || 3600);
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(key, expiresInSec);
    if (error || !data?.signedUrl) {
      // Fallback to public URL if signing not possible
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
      if (!pub.publicUrl) {
        throw new Error('[Supabase Storage] failed to obtain URL');
      }
      return { key, url: pub.publicUrl };
    }
    return { key, url: data.signedUrl };
  }

  // Local filesystem fallback — return static URL
  return { key, url: `/uploads/${key}` };
}
