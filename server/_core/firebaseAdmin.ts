import admin from "firebase-admin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحديد مسار ملف المفتاح السري الذي قمت بتحميله ونقله
const serviceAccountPath = path.resolve(__dirname, "firebase-key.json");

// بدء اتصال السيرفر بـ Firebase أوتوماتيكياً بأعلى مستويات الأمان والسرعة
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    // سيقوم الفايربيز بجلب اسم المخزن وقاعدة البيانات تلقائياً من الملف السري
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined 
  });
}

// تصدير الأدوات الأساسية لكي تستخدمها الـ tRPC Routers فوراً وبدون أخطاء
export const db = admin.firestore();
export const bucket = admin.storage().bucket();
