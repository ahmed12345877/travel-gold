/**
 * 🎯 Firebase Storage Configuration Fix
 * 
 * إذا كانت الصور لا تُحفظ في Firebase Storage وتختفي بعد إعادة التشغيل،
 * اتبع هذه الخطوات:
 */

// ========================================
// STEP 1: التحقق من server/storage.ts
// ========================================
// ✅ هذا الملف موجود بالفعل ويحتوي على الكود الصحيح
// انظر: /vercel/share/v0-project/server/storage.ts
//
// المنطق:
// 1. حاول رفع إلى Firebase Storage
// 2. إذا فشل → اسقط إلى التخزين المحلي (هذا هو السبب!)
//
// الحل: تأكد من أن Firebase Admin مهيّأ بشكل صحيح


// ========================================
// STEP 2: تأكد من lib/firebase-admin.ts
// ========================================
// ✅ الملف موجود ويحتوي على الكود الصحيح
// انظر: /vercel/share/v0-project/lib/firebase-admin.ts
//
// يتطلب:
// - ✅ FIREBASE_SERVICE_ACCOUNT_JSON (environment variable)
// - ✅ FIREBASE_STORAGE_BUCKET (اختياري لكن موصى به)
//
// الحل: تأكد من إضافة هذه المتغيرات في Firebase Console


// ========================================
// STEP 3: إذا كان كود الرفع صحيح...
// ========================================
// فالمشكلة بنسبة 99% هي:
//
// ❌ FIREBASE_SERVICE_ACCOUNT_JSON غير موجود
// ❌ FIREBASE_STORAGE_BUCKET غير موجود/خاطئ
// ❌ Google Cloud Storage API معطّلة
// ❌ صلاحيات IAM ناقصة


// ========================================
// STEP 4: إذا أردت تصحيح الكود يدويّاً
// ========================================

// في server/storage.ts، غيّر هذا الجزء:
/*
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Convert data to Buffer explicitly - Firebase requires Buffer type
  let fileBuffer: Buffer;
  if (typeof data === 'string') {
    fileBuffer = Buffer.from(data, 'utf-8');
  } else if (ArrayBuffer.isView(data)) {
    fileBuffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    fileBuffer = data as Buffer;
  }

  // 🔴 المشكلة: هذا يفشل إذا لم تكن Firebase مهيّأة
  try {
    console.log(`[Storage] Attempting Firebase Storage upload for: ${key}`);
    const result = await firebaseStoragePut(key, fileBuffer, contentType);
    console.log(`[Storage] Firebase Storage upload successful for: ${key}`);
    return { key, url: result.url };
  } catch (firebaseErr) {
    console.warn(`[Storage] Firebase Storage failed for ${key}, falling back to local filesystem:`, firebaseErr);
  }

  // 🔴 المشكلة: يسقط للتخزين المحلي المؤقت
  console.log(`[Storage] Using local filesystem fallback for: ${key}`);
  const localPath = path.join(LOCAL_UPLOADS_DIR, key);
  ensureLocalDir(localPath);
  fs.writeFileSync(localPath, fileBuffer);
  return { key, url: `/uploads/${key}` }; // ❌ سيختفي بعد الإعادة!
}
*/

// الحل الأفضل (اختياري): جعل Firebase إلزامي في الإنتاج:
/*
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Convert data to Buffer explicitly
  let fileBuffer: Buffer;
  if (typeof data === 'string') {
    fileBuffer = Buffer.from(data, 'utf-8');
  } else if (ArrayBuffer.isView(data)) {
    fileBuffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    fileBuffer = data as Buffer;
  }

  // محاولة Firebase Storage
  try {
    console.log(`[Storage] Uploading to Firebase Storage: ${key}`);
    const result = await firebaseStoragePut(key, fileBuffer, contentType);
    console.log(`[Storage] ✅ Firebase Storage upload successful: ${key}`);
    return { key, url: result.url };
  } catch (firebaseErr) {
    console.error(`[Storage] ❌ Firebase Storage failed: ${firebaseErr}`);
    
    // في production، لا تسقط للتخزين المحلي
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Firebase Storage upload failed in production. ` +
        `Check FIREBASE_SERVICE_ACCOUNT_JSON and permissions. ` +
        `Error: ${firebaseErr}`
      );
    }
    
    // في development، استخدم fallback محلي
    console.warn(`[Storage] Falling back to local storage (dev only)`);
    const localPath = path.join(LOCAL_UPLOADS_DIR, key);
    ensureLocalDir(localPath);
    fs.writeFileSync(localPath, fileBuffer);
    return { key, url: `/uploads/${key}` };
  }
}
*/


// ========================================
// ✅ ما تحتاج تفعله الآن:
// ========================================

/*
1. ✅ أضف FIREBASE_SERVICE_ACCOUNT_JSON
   - اذهب إلى Firebase Console
   - Project Settings → Service Accounts
   - Generate New Private Key
   - انسخ المحتوى الكامل من ملف JSON
   - أضفه كـ environment variable في Firebase App Hosting

2. ✅ أضف FIREBASE_STORAGE_BUCKET (اختياري)
   - FIREBASE_STORAGE_BUCKET="gen-lang-client-0364375301.appspot.com"

3. ✅ تأكد من Google Cloud Storage API مفعّلة
   - https://console.cloud.google.com/apis/library/storage-api.googleapis.com
   - Click "Enable"

4. ✅ أضف IAM Permissions
   - Service Account: firebase-adminsdk-xxxxx@[project-id].iam.gserviceaccount.com
   - Roles: Storage Object Creator, Storage Object Viewer

5. ✅ أعد تشغيل التطبيق

6. ✅ تحقق من الأس جلات:
   - "[Storage] Firebase Storage upload successful"

7. ✅ تحقق من Firebase Console Storage
   - جميع الصور يجب أن تكون هناك

8. ✅ اختبر الدوام
   - رفّع صورة
   - أعد تشغيل التطبيق
   - تأكد أن الصورة لا تزال موجودة
*/


// ========================================
// 🆘 إذا استمرت المشكلة
// ========================================

/*
ابحث عن رسائل الخطأ:

❌ "FIREBASE_SERVICE_ACCOUNT_JSON is not set"
   → حل: أضف متغير البيئة في Firebase Console

❌ "Invalid Firebase service account: missing required fields"
   → حل: تأكد من نسخ ملف JSON كاملاً (لا اسم ولا نقطتين)

❌ "Could not determine Firebase Storage bucket"
   → حل: أضف FIREBASE_STORAGE_BUCKET أو تأكد من project_id

❌ "Permission denied"
   → حل: أضف IAM roles للـ Service Account

❌ "Invalid storage bucket"
   → حل: تأكد من صيغة اسم الـ bucket: "project-id.appspot.com"

اطلب المساعدة من Firebase Support إذا استمرت المشكلة!
*/
