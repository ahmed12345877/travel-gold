import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Bucket type is not exported in this firebase-admin version; derive it.
type Bucket = ReturnType<ReturnType<typeof getStorage>["bucket"]>;
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// K_SERVICE is set by Cloud Run (Firebase App Hosting). On Cloud Run,
// ADC is automatically provisioned — no service account JSON needed.
const isCloudRun = Boolean(
  process.env.K_SERVICE ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.FIREBASE_CONFIG
);

// Server reads FIREBASE_STORAGE_BUCKET; fall back to VITE_ variant if only that is set.
const storageBucketName =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.VITE_FIREBASE_STORAGE_BUCKET ||
  (process.env.VITE_FIREBASE_PROJECT_ID
    ? `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`
    : "");

if (!getApps().length) {
  if (isCloudRun) {
    // Firebase App Hosting / Cloud Run: use Application Default Credentials.
    // The service account is auto-provisioned with the required Firebase permissions.
    initializeApp({ storageBucket: storageBucketName });
    console.log("[Firebase] Initialized with ADC (Cloud Run / Firebase App Hosting)");
  } else {
    // Local development: explicit credentials from env or local key file.
    let credentialApp: ReturnType<typeof cert> | undefined;

    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (envJson) {
      try {
        const rawJson = envJson.trim().startsWith("{")
          ? envJson
          : Buffer.from(envJson, "base64").toString("utf8");
        credentialApp = cert(JSON.parse(rawJson) as Parameters<typeof cert>[0]);
      } catch (e) {
        console.error("[Firebase] Failed to parse credentials from env:", e);
      }
    }

    if (!credentialApp) {
      const primaryKeyPath = path.resolve(__dirname, "../../firebase-key.json");
      const fallbackKeyPath = path.resolve(__dirname, "firebase-key.json");
      const serviceAccountPath = fs.existsSync(primaryKeyPath)
        ? primaryKeyPath
        : fallbackKeyPath;

      if (fs.existsSync(serviceAccountPath)) {
        try {
          credentialApp = cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8")));
        } catch (e) {
          console.error("[Firebase] Failed to read local service account:", e);
        }
      }
    }

    if (!credentialApp) {
      throw new Error(
        "CRITICAL: Firebase credentials not found. " +
        "Set FIREBASE_SERVICE_ACCOUNT_JSON or place firebase-key.json in the project root."
      );
    }

    initializeApp({ credential: credentialApp, storageBucket: storageBucketName });
    console.log("[Firebase] Initialized with explicit credentials (development)");
  }
}

export const db = getFirestore();

let cachedBucket: Bucket | null = null;

export function getBucket() {
  if (cachedBucket) return cachedBucket;
  cachedBucket = getStorage().bucket(storageBucketName);
  return cachedBucket;
}
