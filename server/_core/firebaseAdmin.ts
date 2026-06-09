import admin from "firebase-admin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. قراءة الشفرة السرية من متغير البيئة في موقع Render بطريقة آمنة وصحيحة
let credential: admin.ServiceAccount | undefined;
const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (envJson) {
  try {
    const rawJson = envJson.trim().startsWith("{") 
      ? envJson 
      : Buffer.from(envJson, "base64").toString("utf8");
    credential = JSON.parse(rawJson);
  } catch (e) {
    console.error("[Firebase] Failed to parse credentials from env:", e);
  }
}

// 2. كود التحقق الآمن لبيئة الـ ES Modules لمنع تكرار التهيئة أو الانهيار
// تم استبدال الكود المعطوب بكود متوافق مع خوادم الإنتاج لمنع خطأ TypeError
const apps = admin.apps;
if (apps && apps.length === 0) {
  const primaryKeyPath = path.resolve(__dirname, "../../firebase-key.json");
  const fallbackKeyPath = path.resolve(__dirname, "firebase-key.json");
  const serviceAccountPath = fs.existsSync(primaryKeyPath) ? primaryKeyPath : fallbackKeyPath;

  admin.initializeApp({
    credential: credential ? admin.credential.cert(credential) : admin.credential.cert(serviceAccountPath),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined
  });
}

// 3. تصدير الدوال الأساسية بنفس المسميات السابقة لتعمل مع الـ REST APIs والـ Routers
export const db = admin.firestore();
export const bucket = admin.storage().bucket();
