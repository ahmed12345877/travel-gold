# Firebase Hosting Deployment Guide

## المشكلة التي تم حلها

Firebase كان يطلب ترقية الخطة لاستخدام **App Hosting**. تم حل هذا بالتحول إلى **Firebase Hosting** المجاني.

## الإعدادات الحالية

### Next.js Configuration
```
output: 'export'  (Static Export)
```
- المشروع يُرجِع ملفات ثابتة في مجلد `out/`
- متوافق تماماً مع Firebase Hosting المجاني

### Firebase Configuration
```
public: "out"
```
- Firebase ينشر الملفات من مجلد `out/`
- دعم كامل لـ SPA routing عبر rewrites

## الخطوات المطلوبة للنشر

### 1. إضافة Firebase Service Account إلى GitHub Secrets

1. اذهب إلى: `https://github.com/ahmed12345877/travel-gold/settings/secrets/actions`
2. انقر **New repository secret**
3. الاسم: `FIREBASE_SERVICE_ACCOUNT_VANIR_F4260`
4. القيمة: اللصق Firebase Service Account JSON

### 2. دفع التغييرات إلى GitHub

```bash
git push origin main
```

### 3. GitHub Actions سيقوم تلقائياً بـ:
- بناء المشروع: `pnpm build`
- إنتاج الملفات الثابتة في `out/`
- نشر على Firebase Hosting

## التحقق من الحالة

### في GitHub
- اذهب إلى **Actions** tab
- شاهد حالة `Deploy to Firebase Hosting` workflow

### في Firebase Console
- اذهب إلى https://console.firebase.google.com/u/0/project/vanir-f4260/hosting/main
- شاهد سجل النشر والإصدارات

## الموقع المباشر

```
https://vanir-f4260.web.app
```

## الملفات المعدلة

- ✅ `next.config.mjs` - Changed to static export
- ✅ `firebase.json` - Updated public directory and rewrites
- ✅ `app/api/health/route.ts` - Deleted (incompatible with static export)

## استكشاف الأخطاء

### Build fails with "API route not supported"
**الحل**: تأكد من عدم وجود ملفات `route.ts` في `app/api/`

### Firebase says "Project needs upgrade"
**الحل**: تأكد من استخدام Firebase Hosting وليس App Hosting

### Files not deploying
**الحل**: تأكد من أن مجلد `out/` يحتوي على الملفات بعد البناء

## نصائح

- قم بفحص الملفات المُنشأة: `ls -la out/`
- تحقق من workflow logs في GitHub Actions
- استخدم Firebase CLI محلياً: `firebase deploy --only hosting`

## المزيد من المعلومات

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- [GitHub Actions Firebase Deploy](https://github.com/FirebaseExtended/action-hosting-deploy)
