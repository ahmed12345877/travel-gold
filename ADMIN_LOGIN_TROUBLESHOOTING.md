# Admin Login Troubleshooting Guide

## مشكلة: "Admin Access Required" عند محاولة تسجيل الدخول

### الأعراض:
- تحاول تسجيل الدخول عبر Gmail أو البريد الإلكتروني
- تسجيل الدخول يبدو ناجحاً (لا توجد رسائل خطأ)
- لكنك تنتقل إلى صفحة "Admin Access Required" بدلاً من لوحة التحكم
- يطالبك بتسجيل دخول آخر

### السبب الجذري:

الـ server يتحقق من متغير البيئة `ADMIN_EMAILS`. إذا كان بريدك الإلكتروني **ليس** في هذه القائمة، سيرفع الـ request.

```typescript
// server/authExpressRouter.ts - السطور 15-19
const bootstrapEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const isBootstrapAdmin = Boolean(email && bootstrapEmails.includes(email.toLowerCase()));

if (!userData || userData.role !== "admin") {
  throw new Error("Admin access denied");  // ← هذا الخطأ
}
```

### الحل - الخطوات العملية:

#### 1. افتح لوحة تحكم Vercel
اذهب إلى:
```
https://vercel.com/roshdi333z-2279s-projects/travel-gold
```

#### 2. اذهب إلى Settings

انقر على **Settings** في الشريط العلوي

#### 3. اذهب إلى Environment Variables

من القائمة اليسرى، انقر على **Environment Variables**

#### 4. ابحث عن أو أضف `ADMIN_EMAILS`

**إذا كانت موجودة:**
- انقر على تعديل (Edit)
- تأكد من أن البريد الإلكتروني الخاص بك موجود

**إذا لم تكن موجودة:**
- انقر على **Add New**
- اسم المتغير: `ADMIN_EMAILS`
- القيمة: بريدك الإلكتروني (مثل: `your-email@gmail.com`)

#### 5. الصيغة الصحيحة:

**بريد واحد:**
```
admin@example.com
```

**عدة رسائل بريد:**
```
admin@example.com,another-admin@example.com,third-admin@gmail.com
```

**ملاحظات مهمة:**
- لا توجد مسافات قبل أو بعد عناوين البريد
- يجب أن يكون البريد **نفسه** الذي تستخدمه في Gmail
- الحروف الكبيرة والصغيرة غير مهمة (case-insensitive)

#### 6. احفظ التغييرات

انقر على **Save**

#### 7. انتظر الـ Deployment

Vercel سيعيد بناء الـ deployment تلقائياً. يستغرق عادة 2-5 دقائق.

يمكنك متابعة التقدم من خلال:
- اذهب إلى **Deployments** tab
- ابحث عن النشر الأحدث

#### 8. اختبر Login مرة أخرى

بعد اكتمال الـ deployment:
1. افتح `https://vanirgroup.com/admin/login`
2. انقر على **Continue with Google** أو أدخل بريدك وكلمة مرورك
3. يجب أن تنتقل الآن إلى `/admin` مع عرض لوحة التحكم

---

## ماذا إذا استمرت المشكلة؟

### تحقق من النقاط التالية:

#### 1. تم حفظ التغييرات؟
- تأكد من نقر "Save" بعد تعديل أو إضافة `ADMIN_EMAILS`

#### 2. اكتمل الـ Deployment؟
- اذهب إلى **Deployments** واتبع حالة الـ build
- يجب أن يكون الحالة "Ready" بعلامة خضراء

#### 3. هل البريد صحيح؟
- تأكد من أن البريد الذي تستخدمه في Gmail **نفس** البريد في `ADMIN_EMAILS`
- لا توجد مسافات إضافية

#### 4. مسح الـ Browser Cache
- حاول فتح الموقع في نافذة Private/Incognito
- أو امسح ملفات تعريف الارتباط والـ localStorage

#### 5. تحقق من الـ Firebase Config
- تأكد من أن `VITE_FIREBASE_API_KEY` معرّف بشكل صحيح
- تأكد من أن Firebase Console config صحيح

---

## معلومات تقنية إضافية:

### كيف تعمل المصادقة:

```
1. المستخدم يدخل البريد وكلمة المرور
   ↓
2. Firebase يتحقق من بيانات المستخدم
   ↓
3. يتم إنشاء ID Token
   ↓
4. يتم إرسال الـ Token إلى `/api/auth/login` أو `/api/auth/admin-google`
   ↓
5. السيرفر يفك تشفير الـ Token (verified)
   ↓
6. السيرفر يبحث في `ADMIN_EMAILS` عن البريد
   ↓
7. إذا كان موجوداً: يتم إنشاء جلسة admin وإرسال session cookie
   ↓
8. إذا لم يكن موجوداً: ترفع خطأ "Admin access denied" (403)
   ↓
9. المتصفح يتلقى الخطأ ويعرض صفحة "Admin Access Required"
```

### متغيرات البيئة المطلوبة:

| المتغير | المثال | الوصف |
|--------|--------|-------|
| `ADMIN_EMAILS` | `admin@company.com` | قائمة رسائل البريد الإلكترونية للمسؤولين (مفصولة بفواصل) |
| `VITE_FIREBASE_API_KEY` | `AIzaSyD...` | مفتاح Firebase API |
| `FIREBASE_PROJECT_ID` | `my-project` | معرّف مشروع Firebase |

---

## الحل الذي تم تطبيقه (الإصلاحات الجديدة):

التعديلات التي تم دمجها تحسّن من تجربة OAuth:

1. **Reliable Error Detection** - كشف popup cancel بشكل موثوق
2. **Adaptive Session Polling** - التحقق من الجلسة قبل الـ redirect
3. **Consistent Flow** - نفس المنطق لـ email و Google login

لكن المشكلة الحالية **ليست** بسبب هذه الإصلاحات - بل بسبب `ADMIN_EMAILS` configuration.

---

## الاتصال بالدعم:

إذا استمرت المشكلة بعد اتباع هذه الخطوات، تأكد من:
- قيمة `ADMIN_EMAILS` على Vercel صحيحة
- الـ Deployment اكتمل بنجاح
- أنت تستخدم نفس بريد Gmail أو البريد الإلكتروني المسجل
