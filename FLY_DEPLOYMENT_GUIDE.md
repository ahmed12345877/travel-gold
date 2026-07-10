# Fly.io Deployment Guide - إرشادات النشر

## مشكلة الأجهزة التي تعاد تشغيلها (Machine Restart Issue)

### السبب الرئيسي:
التطبيق يحاول البدء بدون متغيرات البيئة المطلوبة من Firebase، مما يسبب فشل في البدء والتوقف المتكرر.

### الحل:

#### 1. تعيين متغيرات البيئة في Fly.io:

استخدم Fly CLI لتعيين جميع متغيرات Firebase المطلوبة:

```bash
flyctl secrets set \
  VITE_FIREBASE_API_KEY='your_firebase_api_key' \
  VITE_FIREBASE_AUTH_DOMAIN='your_auth_domain' \
  VITE_FIREBASE_PROJECT_ID='your_project_id' \
  VITE_FIREBASE_STORAGE_BUCKET='your_storage_bucket' \
  VITE_FIREBASE_MESSAGING_SENDER_ID='your_sender_id' \
  VITE_FIREBASE_APP_ID='your_app_id' \
  VITE_FIREBASE_MEASUREMENT_ID='your_measurement_id' \
  VITE_API_URL='https://your-api-domain.com'
```

#### 2. الحصول على قيم Firebase:
قيم Firebase موجودة في:
- Firebase Console: https://console.firebase.google.com/
- اذهب إلى Project Settings
- انسخ جميع القيم من "Your apps" section

#### 3. إعادة النشر:

```bash
flyctl deploy
```

#### 4. التحقق من الحالة:

```bash
# عرض الآلات والحالة
flyctl status

# عرض السجلات الحية
flyctl logs

# التحقق من health check
curl https://travel-gold.fly.dev/api/health
```

### الملفات التي تم تحديثها:

1. **fly.toml** - إضافة متغيرات البيئة الفارغة (ستتم ملاؤها عبر `flyctl secrets`)
2. **server/_core/index.ts** - إضافة معالجة أفضل للأخطاء والإغلاق الآمن

### نصائح المراقبة:

- استخدم `flyctl logs --follow` لمراقبة السجلات الحية
- تحقق من `/api/health` endpoint
- تجنب استخدام `min_machines_running = 0` إذا كنت تريد تطبيقًا مستقرًا دائمًا

## الخطوات التالية:

1. احصل على قيم Firebase من console
2. شغّل الأوامر أعلاه لتعيين الأسرار
3. أعد نشر التطبيق
4. راقب السجلات للتأكد من عدم وجود أخطاء
