# تكوين Firebase الكامل

## القيم المستخدمة من Firebase Console

تم نسخ جميع القيم التالية من Firebase Console لضمان الإعداد الصحيح:

### بيانات المشروع

| المتغير | القيمة |
|--------|--------|
| API Key | `AIzaSyAszyNw2a7_bv02cf0FBXiPXwt3E2-CXdY` |
| Auth Domain | `vanirgroup.com` (النطاق المخصص) |
| Project ID | `gen-lang-client-0364375301` |
| Storage Bucket | `gen-lang-client-0364375301.firebasestorage.app` |
| Messaging Sender ID | `1001729880037` |
| App ID | `1:1001729880037:web:0cf4200a2a48e96547090c` |
| Measurement ID | `G-5ETHDXPS4L` |

## ملفات التكوين

### 1. `.env.production`

جميع متغيرات البيئة مضبوطة في `/vercel/share/v0-project/.env.production`:

```env
VITE_FIREBASE_API_KEY="AIzaSyAszyNw2a7_bv02cf0FBXiPXwt3E2-CXdY"
VITE_FIREBASE_AUTH_DOMAIN="vanirgroup.com"
VITE_FIREBASE_PROJECT_ID="gen-lang-client-0364375301"
VITE_FIREBASE_STORAGE_BUCKET="gen-lang-client-0364375301.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1001729880037"
VITE_FIREBASE_APP_ID="1:1001729880037:web:0cf4200a2a48e96547090c"
VITE_FIREBASE_MEASUREMENT_ID="G-5ETHDXPS4L"
```

### 2. `firebase-api.ts`

ملف التهيئة الرئيسي يقع في `client/src/lib/firebase-api.ts` ويحتوي على:

```typescript
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "vanirgroup.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "gen-lang-client-0364375301",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "gen-lang-client-0364375301.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "1001729880037",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:1001729880037:web:0cf4200a2a48e96547090c",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-5ETHDXPS4L",
};
```

## الميزات المُفعّلة

### 1. النطاق المخصص (Custom Domain)

استخدام `vanirgroup.com` بدلاً من `gen-lang-client-0364375301.firebaseapp.com` يوفر:

- تجنب مشاكل ملفات تعريف الارتباط من جهات خارجية (Third-party cookies)
- توافقية أفضل مع Safari و Chrome في الإصدارات الحديثة
- تحسين الأمان والخصوصية

### 2. Google Analytics

تم تفعيل Google Analytics تلقائياً عند تهيئة Firebase باستخدام `measurementId`.

### 3. دوال المصادقة المتاحة

```typescript
// تسجيل دخول بالبريد والكلمة المرور
firebaseEmailLogin(email: string, password: string): Promise<void>

// إنشاء حساب جديد
firebaseEmailSignUp(email: string, password: string, name?: string): Promise<void>

// تسجيل دخول عبر Google
firebaseGoogleLogin(): Promise<void>

// تسجيل الخروج
firebaseSignOut(): Promise<void>
```

## الخطوات التالية المطلوبة

### 1. في Firebase Console

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك `gen-lang-client-0364375301`
3. في **Authentication → Settings → Authorized domains**
   - تأكد من وجود `vanirgroup.com` في القائمة
   - إذا لم تكن موجودة، أضفها يدوياً
4. قم بتفعيل **Google Sign-In** إذا أردت استخدام `firebaseGoogleLogin()`

### 2. في تطبيقك

في صفحات تسجيل الدخول والتسجيل، استخدم الدوال المُصدرة:

```typescript
import { firebaseEmailLogin, firebaseEmailSignUp } from '@/lib/firebase-api';

// عند الضغط على زر تسجيل الدخول
async function handleLogin(email: string, password: string) {
  try {
    await firebaseEmailLogin(email, password);
    // سيتم إعادة التوجيه تلقائياً بعد النجاح
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error.message);
  }
}

// عند الضغط على زر التسجيل
async function handleSignUp(email: string, password: string, name: string) {
  try {
    await firebaseEmailSignUp(email, password, name);
    // سيتم إعادة التوجيه تلقائياً بعد النجاح
  } catch (error) {
    console.error("خطأ في إنشاء الحساب:", error.message);
  }
}
```

## استكشاف الأخطاء

### الخطأ: "Firebase is not configured"

- السبب: `VITE_FIREBASE_API_KEY` لم يتم تعيينه
- الحل: تحقق من `.env.production` وتأكد من وجود `VITE_FIREBASE_API_KEY`

### الخطأ: "auth/user-not-found" عند تسجيل الدخول

- السبب: المستخدم لم يقم بالتسجيل من قبل
- الحل: استخدم `firebaseEmailSignUp` لإنشاء حساب جديد أولاً

### الخطأ: "auth/weak-password"

- السبب: كلمة المرور أقل من 6 أحرف
- الحل: استخدم كلمة مرور أقوى (8 أحرف على الأقل)

### مشاكل Third-party Cookies في Safari

إذا واجهت مشاكل:

1. تأكد من أن `authDomain` مضبوط على `vanirgroup.com`
2. أضف النطاق في Firebase Console تحت **Authorized domains**
3. استخدم HTTPS في الإنتاج (Chrome و Safari يتطلبان HTTPS)

## الملفات المحدثة

- ✅ `/vercel/share/v0-project/.env.production` - إضافة `VITE_FIREBASE_MEASUREMENT_ID`
- ✅ `/vercel/share/v0-project/client/src/lib/firebase-api.ts` - تحديث التكوين الكامل وإضافة Google Analytics

## الحالة الحالية

✅ تم التكوين بنجاح
✅ جميع البيانات من Firebase Console
✅ النطاق المخصص مفعّل
✅ جاهز للإنتاج

---

**آخر تحديث:** 2026-06-12
