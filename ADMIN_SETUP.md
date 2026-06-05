# 🔐 دليل إعداد Admin Login

## 📋 **ملخص سريع**

تم إنشاء **كلمة مرور آمنة** وتحويلها إلى Hash SHA-256 لـ admin panel.

```
كلمة المرور الأصلية: VanirAdmin@2024Secure
SHA-256 Hash: 8ab035e953a2edf850869fb9c6bbe61373e3cfa943dfd980fac29d3580daa308
```

---

## ✅ **الخطوات المطلوبة**

### **الخطوة 1: أضف المتغيرات في Render**

اذهب إلى: https://dashboard.render.com → travel-gold → Environment

| KEY | VALUE |
|-----|-------|
| `ADMIN_EMAIL` | `admin@vanirgroup.com` |
| `ADMIN_PASSWORD_HASH` | `8ab035e953a2edf850869fb9c6bbe61373e3cfa943dfd980fac29d3580daa308` |
| `JWT_SECRET` | *(موجود بالفعل)* |
| `DATABASE_URL` | *(موجود بالفعل)* |
| `VITE_SUPABASE_URL` | *(موجود بالفعل)* |
| `VITE_SUPABASE_ANON_KEY` | *(موجود بالفعل)* |

### **الخطوة 2: Deploy**

1. اضغط **Manual Deploy**
2. انتظر انتهاء التصريف
3. تحقق من الـ Logs (لا يجب أن يكون هناك أخطاء)

### **الخطوة 3: اختبر تسجيل الدخول**

```
URL: https://yoursite.com/admin/login
البريد: admin@vanirgroup.com
كلمة المرور: VanirAdmin@2024Secure
```

---

## 🔧 **الملفات المعدلة/المضافة**

### ✅ **تم التحقق من:**

1. **server/_core/env.ts** - يقرأ المتغيرات:
   ```typescript
   adminEmail: process.env.ADMIN_EMAIL ?? "",
   adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
   ```

2. **server/routers.ts** - يتحقق من البيانات:
   ```typescript
   if (input.email.toLowerCase() !== adminEmail.toLowerCase()) {
     throw TRPCError("Invalid email or password");
   }
   // تحقق من Hash بشكل آمن
   ```

3. **client/src/pages/admin/AdminLogin.tsx** - صفحة تسجيل الدخول:
   ```tsx
   const loginMutation = trpc.auth.login.useMutation({...})
   ```

### ✨ **تمت إضافة:**

- **scripts/generate-admin-password.js** - أداة توليد الـ Hash

---

## 🧪 **اختبار محلي (Development)**

```bash
# 1. نسخ متغيرات البيئة
cp .env.example .env.local

# 2. إضافة المتغيرات الجديدة
echo "ADMIN_EMAIL=admin@vanirgroup.com" >> .env.local
echo "ADMIN_PASSWORD_HASH=8ab035e953a2edf850869fb9c6bbe61373e3cfa943dfd980fac29d3580daa308" >> .env.local

# 3. تشغيل الخادم
npm run dev

# 4. اذهب إلى
http://localhost:5173/admin/login

# 5. أدخل
Email: admin@vanirgroup.com
Password: VanirAdmin@2024Secure
```

---

## 🔑 **بيانات الدخول**

```
📧 البريد الإلكتروني: admin@vanirgroup.com
🔐 كلمة المرور: VanirAdmin@2024Secure
🔗 رابط التسجيل: /admin/login
📍 لوحة التحكم: /admin
```

---

## ⚠️ **رسائل الخطأ الشائعة والحلول**

| الخطأ | السبب | الحل |
|------|------|------|
| "Invalid email or password" | بيانات خاطئة | تحقق من البريد والكلمة |
| "Admin login is not configured" | المتغيرات ناقصة | أضف `ADMIN_EMAIL` و `ADMIN_PASSWORD_HASH` |
| "Cannot reach the server" | الخادم معطل | أعد Deploy أو أعد تشغيل الخادم |
| صفحة بيضاء | خطأ في الـ Frontend | افتح Console (F12) وشوف الأخطاء |

---

## 🔐 **نصائح الأمان**

✅ **افعل:**
- احفظ كلمة المرور في مدير كلمات مرور (1Password, Bitwarden)
- استخدم كلمات مرور قوية (12+ حرف، أرقام، رموز)
- غيّر كلمة المرور كل 3 أشهر

❌ **لا تفعل:**
- لا تشارك كلمة المرور
- لا تحفظها في ملف عادي على سطح المكتب
- لا تستخدم كلمات مرور ضعيفة (admin, password, 123456)

---

## 📱 **خطوات الوصول السريعة**

```
1. أفتح: https://yoursite.com/admin/login
2. أدخل البيانات
3. اضغط "Enter Admin Panel"
4. يجب أن تنتقل إلى: /admin (لوحة التحكم)
```

---

## 🆘 **في حالة المشاكل**

1. تحقق من **Render Logs**:
   ```
   Dashboard → travel-gold → Logs
   ```

2. تحقق من **Browser Console** (F12):
   ```
   غالباً ستجد رسالة خطأ توضح المشكلة
   ```

3. تحقق من **Environment Variables**:
   ```
   تأكد من أن جميع المتغيرات مضبوطة بشكل صحيح
   ```

---

## 🎯 **التالي؟**

بعد نجاح تسجيل الدخول:

1. ✅ لوحة التحكم ستفتح
2. ✅ يمكنك إدارة الوجهات السياحية
3. ✅ يمكنك إدارة العروض والمدونات
4. ✅ يمكنك مراقبة الحجوزات

---

## 📞 **للمساعدة**

إذا واجهت أي مشكلة:

1. 📸 أرسل صورة من Logs
2. 📸 أرسل صورة من Console (F12)
3. 📝 صف المشكلة بالتفصيل

---

**تاريخ الإنشاء:** 2024
**آخر تحديث:** 2024
**الحالة:** ✅ جاهز للاستخدام
