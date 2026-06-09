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
const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (envJson) {
  try {
    const rawJson = envJson.trim().startsWith("{") 
      ? envJson 
      : Buffer.from(envJson, "base64").toString("utf8");
    credentialApp = cert(JSON.parse(rawJson));
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
    credentialApp = cert(serviceAccountPath);
  }
}

// 3. تهيئة التطبيق بنظام الـ Modular الحديث المتوافق 100% مع السيرفر الحقيقي
const appsList = getApps();
if (!appsList || appsList.length === 0) {
  initializeApp({
    credential: credentialApp,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined
  });
}

// 4. تصدير الدوال الأساسية بنفس المسميات السابقة لتعمل مع الـ REST APIs والـ Routers دون تعديل
export const db = getFirestore();
export const bucket = getStorage().bucket();
