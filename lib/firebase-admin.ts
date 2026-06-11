import admin from 'firebase-admin'

// Global variable to store initialized Firebase app (idempotent pattern)
let firebaseAppInstance: admin.app.App | null = null
let cachedStorageBucket: string | null = null

/**
 * Derives the Firebase Storage Bucket name from service account or environment variable
 * Priority:
 * 1. FIREBASE_STORAGE_BUCKET environment variable (if explicitly set)
 * 2. Derived from FIREBASE_SERVICE_ACCOUNT_JSON (project_id.appspot.com)
 * 
 * @param serviceAccount Optional pre-parsed service account object
 * @returns The correct Firebase Storage bucket name (format: project-id.appspot.com)
 * @throws Error if bucket name cannot be determined
 */
function getStorageBucketName(serviceAccount?: Record<string, unknown>): string {
  // Check for explicit environment variable first
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    console.log('[Firebase Admin] Using FIREBASE_STORAGE_BUCKET from environment')
    return process.env.FIREBASE_STORAGE_BUCKET
  }

  // Try to derive from service account project_id
  if (serviceAccount && typeof serviceAccount.project_id === 'string') {
    const bucket = `${serviceAccount.project_id}.appspot.com`
    console.log(`[Firebase Admin] Derived storage bucket from service account: ${bucket}`)
    return bucket
  }

  throw new Error(
    'Could not determine Firebase Storage bucket. ' +
    'Either set FIREBASE_STORAGE_BUCKET or ensure FIREBASE_SERVICE_ACCOUNT_JSON contains project_id.'
  )
}

/**
 * Safely initializes Firebase Admin SDK (Idempotent)
 * - Reads FIREBASE_SERVICE_ACCOUNT_JSON from environment variables
 * - Automatically derives storage bucket from project_id or FIREBASE_STORAGE_BUCKET env var
 * - Initializes only once - subsequent calls return the cached instance
 * - Throws descriptive errors if environment variables are missing
 *
 * @returns The initialized Firebase Admin App instance
 * @throws Error if FIREBASE_SERVICE_ACCOUNT_JSON is not set or invalid
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
      'Environment variable FIREBASE_SERVICE_ACCOUNT_JSON is not set. ' +
        'Please add your Firebase service account JSON to your environment variables.'
    )
  }

  let serviceAccount: Record<string, unknown>
  try {
    // Parse the JSON string from environment variable
    serviceAccount = JSON.parse(serviceAccountJson)
  } catch (error) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. ' +
        'Please ensure it is properly formatted.'
    )
  }

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
 * Automatically uses the correct bucket name derived from service account
 *
 * @returns Firebase Storage bucket instance
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
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not set')
  }

  const serviceAccount = JSON.parse(serviceAccountJson)
  const bucketName = getStorageBucketName(serviceAccount)
  cachedStorageBucket = bucketName
  
  return admin.storage(app).bucket(bucketName)
}
