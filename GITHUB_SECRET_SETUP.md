# إضافة Firebase Service Account إلى GitHub Secrets

## الخطوات الضرورية لتفعيل النشر التلقائي

### الخطوة 1: الحصول على بيانات Firebase Service Account

Firebase Service Account JSON الذي لديك يجب أن يحتوي على:
```json
{
  "type": "service_account",
  "project_id": "vanir-f4260",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### الخطوة 2: إضافة Secret في GitHub

1. اذهب إلى repository الخاص بك على GitHub
   ```
   https://github.com/ahmed12345877/travel-gold
   ```

2. انقر على **Settings** (الإعدادات)
   ![Step 1](https://github.githubassets.com/images/help/settings/settings-tab-with-app-icon.png)

3. من القائمة الجانبية، انقر على **Secrets and variables** → **Actions**
   ![Step 2](https://docs.github.com/assets/cb-2267/images/help/settings/actions-secrets-page.png)

4. انقر على **New repository secret** (زر أخضر)
   ![Step 3](https://docs.github.com/assets/cb-2267/images/help/settings/actions-new-secret-button.png)

5. ملء النموذج:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_VANIR_F4260`
   - **Secret**: اختر محتوى Firebase Service Account JSON الكامل
   
   ```
   {
     "type": "service_account",
     "project_id": "vanir-f4260",
     ...
   }
   ```

6. انقر على **Add secret** (إضافة Secret)

### الخطوة 3: التحقق من الإضافة

بعد إضافة Secret، ستراه في قائمة Secrets مع جزء من القيمة (مخفي للأمان).

### الخطوة 4: اختبار النشر

1. قم بدفع أي تعديل إلى `main` branch:
   ```bash
   git push origin main
   ```

2. اذهب إلى **Actions** tab في GitHub
   - سترى workflow جديد: "Deploy to Firebase Hosting"
   - يمكنك متابعة حالة النشر في الوقت الفعلي

3. بعد اكتمال النشر، تحقق من:
   - **Firebase Console**: https://console.firebase.google.com/
   - Select project `vanir-f4260`
   - انقر على **Hosting**
   - ستجد أحدث deployment

### الخطوة 5: الوصول إلى الموقع

بعد النشر الناجح، الموقع سيكون متاحاً على:
```
https://vanir-f4260.web.app
```

## استكشاف الأخطاء

### خطأ: "Error: Failed to authenticate with Firebase"
- تحقق من صحة Firebase Service Account JSON
- تأكد من إضافة Secret بالاسم الصحيح: `FIREBASE_SERVICE_ACCOUNT_VANIR_F4260`

### خطأ: "Build failed"
- تحقق من GitHub Actions logs
- قم بتشغيل `pnpm build` محلياً لتحديد المشكلة

### خطأ: "Deployment stuck"
- تحقق من Firebase Console logs
- جرب إعادة تشغيل الـ workflow من GitHub Actions

## الملفات المهمة

- `firebase.json` - إعدادات Firebase Hosting
- `.firebaserc` - معرف المشروع
- `.github/workflows/firebase-deploy.yml` - سكريبت النشر التلقائي

## الدعم

للمزيد من المعلومات:
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase CLI](https://firebase.google.com/docs/cli)
