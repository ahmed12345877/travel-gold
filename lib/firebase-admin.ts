import * as admin from 'firebase-admin'

// Firebase Storage Bucket name - defined as constant for immutability
const FIREBASE_STORAGE_BUCKET = 'gen-lang-client-0364375301.firebasestorage.app'

// Global variable to store initialized Firebase app (idempotent pattern)
let firebaseAppInstance: admin.app.App | null = null

/**
 * Safely initializes Firebase Admin SDK (Idempotent)
 * - Reads FIREBASE_SERVICE_ACCOUNT_JSON from environment variables
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

  // Initialize Firebase Admin with the service account credentials
  firebaseAppInstance = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: FIREBASE_STORAGE_BUCKET,
  })

  console.log('[Firebase Admin] Successfully initialized Firebase Admin SDK')
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
 * Explicitly specifies the bucket name to avoid errors
 *
 * @returns Firebase Storage bucket instance
 */
export function getFirebaseStorage() {
  const app = getFirebaseApp()
  const storage = admin.storage(app)
  return storage.bucket(FIREBASE_STORAGE_BUCKET)
}
