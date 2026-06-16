# دليل شامل لنظام رفع الملفات في المشروع

## الملخص السريع

| السؤال | الإجابة |
|--------|---------|
| **Multer مثبتة؟** | ❌ لا - المشروع يستخدم Base64 الأكثر أماناً |
| **السيرفر يستخدم أي تقنية؟** | ✅ TRPC + Firebase Storage مع fallback محلي |
| **كيف أرفع ملف؟** | ✅ استخدم `FileUploadComponent` الموجود |
| **الحد الأقصى للملف؟** | 📦 10 ميجابايت افتراضي (قابل للتغيير) |

---

## 1. الهيكل الحالي

### الملفات الرئيسية:

```
server/routers/uploads.ts          ← API للرفع (TRPC)
server/storage.ts                  ← معالج التخزين
lib/firebase-storage.ts            ← تكامل Firebase
client/src/components/FileUploadComponent.tsx  ← مكون React
```

### الحسابات:
```
Frontend (React)
    ↓ (Base64 Encoding)
TRPC Client
    ↓ (HTTP POST)
TRPC Server
    ↓ (Buffer Conversion)
storagePut()
    ├→ Firebase Storage (Primary)
    └→ Local Filesystem (Fallback)
```

---

## 2. طرق الاستخدام

### الطريقة 1: استخدام المكون المُنشأ (الموصى به)

```typescript
import { FileUploadComponent } from '@/components/FileUploadComponent';

export function MyPage() {
  const handleSuccess = (url: string, filename: string) => {
    console.log('تم الرفع:', { url, filename });
    // حفظ في قاعدة البيانات أو state
  };

  return (
    <FileUploadComponent
      purpose="profile-picture"      // الغرض
      maxSizeMB={5}                  // الحد الأقصى
      acceptedFileTypes="image/*"    // أنواع الملفات المقبولة
      onUploadSuccess={handleSuccess} // callback النجاح
    />
  );
}
```

### الطريقة 2: رفع الملفات برمجياً

```typescript
async function uploadFile(file: File) {
  // 1. تحويل إلى Base64
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binaryString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  const base64String = btoa(binaryString);

  // 2. إرسال للسيرفر
  try {
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
    
  } catch (error) {
    console.error('خطأ الرفع:', error);
  }
}
```

### الطريقة 3: استخدام مع React Query/SWR

```typescript
import { useMutation } from '@tanstack/react-query';

export function useFileUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const base64 = await fileToBase64(file);
      const response = await fetch('/api/trpc/uploads.upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: base64,
          filename: file.name,
          mimeType: file.type,
          purpose: 'general'
        })
      });
      return response.json();
    }
  });
}

// الاستخدام:
export function MyComponent() {
  const { mutate, isPending } = useFileUpload();

  return (
    <button 
      onClick={() => mutate(myFile)}
      disabled={isPending}
    >
      {isPending ? 'جاري...' : 'رفع'}
    </button>
  );
}
```

---

## 3. الخصائص الإضافية

### تخصيص الحدود:

```typescript
// صور صغيرة فقط
<FileUploadComponent
  maxSizeMB={2}
  acceptedFileTypes="image/jpeg,image/png"
/>

// مستندات كبيرة
<FileUploadComponent
  maxSizeMB={50}
  acceptedFileTypes=".pdf,.doc,.docx,.xls"
/>
```

### معالجة الأخطاء:

```typescript
<FileUploadComponent
  onUploadSuccess={(url, filename) => {
    // يُستدعى عند النجاح
    saveToDatabase(url, filename);
  }}
  // يتم التعامل مع الأخطاء داخل المكون
  // (رسائل خطأ مرئية للمستخدم)
/>
```

---

## 4. بيانات قاعدة البيانات

### جدول الملفات (files_uploads):

```sql
CREATE TABLE file_uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  file_key VARCHAR(255) NOT NULL,      -- مسار التخزين
  url TEXT NOT NULL,                    -- رابط الملف
  filename VARCHAR(255) NOT NULL,       -- الاسم الأصلي
  mime_type VARCHAR(100),               -- نوع الملف
  file_size INT,                        -- حجم الملف بالبايتات
  purpose VARCHAR(50),                  -- الغرض (profile, gallery, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### حفظ الملف:

```typescript
// في السيرفر بعد الرفع الناجح
const fileRecord = await createFileUpload({
  userId: ctx.user.id,
  fileKey: 'user-123/profile/abc123.jpg',
  url: 'https://storage.googleapis.com/...',
  filename: 'my-photo.jpg',
  mimeType: 'image/jpeg',
  fileSize: 245621,
  purpose: 'profile-picture'
});
```

### استرجاع ملفات المستخدم:

```typescript
// في السيرفر
const userFiles = await getUserFiles(userId);

// في الواجهة
const { data: myFiles } = trpc.uploads.myFiles.useQuery();

// عرضها
{myFiles?.map(file => (
  <div key={file.id}>
    <a href={file.url} target="_blank">
      {file.filename} ({file.file_size} bytes)
    </a>
  </div>
))}
```

---

## 5. معالجة الأخطاء الشاملة

### أنواع الأخطاء المحتملة:

```typescript
// حجم الملف كبير جداً
if (fileSize > 10 * 1024 * 1024) {
  throw new Error("حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
}

// بدون ملف مختار
if (!file) {
  throw new Error("الرجاء اختيار ملف أولاً!");
}

// نوع ملف غير مدعوم
if (!acceptedTypes.includes(file.type)) {
  throw new Error(`نوع الملف غير مدعوم: ${file.type}`);
}

// فشل Firebase
if (firebaseStorageFailed) {
  // يتم الاحتفاظ به محلياً تلقائياً
  console.log("تخزين محلي - Firebase غير متاح");
}
```

---

## 6. الأمان

### طبقات الحماية:

✅ **Authentication**: الرفع محمي بـ `protectedProcedure`
✅ **Validation**: التحقق من حجم الملف والنوع
✅ **Encoding**: تحويل آمن إلى Base64
✅ **Storage**: Firebase مع تشفير
✅ **Paths**: أسماء ملفات عشوائية
✅ **Rate Limiting**: يمكن إضافته إذا لزم الأمر

### مثال تحديد الصلاحيات:

```typescript
// السماح للمستخدم برؤية ملفاته فقط
export const uploadsRouter = router({
  myFiles: protectedProcedure.query(async ({ ctx }) => {
    // ctx.user.id يضمن عدم رؤية ملفات المستخدمين الآخرين
    return getUserFiles(ctx.user.id);
  }),
});
```

---

## 7. الأداء والتحسينات

### تحسينات مقترحة:

```typescript
// 1. ضغط الصور قبل الرفع
import sharp from 'sharp';

const optimizedBuffer = await sharp(buffer)
  .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer();

// 2. رفع متوازي للملفات المتعددة
Promise.all(files.map(file => uploadFile(file)));

// 3. شريط التقدم (Progress Bar)
// نقل الملف في أجزاء بدلاً من دفعة واحدة
```

---

## 8. استكشاف الأخطاء

### إذا لم يعمل الرفع:

```
❌ "Firebase Storage غير متاح"
→ تحقق من FIREBASE_SERVICE_ACCOUNT_JSON في .env

❌ "خطأ في Encoding"
→ تأكد أن الملف محمّل بالكامل قبل التحويل

❌ "حجم الملف كبير"
→ زد maxSizeMB في خصائص المكون

❌ "نوع الملف غير مدعوم"
→ عدّل acceptedFileTypes
```

---

## 9. الخادم Express المنفصل (اختياري)

إذا أردت سيرفر منفصل مع Multer:

### التثبيت:
```bash
npm install express multer firebase-admin cors
```

### الكود:
```typescript
import express from 'express';
import multer from 'multer';
import admin from 'firebase-admin';

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gen-lang-client-0364375301.firebasestorage.app'
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const bucket = admin.storage().bucket();
  const file = bucket.file(`uploads/${Date.now()}-${req.file.originalname}`);
  
  await file.save(req.file.buffer);
  const [url] = await file.getSignedUrl({ version: 'v4', action: 'read', expires: Date.now() + 15 * 60 * 1000 });
  
  res.json({ url });
});

app.listen(3001, () => console.log('متاح على 3001'));
```

---

## 10. المراجع

- 📄 `MULTER_UPLOAD_GUIDE.md` - دليل Multer
- 🔧 `server/routers/uploads.ts` - API endpoints
- 🎨 `client/src/components/FileUploadComponent.tsx` - مكون الرفع
- 📱 `client/src/pages/FileUploadExamples.tsx` - أمثلة الاستخدام
- 🔐 `lib/firebase-storage.ts` - تكامل Firebase

---

## الخلاصة

**استخدم النظام الحالي** - آمن، مدمج، وجاهز للإنتاج ✅
**لا تحتاج Multer** إلا للسيرفر Express المنفصل ❌
