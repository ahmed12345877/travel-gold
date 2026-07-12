# Quick Reference - نظام الرفع

## الإجابات المباشرة

### السؤال 1: هل Multer مثبتة؟
**الإجابة:** ❌ لا، وليست مطلوبة. المشروع يستخدم **Base64 Encoding** الأكثر أماناً.

---

### السؤال 2: كود السيرفر الكامل

#### الموقع: `server/routers/uploads.ts`

```typescript
export const uploadsRouter = router({
  upload: protectedProcedure
    .input(
      z.object({
        fileData: z.string(),        // Base64 مشفر
        filename: z.string(),
        mimeType: z.string(),
        purpose: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. تحويل Base64 إلى Buffer
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // 2. التحقق من الحد الأقصى (10 MB)
      if (fileSize > 10 * 1024 * 1024) {
        throw new Error("حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
      }

      // 3. إنشاء مسار فريد
      const ext = input.filename.split(".").pop() || "bin";
      const randomSuffix = nanoid(8);
      const fileKey = `user-${ctx.user.id}/${input.purpose || "general"}/${randomSuffix}.${ext}`;

      // 4. رفع للتخزين (Firebase أولاً مع fallback محلي)
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // 5. حفظ في قاعدة البيانات
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

  myFiles: protectedProcedure.query(async ({ ctx }) => {
    return getUserFiles(ctx.user.id);
  }),
});
```

**ملخص السيرفر:**
- ✅ محمي بـ authentication
- ✅ التحقق من الحجم
- ✅ تشفير Base64
- ✅ Firebase Storage + Local Fallback
- ✅ حفظ المرجع في DB

---

### السؤال 3: كود الإرسال من الواجهة الأمامية

#### الطريقة الأولى: استخدام المكون الجاهز (الموصى به)

```typescript
import { FileUploadComponent } from '@/components/FileUploadComponent';

export function MyPage() {
  return (
    <FileUploadComponent
      purpose="profile-picture"
      maxSizeMB={5}
      acceptedFileTypes="image/*"
      onUploadSuccess={(url, filename) => {
        console.log('تم الرفع:', url);
        // حفظ في قاعدة البيانات
      }}
    />
  );
}
```

#### الطريقة الثانية: رفع يدوي (Base64)

```typescript
async function uploadFile(file: File) {
  // 1. تحويل الملف إلى Base64
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  let binaryString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  
  const base64String = btoa(binaryString);

  // 2. إرسال للـ API
  const response = await fetch('/api/trpc/uploads.upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileData: base64String,
      filename: file.name,
      mimeType: file.type,
      purpose: 'general'
    })
  });

  const { result } = await response.json();
  console.log('رابط الملف:', result.url);
  
  return result;
}
```

#### الطريقة الثالثة: مع FormData (للمتوافقية)

```typescript
const formData = new FormData();
// ملاحظة: هذه الطريقة تحتاج تحويل إلى Base64
// استخدم الطريقة الأولى أو الثانية

// إذا كان لديك سيرفر Express منفصل مع Multer:
formData.append('image', fileInput.files[0]);
fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => {
  console.log('رابط الصورة:', data.url);
});
```

---

## المقارنة السريعة

```
┌─────────────────┬──────────────────┬──────────────────┐
│ المعيار         │ النظام الحالي    │ Express + Multer │
├─────────────────┼──────────────────┼──────────────────┤
│ التثبيت         │ ✅ جاهز          │ ❌ يحتاج تثبيت    │
│ الأمان          │ ✅✅ عالي جداً   │ ✅ عالي          │
│ الأداء          │ ⚠️ متوسط         │ ✅ سريع          │
│ التعقيد         │ ✅ بسيط جداً     │ ⚠️ متوسط         │
│ Firebase Ready  │ ✅ مدمج          │ ✅ يحتاج تكوين    │
│ الاستخدام      │ ✅ الأفضل        │ ❌ بديل فقط      │
└─────────────────┴──────────────────┴──────────────────┘
```

---

## الخطوات السريعة للبدء

### 1. استيراد المكون:
```typescript
import { FileUploadComponent } from '@/components/FileUploadComponent';
```

### 2. استخدامه في صفحة:
```tsx
<FileUploadComponent
  purpose="your-purpose"
  maxSizeMB={10}
  acceptedFileTypes="image/*"
  onUploadSuccess={(url) => console.log(url)}
/>
```

### 3. حفظ الرابط في DB:
```typescript
await db.yourTable.update({
  where: { id: userId },
  data: { imageUrl: url }
});
```

---

## الأخطاء الشائعة وحلولها

| الخطأ | السبب | الحل |
|-------|------|------|
| فشل الرفع | Firebase غير متاح | تحقق من .env |
| ملف ضخم جداً | يتجاوز 10 MB | قلل الحجم أو زد maxSizeMB |
| نوع ملف غير مدعوم | acceptedFileTypes غير صحيحة | عدّل القيمة |
| خطأ Encoding | البيانات غير صحيحة | استخدم الكود الصحيح |

---

## الملفات الرئيسية

```
📁 server/
  ├─ routers/uploads.ts           ← API endpoints
  └─ storage.ts                   ← معالج التخزين

📁 client/src/
  ├─ components/
  │  └─ FileUploadComponent.tsx   ← المكون الرئيسي
  └─ pages/
     └─ FileUploadExamples.tsx    ← أمثلة الاستخدام

📁 lib/
  └─ firebase-storage.ts          ← تكامل Firebase

📄 FILE_UPLOAD_COMPLETE_GUIDE.md  ← الدليل الكامل
📄 MULTER_UPLOAD_GUIDE.md         ← دليل Multer
```

---

## قائمة التحقق

- [ ] استيرد المكون
- [ ] أضفه للصفحة
- [ ] اختبر الرفع
- [ ] احفظ الرابط في DB
- [ ] عرّف UI للملفات المرفوعة

---

## الدعم والمساعدة

- 📚 اقرأ `FILE_UPLOAD_COMPLETE_GUIDE.md`
- 🔍 شاهد `FileUploadExamples.tsx`
- 🛠️ افحص `server/routers/uploads.ts`
- 💾 تحقق من `server/storage.ts`

**كل شيء مُعد وجاهز للاستخدام مباشرة** ✅
