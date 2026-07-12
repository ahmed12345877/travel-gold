/**
 * Shared file-upload helpers.
 *
 * Both `uploads.ts` and `gallery.ts` were duplicating the base-64 decode,
 * size check, extension extraction, and key generation. This module
 * consolidates that logic.
 */

import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface DecodedUpload {
  buffer: Buffer;
  fileSize: number;
  fileKey: string;
  ext: string;
}

/**
 * Decode a base-64 encoded file, validate its size, and produce a storage key.
 *
 * @param fileData  base-64 encoded string
 * @param filename  original file name (used to extract the extension)
 * @param keyPrefix e.g. "gallery" or "user-123/general"
 * @returns decoded buffer and the generated storage key
 * @throws  if the decoded file exceeds {@link MAX_FILE_SIZE}
 */
export function decodeAndValidateUpload(
  fileData: string,
  filename: string,
  keyPrefix: string,
): DecodedUpload {
  const buffer = Buffer.from(fileData, "base64");
  const fileSize = buffer.length;

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
  }

  const ext = filename.split(".").pop() || "bin";
  const randomSuffix = nanoid(8);
  const fileKey = `${keyPrefix}/${randomSuffix}.${ext}`;

  return { buffer, fileSize, fileKey, ext };
}
