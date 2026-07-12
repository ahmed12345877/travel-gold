# Firebase Hosting - خطوات النشر الكاملة

## المتطلبات المسبقة
- Node.js مثبت على جهازك
- حساب Google وحساب Firebase
- Git مثبت على جهازك

---

## الخطوة 1: تثبيت Firebase CLI

### على نظام Windows أو Mac أو Linux:
```bash
npm install -g firebase-tools
```

### التحقق من التثبيت:
```bash
firebase --version
```

---

## الخطوة 2: تسجيل الدخول إلى Firebase

```bash
firebase login
```

سيفتح المتصفح لتسجيل الدخول باستخدام حسابك على Google.
بعد التسجيل، العودة إلى Terminal ستجد الرسالة: ✓ Success

---

## الخطوة 3: نسخ المستودع

```bash
git clone https://github.com/ahmed12345877/travel-gold.git
cd travel-gold
```

---

## الخطوة 4: تثبيت المتعلقات

```bash
pnpm install
# أو
npm install
```

---

## الخطوة 5: بناء المشروع

```bash
pnpm build
# أو
npm run build
```

سيتم إنشاء مجلد `out/` يحتوي على ملفات المشروع الثابتة الجاهزة للنشر.

---

## الخطوة 6: نشر على Firebase Hosting

### الخيار الأول: النشر المباشر (اختياري)
```bash
firebase deploy
```

### الخيار الثاني: الاعتماد على GitHub Actions (موصى به)
1. تأكد من رفع جميع التغييرات إلى GitHub
2. أضف Firebase Service Account إلى GitHub Secrets:
   - اذهب إلى: `https://github.com/ahmed12345877/travel-gold/settings/secrets/actions`
   - اضغط **New repository secret**
   - الاسم: `FIREBASE_SERVICE_ACCOUNT_VANIR_F4260`
   - القيمة: Firebase Service Account JSON

3. عند Push إلى main أو develop، سيتم النشر تلقائياً

---

## الخطوة 7: التحقق من النشر

بعد النشر:
- اذهب إلى: https://vanir-f4260.web.app
- أو: https://vanir-f4260.firebaseapp.com

---

## استكشاف الأخطاء الشائعة

### المشكلة: "firebase: command not found"
**الحل:** تأكد من تثبيت Firebase CLI:
```bash
npm install -g firebase-tools
```

### المشكلة: "Authentication required"
**الحل:** قم بتسجيل الدخول:
```bash
firebase login
```

### المشكلة: "Permission denied"
**الحل:** تحقق من صلاحيات الملفات:
```bash
firebase deploy --debug
```

### المشكلة: "Build output not found"
**الحل:** تأكد من بناء المشروع أولاً:
```bash
pnpm build
ls out/
```

---

## ملفات الإعدادات المهمة

- **.firebaserc**: يحتوي على معرف المشروع (vanir-f4260)
- **firebase.json**: إعدادات Firebase Hosting
- **.github/workflows/firebase-deploy.yml**: GitHub Actions workflow

---

## التحديثات المستقبلية

كلما قمت بـ push إلى GitHub:
1. GitHub Actions سيقوم بالبناء تلقائياً
2. يتم التحقق من الأخطاء
3. إذا كانت كل شيء صحيح، يتم النشر على Firebase

---

## الدعم والمساعدة

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Next.js Export Guide](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
