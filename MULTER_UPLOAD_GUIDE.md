# دليل Multer والرفع في المشروع

## 1. هل مكتبة Multer مثبتة؟

❌ **Multer غير مثبتة حالياً** في المشروع

المشروع يستخدم نظام رفع مختلف وأكثر أماناً:
- ✅ يستخدم **Base64 encoding** للملفات
- ✅ يستخدم **Firebase Storage** أساسياً مع fallback للتخزين المحلي
- ✅ لا حاجة لـ Multer لأن الملفات تُرسل بصيغة Base64

---

## 2. كود السيرفر الحالي (لا يحتاج Multer)

### الملف: `server/routers/uploads.ts`

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { storagePut } from "../storage";
import { createFileUpload, getUserFiles } from "../db";
import { nanoid } from "nanoid";

export const uploadsRouter = router({
  /** رفع ملف للمستخدمين المسجلين فقط */
  upload: protectedProcedure
    .input(
      z.object({
        fileData: z.string(),        // Base64 encoded file
        filename: z.string(),
        mimeType: z.string(),
        purpose: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // تحويل Base64 إلى Buffer
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // الحد الأقصى: 10 ميجابايت
      if (fileSize > 10 * 1024 * 1024) {
        throw new Error("حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
      }

      // إنشاء اسم فريد للملف
      const ext = input.filename.split(".").pop() || "bin";
      const randomSuffix = nanoid(8);
      const fileKey = `user-${ctx.user.id}/${input.purpose || "general"}/${randomSuffix}.${ext}`;

      // رفع للـ Storage (Firebase أولاً، ثم fallback للمحلي)
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // حفظ البيانات في قاعدة البيانات
      const fileRecord = await createFileUpload({
        userId: ctx.user.id,
        fileKey,
        url,
        filename: input.filename,
        mimeType: input.mimeType,
        fileSize,
        purpose: input.purpose,
      });

      return fileRecord;
    }),

  /** عرض قائمة ملفات المستخدم */
  myFiles: protectedProcedure.query(async ({ ctx }) => {
    return getUserFiles(ctx.user.id);
  }),
});
```

---

## 3. كود الإرسال من الواجهة الأمامية (React)

### الطريقة 1: باستخدام File Input (موصى به)

```typescript
import { useState } from 'react';
import { trpc } from '@/lib/trpc'; // أو مسار الـ TRPC client

export function FileUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const uploadMutation = trpc.uploads.upload.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('الرجاء اختيار ملف أولاً!');
      return;
    }

    setLoading(true);
    
    try {
      // قراءة الملف وتحويله إلى Base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');

      // إرسال الطلب للسيرفر
      const result = await uploadMutation.mutateAsync({
        fileData: base64String,
        filename: file.name,
        mimeType: file.type,
        purpose: 'profile-picture', // أو أي غرض آخر
      });

      console.log('تم رفع الملف بنجاح:', result);
      console.log('رابط الملف:', result.url);
      
      // هنا يمكنك فعل شيء مع الرابط
      // مثلاً: حفظه في الـ state أو عرضه للمستخدم
      
      setFile(null);
      alert('تم رفع الملف بنجاح!');
    } catch (error) {
      console.error('خطأ في الرفع:', error);
      alert('فشل رفع الملف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <label className="block mb-2">اختر ملف:</label>
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={loading}
            className="border p-2 w-full"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            الملف المختار: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'جاري الرفع...' : 'رفع الملف'}
        </button>
      </div>
    </div>
  );
}
```

### الطريقة 2: باستخدام Drag & Drop

```typescript
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const uploadMutation = trpc.uploads.upload.useMutation();

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    // تحقق من الحد الأقصى: 10 MB
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الملف يتجاوز 10 ميجابايت');
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');

      const result = await uploadMutation.mutateAsync({
        fileData: base64String,
        filename: file.name,
        mimeType: file.type,
        purpose: 'general',
      });

      console.log('✓ تم الرفع:', result.url);
    } catch (error) {
      console.error('✗ فشل الرفع:', error);
      alert('فشل رفع الملف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed p-8 text-center rounded transition ${
        isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-gray-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {loading ? (
        <p>جاري رفع الملف...</p>
      ) : (
        <>
          <p className="text-gray-600">اسحب الملف هنا أو انقر للاختيار</p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          />
        </>
      )}
    </div>
  );
}
```

---

## 4. إذا كنت تريد Express Server مع Multer (بديل)

إذا كنت تريد سيرفر Express منفصل باستخدام Multer:

### التثبيت:
```bash
npm install multer firebase-admin
```

### كود السيرفر مع Multer:

```typescript
import express from 'express';
import multer from 'multer';
import admin from 'firebase-admin';

const app = express();

// تهيئة Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gen-lang-client-0364375301.firebasestorage.app'
});

const bucket = admin.storage().bucket();

// إعداد Multer للتخزين في الذاكرة
const storage = multer.memoryStorage();
const upload = multer({ storage });

// رابط الرفع
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'لم يتم اختيار صورة' 
      });
    }

    // إنشاء اسم فريد
    const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(`uploads/${uniqueFileName}`);

    // رفع الملف
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        cacheControl: 'public, max-age=31536000',
      },
      public: true
    });

    // الحصول على الرابط المباشر
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${uniqueFileName}`;

    res.status(200).json({
      message: 'تم رفع الصورة بنجاح',
      url: publicUrl
    });

  } catch (error) {
    console.error('خطأ:', error);
    res.status(500).json({ 
      message: 'فشل رفع الملف' 
    });
  }
});

app.listen(5000, () => {
  console.log('السيرفر يعمل على المنفذ 5000');
});
```

### كود الإرسال من الواجهة (مع Express Multer):

```typescript
const handleUploadWithExpressServer = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file); // يجب أن يطابق upload.single('image')

  try {
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✓ رابط الصورة:', data.url);
      // حفظ الرابط في قاعدة البيانات أو state
    } else {
      console.error('✗ خطأ:', data.message);
    }
  } catch (error) {
    console.error('✗ خطأ الشبكة:', error);
  }
};
```

---

## 5. جدول المقارنة

| المعايير | النظام الحالي (Base64) | Express + Multer |
|---------|----------------------|-----------------|
| **التثبيت** | ✅ جاهز | ❌ يحتاج تثبيت |
| **الأمان** | ✅ عالي جداً | ✅ عالي |
| **الأداء** | ⚠️ أبطأ قليلاً | ✅ أسرع |
| **التعقيد** | ✅ بسيط | ⚠️ متوسط |
| **Firebase Integration** | ✅ مدمج | ✅ يحتاج تكوين |
| **صلاحيات المستخدم** | ✅ محمي بـ protectedProcedure | ❌ يحتاج تطبيق |

---

## 6. خطوات التطبيق

### للاستخدام الفوري (النظام الحالي):

```typescript
// 1. استيراد المكون
import { FileUploadComponent } from '@/components/FileUpload';

// 2. استخدامه في الصفحة
export function ProfilePage() {
  return (
    <div>
      <FileUploadComponent />
    </div>
  );
}
```

### للملفات الموجودة بالفعل:

```typescript
// استخدام الـ Hook الموجود
const { data: myFiles } = trpc.uploads.myFiles.useQuery();

// عرض الملفات المرفوعة
{myFiles?.map((file) => (
  <div key={file.id}>
    <a href={file.url} target="_blank">
      {file.filename}
    </a>
  </div>
))}
```

---

## 7. ملاحظات مهمة

✅ **استخدم النظام الحالي** - متكامل وآمن وجاهز
❌ **لا تضيف Multer** إلا إذا كان لديك سيرفر Express منفصل
✅ **الحد الأقصى**: 10 ميجابايت
✅ **الأمان**: محمي بـ authentication
✅ **التخزين**: Firebase أولاً مع fallback محلي
