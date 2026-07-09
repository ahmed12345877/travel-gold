// Storage abstraction — switches between Cloudflare R2 and Firebase Storage.
// Set STORAGE_PROVIDER=r2 (and required R2_* vars) to use Cloudflare R2.
// Without STORAGE_PROVIDER the app uses Firebase Storage (default).

import * as r2 from "../lib/r2-storage";
import {
  storagePut as firebaseStoragePut,
  storageDelete as firebaseStorageDelete,
  getStorageUrl as firebaseGetStorageUrl,
} from "../lib/firebase-storage";

const useR2 =
  process.env.STORAGE_PROVIDER === "r2" ||
  Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET_NAME);

const provider = useR2 ? "R2" : "Firebase";
console.log(`[Storage] Provider: ${provider}`);

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  let fileBuffer: Buffer;
  if (typeof data === "string") {
    fileBuffer = Buffer.from(data, "utf-8");
  } else if (ArrayBuffer.isView(data)) {
    fileBuffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    fileBuffer = data as Buffer;
  }

  if (useR2) {
    const result = await r2.storagePut(key, fileBuffer, contentType);
    return { key, url: result.url };
  }

  const result = await firebaseStoragePut(key, fileBuffer, contentType);
  return { key, url: result.url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const url = useR2 ? r2.getStorageUrl(key) : firebaseGetStorageUrl(key);
  return { key, url };
}

export async function storageDelete(relKey: string): Promise<boolean> {
  const key = normalizeKey(relKey);
  if (useR2) return r2.storageDelete(key);
  return firebaseStorageDelete(key);
}
