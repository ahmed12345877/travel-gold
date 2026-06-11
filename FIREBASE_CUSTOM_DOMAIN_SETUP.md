# إعداد النطاق المخصص مع Firebase - حل مشاكل Third-Party Cookies

## المشكلة
متصفحات مثل Safari و Chrome تحظر تلقائياً ملفات تعريف الارتباط التابعة لجهات خارجية (Third-party cookies)، مما قد يسبب مشاكل في تسجيل الدخول والمصادقة عند استخدام النطاق الافتراضي لـ Firebase (`*.firebaseapp.com`).

## الحل
ربط النطاق المخصص الخاص بك (`vanirgroup.com`) مع Firebase يضمن أن جميع طلبات المصادقة تأتي من النطاق الأساسي نفسه، مما يتجنب مشاكل الـ third-party cookies.

## التكوين الحالي

### 1. متغيرات البيئة (`.env.production`)
```env
VITE_FIREBASE_AUTH_DOMAIN="vanirgroup.com"  # ← النطاق المخصص
VITE_FIREBASE_PROJECT_ID="gen-lang-client-0364375301"
VITE_FIREBASE_API_KEY="AIzaSyAszyNw2a7_bv02cf0FBXiPXwt3E2-CXdY"
```

### 2. تكوين Firebase (في `src/lib/firebase-api.ts`)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAszyNw2a7_bv02cf0FBXiPXwt3E2-CXdY",
  authDomain: "vanirgroup.com",  // ← يقرأ من VITE_FIREBASE_AUTH_DOMAIN
  projectId: "gen-lang-client-0364375301",
};
```

## الخطوات المطلوبة في Firebase Console

### 1. تفويض النطاق المخصص
في [Firebase Console](https://console.firebase.google.com/):

1. اذهب إلى **Authentication** → **Settings** → **Authorized domains**
2. أضف نطاقك المخصص: `vanirgroup.com`
3. انتظر التحقق والنشر (عادة بضع دقائق)

### 2. إعادة توجيه DNS (اختياري - للدعم الكامل)
إذا كنت تريد أن تعمل المصادقة مباشرة من النطاق الجذري:

1. في مزود DNS الخاص بك، أضف سجل CNAME أو A يشير إلى `gen-lang-client-0364375301.firebaseapp.com`
2. تحديث سجلات TXT للتحقق (إن لزم الأمر)

## الدوال المتاحة

### تسجيل الدخول بالبريد والكلمة المرور
```javascript
import { firebaseEmailLogin } from '@/lib/firebase-api';

await firebaseEmailLogin(email, password);
```

### إنشاء حساب جديد
```javascript
import { firebaseEmailSignUp } from '@/lib/firebase-api';

await firebaseEmailSignUp(email, password, displayName);
```

### تسجيل الدخول عبر Google
```javascript
import { firebaseGoogleLogin } from '@/lib/firebase-api';

await firebaseGoogleLogin();
```

### تسجيل الخروج
```javascript
import { firebaseSignOut } from '@/lib/firebase-api';

await firebaseSignOut();
```

## اختبار المصادقة

### في Safari
1. افتح التطبيق على `vanirgroup.com`
2. جرّب تسجيل الدخول والتسجيل
3. تحقق من أن ملفات تعريف الارتباط تُحفظ بشكل صحيح (Dev Tools → Storage → Cookies)

### في Chrome
1. افتح Chrome DevTools (F12)
2. اذهب إلى **Settings** → **Privacy and security** → **Block third-party cookies** (اختبر مع تفعيل هذا)
3. تأكد من عمل المصادقة بشكل طبيعي

## استكشاف الأخطاء

| الخطأ | الحل |
|------|-----|
| `unauthorized_client` أو `invalid_grant` | تأكد من إضافة النطاق في Firebase Console → Authorized domains |
| ملفات تعريف الارتباط لا تُحفظ | استخدم `credentials: "include"` في جميع طلبات fetch (تم تطبيقه بالفعل) |
| عدم عمل تسجيل الدخول عبر Google | تحقق من نطاقات OAuth المسموح بها في Google Cloud Console |

## المراجع
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Handling Third-Party Cookies](https://firebase.google.com/docs/auth/browser-considerations)
- [Custom Domain Setup](https://firebase.google.com/docs/hosting/custom-domain)
