import { getFirebaseStorage } from './firebase-admin'

/**
 * Uploads a file to Firebase Storage as a Buffer
 * - Generates permanent public URLs that never expire
 * - Uses Google Cloud CDN for fast delivery
 * - Follows official Google Cloud file structure
 *
 * @param filePath - Path where file will be stored (e.g., 'uploads/image.jpg')
 * @param fileBuffer - Buffer containing the file data
 * @param contentType - MIME type of the file (e.g., 'image/jpeg')
 * @param metadata - Optional metadata to store with the file
 * @returns Object with permanent public URL and file path
 * @throws Error if upload fails or environment is not configured
 */
export async function storagePut(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string = 'application/octet-stream',
  metadata?: Record<string, string>
): Promise<{
  url: string
  path: string
  bucket: string
}> {
  try {
    // Get Firebase Storage bucket instance (already has bucket name specified)
    const bucket = getFirebaseStorage()

    // Create a file reference
    const file = bucket.file(filePath)

    // Generate permanent public URL using official Google Cloud CDN structure
    // Format: https://storage.googleapis.com/bucket-name/file-path
    // This URL never expires and is Google's official public URL format
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`

    // Prepare upload options
    const options = {
      metadata: {
        contentType: contentType,
        cacheControl: 'public, max-age=31536000', // Cache for 1 year (files are immutable)
        ...metadata,
      },
    }

    // Upload the file buffer to Firebase Storage
    await file.save(fileBuffer, options)

    console.log(`[Firebase Storage] Successfully uploaded: ${filePath}`)

    return {
      url: publicUrl,
      path: filePath,
      bucket: bucket.name,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`[Firebase Storage] Upload failed for ${filePath}:`, errorMessage)
    throw new Error(`Failed to upload file to Firebase Storage: ${errorMessage}`)
  }
}

/**
 * Uploads a file to Firebase Storage from a URL
 * Fetches the file content and uploads it as a Buffer
 *
 * @param sourceUrl - URL of the file to download
 * @param destinationPath - Path where file will be stored
 * @param contentType - MIME type of the file
 * @returns Object with permanent public URL and file details
 */
export async function storagePutFromUrl(
  sourceUrl: string,
  destinationPath: string,
  contentType: string = 'application/octet-stream'
): Promise<{
  url: string
  path: string
  bucket: string
}> {
  try {
    // Fetch the file from the source URL
    const response = await fetch(sourceUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${response.statusText}`)
    }

    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Upload to Firebase Storage
    return await storagePut(
      destinationPath,
      fileBuffer,
      contentType
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`[Firebase Storage] Upload from URL failed:`, errorMessage)
    throw new Error(`Failed to upload file from URL: ${errorMessage}`)
  }
}

/**
 * Deletes a file from Firebase Storage
 *
 * @param filePath - Path of the file to delete
 * @returns true if deletion was successful
 */
export async function storageDelete(filePath: string): Promise<boolean> {
  try {
    const bucket = getFirebaseStorage()
    const file = bucket.file(filePath)

    await file.delete()
    console.log(`[Firebase Storage] Successfully deleted: ${filePath}`)
    return true
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`[Firebase Storage] Delete failed for ${filePath}:`, errorMessage)
    throw new Error(`Failed to delete file from Firebase Storage: ${errorMessage}`)
  }
}

/**
 * Gets the permanent public URL for a file in Firebase Storage
 * (Use this only if you need the URL without uploading)
 *
 * @param filePath - Path of the file
 * @returns Permanent public URL
 */
export function getStorageUrl(filePath: string): string {
  const bucket = getFirebaseStorage()
  return `https://storage.googleapis.com/${bucket.name}/${filePath}`
}
