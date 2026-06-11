import { initializeApp, cert, getApps, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. قراءة الشفرة السرية من متغير البيئة في موقع Render بأمان تام
let credentialApp: any = undefined;
let serviceAccountObj: any = undefined;
const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (envJson) {
  try {
    const rawJson = envJson.trim().startsWith("{") 
      ? envJson 
      : Buffer.from(envJson, "base64").toString("utf8");
    serviceAccountObj = JSON.parse(rawJson);
    credentialApp = cert(serviceAccountObj);
  } catch (e) {
    console.error("[Firebase] Failed to parse credentials from env:", e);
  }
}

// 2. إذا لم يجد المتغير يذهب للملف الاحتياطي المحلي
if (!credentialApp) {
  const primaryKeyPath = path.resolve(__dirname, "../../firebase-key.json");
  const fallbackKeyPath = path.resolve(__dirname, "firebase-key.json");
  const serviceAccountPath = fs.existsSync(primaryKeyPath) ? primaryKeyPath : fallbackKeyPath;
  
  if (fs.existsSync(serviceAccountPath)) {
    try {
      serviceAccountObj = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      credentialApp = cert(serviceAccountPath);
    } catch (e) {
      console.error("[Firebase] Failed to read local service account:", e);
    }
  }
}

// 3. تهيئة التطبيق بنظام الـ Modular الحديث المتوافق 100% مع السيرفر الحقيقي
const appsList = getApps();
if (!appsList || appsList.length === 0) {
  if (!credentialApp) {
    throw new Error(
      'CRITICAL: Firebase credentials not found. ' +
      'Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable or place firebase-key.json in the project root.'
    );
  }

  // Determine storage bucket name with fallback
  let storageBucketName = process.env.FIREBASE_STORAGE_BUCKET;
  
  if (!storageBucketName && serviceAccountObj && serviceAccountObj.project_id) {
    storageBucketName = `${serviceAccountObj.project_id}.appspot.com`;
    console.warn(
      '[Firebase] WARNING: FIREBASE_STORAGE_BUCKET not set. ' +
      'Derived bucket from service account. ' +
      'Set FIREBASE_STORAGE_BUCKET environment variable explicitly for production.'
    );
  }

  if (!storageBucketName) {
    throw new Error(
      'CRITICAL: Cannot determine Firebase Storage bucket. ' +
      'Either set FIREBASE_STORAGE_BUCKET environment variable ' +
      'or ensure FIREBASE_SERVICE_ACCOUNT_JSON contains valid project_id.'
    );
  }

  console.log(`[Firebase] Initializing with storage bucket: ${storageBucketName}`);

  initializeApp({
    credential: credentialApp,
    storageBucket: storageBucketName
  });
}

// 4. تصدير الدوال الأساسية بنفس المسميات السابقة لتعمل مع الـ REST APIs والـ Routers دون تعديل
export const db = getFirestore();

// Get storage bucket name with validation
function getStorageBucketName(): string {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;
  
  if (bucket) {
    return bucket;
  }

  if (serviceAccountObj && serviceAccountObj.project_id) {
    return `${serviceAccountObj.project_id}.appspot.com`;
  }

  throw new Error(
    'CRITICAL: Firebase Storage bucket name not available. ' +
    'This should not happen after initialization. ' +
    'Ensure FIREBASE_SERVICE_ACCOUNT_JSON is set correctly.'
  );
}

export const bucket = getStorage().bucket(getStorageBucketName());
