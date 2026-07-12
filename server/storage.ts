// Preconfigured storage helpers for Manus WebDev templates
// Uses Firebase Storage only (no local fallback)

import { storagePut as firebaseStoragePut, storageDelete as firebaseStorageDelete } from '../lib/firebase-storage';

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Uploads a file to storage (Firebase Storage only)
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

  // Convert data to Buffer explicitly - Firebase requires Buffer type
  let fileBuffer: Buffer;
  if (typeof data === 'string') {
    fileBuffer = Buffer.from(data, 'utf-8');
  } else if (ArrayBuffer.isView(data)) {
    fileBuffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    fileBuffer = data as Buffer;
  }

  // Upload to Firebase Storage (no fallback - let errors propagate)
  try {
    console.log(`[Storage] Uploading to Firebase Storage: ${key}`);
    const result = await firebaseStoragePut(key, fileBuffer, contentType);
    console.log(`[Storage] Firebase Storage upload successful for: ${key}`);
    return { key, url: result.url };
  } catch (firebaseErr) {
    const errorMessage = firebaseErr instanceof Error ? firebaseErr.message : String(firebaseErr);
    console.error(`[Storage] Firebase Storage upload FAILED for ${key}:`, errorMessage);
    throw new Error(`Failed to upload file to Firebase Storage: ${errorMessage}`);
  }
}

/**
 * Gets a file from storage (Firebase Storage only)
 * 
 * @param relKey - Relative path for the file
 * @returns Object with key and URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const key = normalizeKey(relKey);

  // Get URL from Firebase Storage (no fallback - let errors propagate)
  try {
    console.log(`[Storage] Getting Firebase Storage URL for: ${key}`);
    const result = await import('../lib/firebase-storage').then(m => m.getStorageUrl(key));
    console.log(`[Storage] Firebase Storage URL generated for: ${key}`);
    return { key, url: result };
  } catch (firebaseErr) {
    const errorMessage = firebaseErr instanceof Error ? firebaseErr.message : String(firebaseErr);
    console.error(`[Storage] Firebase Storage URL generation FAILED for ${key}:`, errorMessage);
    throw new Error(`Failed to get file URL from Firebase Storage: ${errorMessage}`);
  }
}

/**
 * Deletes a file from storage (Firebase Storage only)
 * 
 * @param relKey - Relative path for the file
 * @returns true if deletion successful
 */
export async function storageDelete(relKey: string): Promise<boolean> {
  const key = normalizeKey(relKey);

  // Delete from Firebase Storage (no fallback - let errors propagate)
  try {
    console.log(`[Storage] Deleting from Firebase Storage: ${key}`);
    await firebaseStorageDelete(key);
    console.log(`[Storage] Firebase Storage delete successful for: ${key}`);
    return true;
  } catch (firebaseErr) {
    const errorMessage = firebaseErr instanceof Error ? firebaseErr.message : String(firebaseErr);
    console.error(`[Storage] Firebase Storage delete FAILED for ${key}:`, errorMessage);
    throw new Error(`Failed to delete file from Firebase Storage: ${errorMessage}`);
  }
}
