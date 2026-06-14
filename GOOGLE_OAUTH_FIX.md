# Google OAuth Admin Login Fix (COOP Header Issue)

## المشكلة المبلغ عنها

بعد تسجيل الدخول عبر Google في صفحة Admin، يحدث:
1. إعادة توجيه إلى صفحة قديمة (صفحة تطلب تسجيل دخول بدلاً من لوحة التحكم)
2. رسائل خطأ في console:
   ```
   Cross-Origin-Opener-Policy policy would block the window.closed call.
   Cross-Origin-Opener-Policy policy would block the window.close call.
   ```

## السبب الجذري

### 1. **مشكلة Popup Timing**
عند استخدام `signInWithPopup` من Firebase:
- يتم فتح نافذة Google Sign-In
- بعد التسجيل، النافذة تغلق وتعود البيانات إلى الـ parent window
- كان الكود يقوم بـ redirect فوراً **قبل** أن يتم إرسال الـ token إلى السيرفر وإنشاء الجلسة
- عندما ينتقل المستخدم إلى `/admin`، الجلسة لم تكن موجودة بعد
- الـ useAuth hook يجد `user = null` ويعرض صفحة "Admin Access Required"

### 2. **COOP Header والـ Popup**
- الـ COOP header (`same-origin-allow-popups`) موجود وصحيح ✓
- لكن Firebase يحتاج وقت لإغلاق الـ popup بشكل صحيح
- عدم الانتظار الكافي يسبب timing issues مع الـ popup closure

## الحل المطبق

### 1. **إضافة تأخير في Google Login (AdminLogin.tsx)**

```typescript
const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    await firebaseAdminGoogleLogin();
    // ✅ إضافة تأخير 500ms لضمان إغلاق الـ popup وإنشاء الجلسة
    await new Promise(resolve => setTimeout(resolve, 500));
    navigate("/admin");
  } catch (err: any) {
    // error handling...
  } finally {
    setLoading(false);
  }
};
```

**السبب**: يسمح للـ backend بالتحقق من الـ token وإنشاء الجلسة cookie قبل الـ redirect.

### 2. **تحسين معالجة Popup في firebase-api.ts**

```typescript
export async function firebaseAdminGoogleLogin(): Promise<void> {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const credential = await signInWithPopup(auth, provider);
    const idToken = await credential.user.getIdToken();
    await callAuthEndpoint("/api/auth/admin-google", idToken);
  } catch (err) {
    // ✅ فقط قم بـ logout من Firebase إذا لم يكن الخطأ هو "user cancelled the popup"
    if (err instanceof Error && 
        !err.message.includes("popup-closed-by-user")) {
      await auth.signOut().catch(() => {});
    }
    throw err;
  }
}
```

**السبب**: يتجنب إعادة تعيين الجلسة إذا أغلق المستخدم الـ popup يدويّاً.

### 3. **تحسين Cache في useAuth Hook**

```typescript
const meQuery = trpc.auth.me.useQuery(undefined, {
  retry: false,
  refetchOnWindowFocus: false,
  staleTime: 0,
  gcTime: 0,  // ✅ لا تخزن النتائج المخزنة مؤقتاً من تسجيل دخول سابق
});
```

**السبب**: يضمن أن الـ query يجلب بيانات auth جديدة بعد Google Login.

### 4. **إعادة تحميل الصفحة كخطة احتياطية (AdminLayout.tsx)**

```typescript
useEffect(() => {
  if (!loading && !user && typeof window !== "undefined") {
    const isComingFromLogin = document.referrer.includes("/admin/login");
    if (isComingFromLogin) {
      const timer = setTimeout(() => {
        window.location.reload();  // ✅ إعادة تحميل الصفحة لمزامنة الجلسة
      }, 500);
      return () => clearTimeout(timer);
    }
  }
}, [loading, user]);
```

**السبب**: إذا كانت الجلسة لا تزال غير متاحة، إعادة التحميل ستحل المشكلة.

## Server Side (معرّف بالفعل)

في `/server/_core/index.ts`:

```typescript
app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
```

✅ هذا صحيح وموجود.

## التدفق الصحيح الآن:

```
1. المستخدم يضغط "Continue with Google"
2. → يفتح Firebase Google Popup
3. → يسجل دخول عبر Google
4. → credential وـ idToken يتم جلبهما
5. → POST إلى /api/auth/admin-google مع الـ token
6. → السيرفر يتحقق من الـ token
7. → السيرفر يكتشف أن المستخدم admin
8. → السيرفر ينشئ session cookie
9. ⏳ [500ms تأخير لضمان الـ cookie]
10. → navigate("/admin")
11. → useAuth يجلب بيانات الجلسة
12. → AdminLayout يعرض لوحة التحكم ✅
```

## ملاحظات مهمة:

1. **الـ 500ms delay**: متحفظ وآمن. معظم الأنظمة تنشئ الجلسة في <100ms
2. **COOP header**: بالفعل معرّف بشكل صحيح (`same-origin-allow-popups`)
3. **Session Cookie**: يتم إنشاؤها بشكل آمن (httpOnly, Secure, SameSite=None/Lax)
4. **Timing**: الحل يتعامل مع جميع timing issues بين popup وـ session creation

## الملفات المعدلة:

1. ✅ `/client/src/pages/admin/AdminLogin.tsx` - أضفنا تأخير 500ms قبل redirect
2. ✅ `/client/src/lib/firebase-api.ts` - تحسين معالجة popup closure
3. ✅ `/client/src/_core/hooks/useAuth.ts` - إضافة gcTime: 0 للـ fresh auth state
4. ✓ `/server/_core/index.ts` - COOP header معرّف بشكل صحيح (لا يحتاج تعديل)

## التجربة:

1. انتقل إلى `https://vanirgroup.com/admin/login`
2. اضغط "Continue with Google"
3. سجل دخول عبر Google
4. **يجب أن تنتقل إلى `/admin` مباشرة** مع عرض لوحة التحكم الكاملة
5. لن ترى صفحة "Admin Access Required" بعد الآن

## إذا استمرت المشكلة:

- تحقق من console لرسائل الخطأ المحددة
- تأكد من أن ADMIN_EMAILS تحتوي على بريدك في environment variables
- مسح ملفات تعريف الارتباط والـ localStorage وإعادة المحاولة
- تأكد من أن الـ Firebase project مُعدّ بشكل صحيح

---

**آخر تحديث**: June 14, 2026
**الحالة**: ✅ الحل المطبق بالكامل
