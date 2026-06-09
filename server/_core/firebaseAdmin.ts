import admin from "firebase-admin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  let credential: admin.credential.Credential;

  // Prefer FIREBASE_SERVICE_ACCOUNT_JSON env var (base64 or raw JSON string).
  // This is the recommended approach for Render / containerised deployments so
  // the private key never has to be committed to the repository.
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (envJson) {
    let parsed: object;
    try {
      // Try raw JSON first, then base64-encoded JSON
      const raw = envJson.startsWith('{') ? envJson : Buffer.from(envJson, 'base64').toString('utf8');
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is set but could not be parsed as JSON or base64-encoded JSON');
    }
    credential = admin.credential.cert(parsed as admin.ServiceAccount);
  } else {
    // Fall back to local key files (development / legacy path)
    const primaryKeyPath = path.resolve(__dirname, "firebase-key.json");
    const fallbackKeyPath = path.resolve(__dirname, "firebase-key.json.json");
    const serviceAccountPath = existsSync(primaryKeyPath) ? primaryKeyPath : fallbackKeyPath;
    credential = admin.credential.cert(serviceAccountPath);
  }

  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

// تصدير الأدوات الأساسية لكي تستخدمها الـ tRPC Routers فوراً وبدون أخطاء
export const db = admin.firestore();
export const bucket = admin.storage().bucket();
