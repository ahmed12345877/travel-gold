# 🔒 دليل الأمان والتحقق - نظام إدارة الصور

## ⚠️ القضايا الحرجة والحلول

### 1. CRITICAL: Firebase Service Account في متغيرات البيئة

#### المشكلة:
- تخزين JSON كامل في `FIREBASE_SERVICE_ACCOUNT_JSON` يشكل مخاطر أمنية
- حد أقصى لحجم متغيرات البيئة على بعض الأنظمة
- خطر إذا تم الالتزام بالخطأ في Git

#### الحل الموصى به:

**Option 1: استخدام GOOGLE_APPLICATION_CREDENTIALS (الأفضل)**

```ts
// .env.local (على السيرفر فقط، ليس في Git)
GOOGLE_APPLICATION_CREDENTIALS="/etc/secrets/firebase-key.json"

// في server/_core/firebaseAdmin.ts
import { initializeApp, cert } from 'firebase-admin/app';

// Firebase سيقرأ من المسار تلقائياً
const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
```

**Option 2: Base64-encoded (للأنظمة بدون وصول للملفات)**

```ts
// .env.local (Base64 فقط)
FIREBASE_SERVICE_ACCOUNT_B64="eyJyZXNvdXJjZXMiOi..."

// في firebaseAdmin.ts
import { initializeApp, cert } from 'firebase-admin/app';

const serviceAccountJson = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64!, 'base64').toString()
);

const app = initializeApp({
  credential: cert(serviceAccountJson),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
```

**Option 3: استخدام Google Secret Manager (للإنتاج)**

```ts
// npm install @google-cloud/secret-manager
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getServiceAccount() {
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: 'projects/PROJECT_ID/secrets/firebase-key/versions/latest',
  });
  
  const payload = version.payload?.data?.toString();
  return JSON.parse(payload || '{}');
}
```

#### على Vercel:

```bash
# ابدأ باستخدام Vercel Secrets:
vercel env add FIREBASE_SERVICE_ACCOUNT_JSON

# أو استخدم الواجهة:
# Settings > Environment Variables > Add New > Encrypted
```

---

### 2. CRITICAL: توضيح روابط التخزين (Public vs Signed URLs)

#### الوضع الحالي:

الروابط المُرجعة من `storagePut()` عامة لكن محدودة الصلاحيات:

```text
https://storage.googleapis.com/<bucket>/<path>
```

#### المشكلة:
- هذه الروابط **لا تنتهي صلاحيتها زمنياً** لكن
- يمكن حذف الملف أو استبداله مما يؤدي لـ 404
- لا توجد تحكم في من يمكنه الوصول

#### الحل الموصى به:

**اختبر أولاً: هل الـ Bucket عام أم خاص؟**

```bash
# في Firebase Console:
# 1. اذهب إلى Storage > القوانين (Rules)
# 2. تحقق من حالة allUsers
```

**إذا كنت تريد صور عامة (recommended):**

```ts
// server/_core/storageProxy.ts أو gallery.ts
export async function storagePut(
  bucket: FirebaseApp['storage'],
  filename: string,
  buffer: Buffer,
  mimeType: string
) {
  const file = bucket.file(`gallery/${filename}`);
  
  // احفظ مع metadata الإقحام
  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    // اجعل الملف عام (إذا كانت القوانين تسمح)
    public: true,
  });

  // احصل على الرابط العام
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // سنة واحدة
  });

  return {
    url: url || `https://storage.googleapis.com/${bucket.name}/gallery/${filename}`,
    fileKey: `gallery/${filename}`,
  };
}
```

**إذا كنت تريد صور خاصة (مع Signed URLs):**

```ts
export async function storagePut(
  bucket: FirebaseApp['storage'],
  filename: string,
  buffer: Buffer,
  mimeType: string
) {
  const file = bucket.file(`gallery/${filename}`);
  
  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      cacheControl: "private, max-age=3600",
    },
  });

  // أنشئ Signed URL بمدة صلاحية محددة
  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
  });

  return {
    url: signedUrl, // رابط موقّع بصلاحية 7 أيام
    fileKey: `gallery/${filename}`,
  };
}
```

#### توثيق الاختيار:

في `FIREBASE_IMAGES_GUIDE.md` أضف:

```text
## 🔐 سياسة الوصول للصور

النظام الحالي يستخدم: **روابط عامة دائمة**

✅ المميزات:
- لا تحتاج إلى تحديث الروابط
- تخزين مباشر في DB بدون مشاكل
- بسيطة وسريعة

⚠️ القيود:
- الصور عامة للجميع (لا يمكن إخفاء)
- يمكن حذفها من Firebase فتصبح 404

📌 إذا كنت تريد صور خاصة:
  → استخدم Signed URLs مع مدة صلاحية
  → ستحتاج لتحديث الروابط كل 7 أيام
```

---

### 3. CRITICAL: حذف الملفات من Firebase Storage

#### المشكلة الحالية:
عند حذف سجل من قاعدة البيانات، الملف يبقى في Firebase مما يهدر التخزين.

#### الحل المكامل:

**في `server/routers/gallery.ts` أضف:**

```ts
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { firestore } from "../_core/firebaseAdmin";
import { getStorage } from 'firebase-admin/storage';

export const galleryRouter = router({
  delete: protectedProcedure
    .input(z.object({ 
      id: z.number().int().positive(),
      fileKey: z.string().optional(), // backup في حالة ضياع البيانات
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. اجلب السجل من Firestore
        const docRef = firestore.collection("gallery_items").doc(String(input.id));
        const snapshot = await docRef.get();
        
        if (!snapshot.exists) {
          throw new Error("Gallery item not found");
        }

        const data = snapshot.data() as {
          imageUrl?: string;
          fileKey?: string;
        };

        // 2. استخرج fileKey
        const fileKey = input.fileKey || data.fileKey;
        if (!fileKey) {
          console.warn("[Gallery] No fileKey found for deletion, only DB record will be deleted");
        }

        // 3. احذف السجل من Firestore أولاً
        await docRef.delete();
        console.log(`[Gallery] Deleted DB record for id=${input.id}`);

        // 4. احذف الملف من Firebase Storage (best-effort)
        if (fileKey) {
          try {
            const bucket = getStorage().bucket();
            await bucket.file(fileKey).delete();
            console.log(`[Gallery] Deleted storage file: ${fileKey}`);
          } catch (storageErr) {
            console.error(
              `[Gallery] Failed to delete storage file ${fileKey}:`,
              storageErr
            );
            // لا نرمي الخطأ هنا لأن DB تم حذفه بنجاح
          }
        }

        return { success: true, deletedFileKey: fileKey };
      } catch (err) {
        console.error("[Gallery] Delete mutation error:", err);
        throw err;
      }
    }),
});
```

**في `client/src/pages/admin/GalleryAdmin.tsx` استخدم:**

```tsx
const deleteMutation = trpc.gallery.delete.useMutation({
  onSuccess: (result) => {
    console.log("[GalleryAdmin] Deleted:", result.deletedFileKey);
    toast.success("تم حذف الصورة بنجاح");
    queryClient.invalidateQueries({ queryKey: ['gallery.listAll'] });
  },
  onError: (error) => {
    console.error("[GalleryAdmin] Delete failed:", error.message);
    toast.error("فشل حذف الصورة: " + error.message);
  },
});

const handleDelete = (item: GalleryItem) => {
  if (confirm(`هل تريد حذف "${item.title}"؟`)) {
    deleteMutation.mutate({ 
      id: item.id,
      fileKey: item.fileKey, // تمرير كـ backup
    });
  }
};
```

---

### 4. VALIDATION: Server-side التحقق من uploadImage()

#### الحالي: غير كافٍ

#### الحل الموصى به:

**في `server/routers/gallery.ts` أضف schema قوية:**

```ts
import { z } from "zod";
import sharp from "sharp"; // npm install sharp

const uploadImageSchema = z.object({
  fileData: z.string()
    .min(100, "الملف صغير جداً")
    .max(13 * 1024 * 1024, "الملف يتجاوز 10MB (بعد Base64)"), // 13MB للـ Base64
  filename: z.string()
    .min(1)
    .max(255)
    .regex(/\.(jpg|jpeg|png|webp|gif)$/i, "امتداد غير مدعوم"),
  mimeType: z.string()
    .regex(/^image\/(jpeg|png|webp|gif)$/, "نوع MIME غير مدعوم"),
});

export const galleryRouter = router({
  uploadImage: protectedProcedure
    .input(uploadImageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. تحويل Base64 والتحقق من الحجم
        const buffer = Buffer.from(input.fileData, "base64");
        if (buffer.byteLength > 10 * 1024 * 1024) {
          throw new Error(
            `الملف الفعلي ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB يتجاوز 10MB`
          );
        }

        // 2. التحقق من توقيع الملف (Magic Bytes)
        const validSignatures: Record<string, Uint8Array> = {
          'image/jpeg': new Uint8Array([0xff, 0xd8, 0xff]),
          'image/png': new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
          'image/webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]),
          'image/gif': new Uint8Array([0x47, 0x49, 0x46]), // GIF87a or GIF89a
        };

        const signature = validSignatures[input.mimeType];
        if (signature && !buffer.subarray(0, signature.length).every(
          (byte, i) => byte === signature[i]
        )) {
          throw new Error("ملف مشبوه: التوقيع غير متطابق");
        }

        // 3. التحقق من صحة الصورة (optional لكن موصى)
        try {
          const metadata = await sharp(buffer).metadata();
          if (!metadata.width || !metadata.height) {
            throw new Error("صورة غير صحيحة");
          }
          if (metadata.width < 100 || metadata.height < 100) {
            throw new Error("الصورة صغيرة جداً (حد أدنى: 100x100px)");
          }
          if (metadata.width > 4000 || metadata.height > 4000) {
            throw new Error("الصورة كبيرة جداً (حد أقصى: 4000x4000px)");
          }
        } catch (err) {
          throw new Error(`التحقق من الصورة فشل: ${(err as Error).message}`);
        }

        // 4. احفظ في Firebase
        const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const result = await storagePut(
          getStorage().bucket(),
          filename,
          buffer,
          input.mimeType
        );

        // 5. احفظ في Firestore
        await firestore.collection("gallery_items").add({
          imageUrl: result.url,
          fileKey: result.fileKey,
          filename: input.filename,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isVisible: true,
          category: "general",
        });

        console.log(`[Gallery] Successfully uploaded: ${result.fileKey}`);
        return result;

      } catch (err) {
        console.error("[Gallery] Upload failed:", err);
        throw err;
      }
    }),
});
```

**تثبيت المكتبات المطلوبة:**

```bash
npm install sharp --save
npm install @types/sharp --save-dev
```

---

### 5. PERFORMANCE: تجنب Base64 Bloat

#### المشكلة:
Base64 يزيد الحجم ~33% + يستهلك ذاكرة الخادم.

#### الحل البديل: FormData + Binary

**في الواجهة الأمامية:**

```tsx
// client/src/components/FileUpload.tsx
const handleUpload = async (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    toast.error("الملف أكبر من 10MB");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/image", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  return result;
};
```

**في الخادم:**

```ts
// server/routes/uploads.ts (Express middleware)
import express from 'express';
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/api/uploads/image', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "لا يوجد ملف" });
  }

  // req.file.buffer موجود بالفعل
  const result = await storagePut(
    getStorage().bucket(),
    req.file.originalname,
    req.file.buffer,
    req.file.mimetype
  );

  res.json(result);
});
```

**تثبيت:**

```bash
npm install multer @types/multer
```

---

## ✅ Checklist: قبل الإنتاج

- [ ] اختبر حذف الصورة والتحقق من حذفها من Firebase
- [ ] وثّق سياسة الصور (عامة أم Signed URLs)
- [ ] أضف Server-side validation لـ uploadImage
- [ ] اختبر ملفات بأحجام مختلفة (صغيرة وكبيرة)
- [ ] تحقق من Console logs وتتبع الأخطاء
- [ ] اختبر على صور ملفقة (spoofed) والتأكد من الرفض
- [ ] وثّق متغيرات البيئة بشكل آمن
- [ ] استخدم `GOOGLE_APPLICATION_CREDENTIALS` بدلاً من JSON في البيئة
- [ ] فعّل Cloud Armor أو WAF للحماية الإضافية

---

## 📚 مراجع إضافية

- [Firebase Security Rules](https://firebase.google.com/docs/storage/security)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Signed URLs في Firebase](https://firebase.google.com/docs/storage/admin/signed-urls)
- [Magic Bytes للصور](https://en.wikipedia.org/wiki/File_format)

