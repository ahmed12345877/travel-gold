import admin from 'firebase-admin'

// Global variable to store initialized Firebase app (idempotent pattern)
let firebaseAppInstance: admin.app.App | null = null
let cachedStorageBucket: string | null = null

/**
 * Validates required Firebase service account fields
 * @param serviceAccount Parsed service account object
 * @throws Error if required fields are missing
 */
function validateServiceAccount(serviceAccount: Record<string, unknown>): void {
  const requiredFields = ['project_id', 'client_email', 'private_key']
  const missingFields = requiredFields.filter(field => !serviceAccount[field])
  
  if (missingFields.length > 0) {
    throw new Error(
      `Invalid Firebase service account: missing required fields [${missingFields.join(', ')}]. ` +
      `Ensure your FIREBASE_SERVICE_ACCOUNT_JSON contains all required fields.`
    )
  }
}

/**
 * Derives the Firebase Storage Bucket name from service account or environment variable
 * 
 * Priority:
 * 1. FIREBASE_STORAGE_BUCKET environment variable (if explicitly set) - RECOMMENDED for production
 * 2. Derived from FIREBASE_SERVICE_ACCOUNT_JSON (project_id.appspot.com)
 * 
 * IMPORTANT: If neither is set, Firebase Storage operations will fail with 404 or permission errors.
 * 
 * @param serviceAccount Pre-parsed and validated service account object
 * @returns The correct Firebase Storage bucket name (format: project-id.appspot.com)
 * @throws Error if bucket name cannot be determined
 */
function getStorageBucketName(serviceAccount: Record<string, unknown>): string {
  // Check for explicit environment variable first (RECOMMENDED for production)
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    console.log('[Firebase Admin] Using FIREBASE_STORAGE_BUCKET from environment (recommended)')
    return process.env.FIREBASE_STORAGE_BUCKET
  }

  // Derive from service account project_id (fallback)
  const projectId = serviceAccount['project_id']
  if (typeof projectId === 'string') {
    const bucket = `${projectId}.appspot.com`
    console.log(`[Firebase Admin] WARNING: Derived storage bucket from service account (not recommended). ` +
                `Set FIREBASE_STORAGE_BUCKET environment variable explicitly for production.`)
    return bucket
  }

  throw new Error(
    'Could not determine Firebase Storage bucket. ' +
    'CRITICAL: Either explicitly set FIREBASE_STORAGE_BUCKET environment variable (RECOMMENDED) ' +
    'or ensure FIREBASE_SERVICE_ACCOUNT_JSON contains valid project_id field.'
  )
}

/**
 * Safely initializes Firebase Admin SDK (Idempotent)
 * 
 * - Reads FIREBASE_SERVICE_ACCOUNT_JSON from environment variables
 * - Validates all required service account fields
 * - Automatically derives storage bucket from FIREBASE_STORAGE_BUCKET or project_id
 * - Initializes only once - subsequent calls return the cached instance
 * - Throws descriptive errors if environment variables are missing or invalid
 *
 * @returns The initialized Firebase Admin App instance
 * @throws Error if FIREBASE_SERVICE_ACCOUNT_JSON is not set, invalid, or missing required fields
 */
export function initializeFirebaseAdmin(): admin.app.App {
  // Return cached instance if already initialized (idempotent)
  if (firebaseAppInstance) {
    return firebaseAppInstance
  }

  // Validate that the service account JSON is provided
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    throw new Error(
      'CRITICAL: Environment variable FIREBASE_SERVICE_ACCOUNT_JSON is not set. ' +
        'Please add your Firebase service account JSON (downloaded from Firebase Console) to your environment variables.'
    )
  }

  let serviceAccount: Record<string, unknown>
  try {
    // Parse the JSON string from environment variable
    serviceAccount = JSON.parse(serviceAccountJson)
  } catch (parseError) {
    const error = parseError instanceof Error ? parseError.message : String(parseError)
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. ` +
      `Parse error: ${error}. ` +
      `Please ensure it is properly formatted (no trailing commas, valid strings, etc.).`
    )
  }

  // Validate all required service account fields
  validateServiceAccount(serviceAccount)

  // Determine the storage bucket name
  const storageBucket = getStorageBucketName(serviceAccount)
  cachedStorageBucket = storageBucket

  // Initialize Firebase Admin with the service account credentials
  firebaseAppInstance = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: storageBucket,
  })

  console.log(`[Firebase Admin] Successfully initialized Firebase Admin SDK with bucket: ${storageBucket}`)
  return firebaseAppInstance
}

/**
 * Gets the current Firebase Admin instance or initializes if needed
 * Safe to call multiple times
 *
 * @returns The Firebase Admin App instance
 */
export function getFirebaseApp(): admin.app.App {
  if (firebaseAppInstance) {
    return firebaseAppInstance
  }
  return initializeFirebaseAdmin()
}

/**
 * Gets Firebase Storage bucket instance (idempotent)
 * Automatically uses the correct bucket name derived from service account or environment variable
 * 
 * IMPORTANT: Ensure FIREBASE_STORAGE_BUCKET is set for production reliability.
 * Without it, operations may fail with 404 or permission errors.
 *
 * @returns Firebase Storage bucket instance
 * @throws Error if storage bucket cannot be determined or JSON parsing fails
 */
export function getFirebaseStorage() {
  const app = getFirebaseApp()
  
  // Use cached bucket name if available
  if (cachedStorageBucket) {
    return admin.storage(app).bucket(cachedStorageBucket)
  }

  // Fallback: derive from service account (should already be cached after init)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    throw new Error(
      'CRITICAL: FIREBASE_SERVICE_ACCOUNT_JSON not set. ' +
      'Cannot determine Firebase Storage bucket.'
    )
  }

  let serviceAccount: Record<string, unknown>
  try {
    serviceAccount = JSON.parse(serviceAccountJson)
  } catch (parseError) {
    const error = parseError instanceof Error ? parseError.message : String(parseError)
    throw new Error(
      `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON in fallback path. ` +
      `Parse error: ${error}. ` +
      `This should not occur in normal operation; please check your environment variables.`
    )
  }

  // Validate service account before using it
  validateServiceAccount(serviceAccount)

  const bucketName = getStorageBucketName(serviceAccount)
  cachedStorageBucket = bucketName
  
  return admin.storage(app).bucket(bucketName)
}
