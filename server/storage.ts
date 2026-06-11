// Preconfigured storage helpers for Manus WebDev templates
// Uses Firebase Storage (primary) or local filesystem fallback

import fs from 'fs';
import path from 'path';
import { ENV } from './_core/env';
import { storagePut as firebaseStoragePut, storageDelete as firebaseStorageDelete } from '../lib/firebase-storage';

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

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Uploads a file to storage (Firebase Storage primary, local fallback)
 * 
 * @param relKey - Relative path for the file
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Try Firebase Storage first if configured
  try {
    console.log(`[Storage] Attempting Firebase Storage upload for: ${key}`);
    const result = await firebaseStoragePut(key, data as Buffer, contentType);
    console.log(`[Storage] Firebase Storage upload successful for: ${key}`);
    return { key, url: result.url };
  } catch (firebaseErr) {
    console.warn(`[Storage] Firebase Storage failed for ${key}, falling back to local filesystem:`, firebaseErr);
  }

  // Local filesystem fallback
  console.log(`[Storage] Using local filesystem fallback for: ${key}`);
  const localPath = path.join(LOCAL_UPLOADS_DIR, key);
  ensureLocalDir(localPath);
  const buffer =
    typeof data === 'string'
      ? Buffer.from(data, 'utf-8')
      : Buffer.from(data as any);
  fs.writeFileSync(localPath, buffer);
  return { key, url: `/uploads/${key}` };
}

/**
 * Gets a file from storage
 * 
 * @param relKey - Relative path for the file
 * @returns Object with key and URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const key = normalizeKey(relKey);

  // Try Firebase Storage first if configured
  try {
    console.log(`[Storage] Attempting Firebase Storage URL generation for: ${key}`);
    const result = await import('../lib/firebase-storage').then(m => m.getStorageUrl(key));
    console.log(`[Storage] Firebase Storage URL generated for: ${key}`);
    return { key, url: result };
  } catch (firebaseErr) {
    console.warn(`[Storage] Firebase Storage failed for ${key}, falling back to local URL:`, firebaseErr);
  }

  // Local filesystem fallback — return static URL
  console.log(`[Storage] Using local filesystem fallback URL for: ${key}`);
  return { key, url: `/uploads/${key}` };
}

/**
 * Deletes a file from storage
 * 
 * @param relKey - Relative path for the file
 * @returns true if deletion successful
 */
export async function storageDelete(relKey: string): Promise<boolean> {
  const key = normalizeKey(relKey);

  // Try Firebase Storage first if configured
  try {
    console.log(`[Storage] Attempting Firebase Storage delete for: ${key}`);
    await firebaseStorageDelete(key);
    console.log(`[Storage] Firebase Storage delete successful for: ${key}`);
    return true;
  } catch (firebaseErr) {
    console.warn(`[Storage] Firebase Storage delete failed for ${key}, falling back to local filesystem:`, firebaseErr);
  }

  // Local filesystem fallback
  console.log(`[Storage] Using local filesystem fallback for delete: ${key}`);
  const localPath = path.join(LOCAL_UPLOADS_DIR, key);
  try {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return true;
  } catch (err) {
    console.error(`[Storage] Local filesystem delete failed for ${key}:`, err);
    return false;
  }
}
