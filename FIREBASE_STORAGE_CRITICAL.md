## Firebase Storage Configuration - CRITICAL

### المشكلة المحلولة:
**خطأ**: `FirebaseStorageError: Bucket name not specified or invalid`

### الحل:
يجب تعيين متغير البيئة **`FIREBASE_STORAGE_BUCKET`** بشكل صريح في بيئة التشغيل.

### الخطوات المطلوبة:

#### 1. الحصول على اسم الحاوية الصحيح:
```
# من Firebase Console:
# 1. اذهب إلى Project Settings
# 2. اختر Storage tab
# 3. انسخ bucket name (مثال: my-project-123456.appspot.com)
```

#### 2. تعيين متغير البيئة:
**على Render.com:**
```
FIREBASE_STORAGE_BUCKET=my-project-123456.appspot.com
FIREBASE_SERVICE_ACCOUNT_JSON={...json data...}
```

**محلياً (.env.local):**
```
FIREBASE_STORAGE_BUCKET=my-project-123456.appspot.com
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

#### 3. التحقق من الصحة:
- الصيغة الصحيحة: `{project-id}.appspot.com`
- الصيغة الخاطئة: `{project-id}.firebasestorage.app`
- ✅ التأكد من أن `FIREBASE_SERVICE_ACCOUNT_JSON` يحتوي على `project_id`

### ملاحظات مهمة:
- إذا لم يتم تعيين `FIREBASE_STORAGE_BUCKET`، سيحاول النظام اشتقاقه من `project_id` في service account
- ولكن **التوصية**: اعتبر `FIREBASE_STORAGE_BUCKET` إلزامياً للإنتاج
- بدون التعيين الصحيح، جميع عمليات التخزين ستفشل بخطأ 404 أو permission errors

### الملفات الحرجة المعدلة:
- `lib/firebase-admin.ts` - معالجة اشتقاق bucket name
- `server/_core/firebaseAdmin.ts` - تمرير bucket name صراحة
- `server/storage.ts` - استخدام Firebase Storage مع fallback محلي
- `lib/firebase-storage.ts` - وrappers التخزين
