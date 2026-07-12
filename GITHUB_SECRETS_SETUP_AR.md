# إضافة Firebase Service Account إلى GitHub Secrets

## ما تحتاجه:
- Firebase Service Account JSON (الملف الذي أعطيته)
- صلاحيات إدارة المستودع على GitHub

## الخطوات:

### 1. اذهب إلى GitHub Settings
```
https://github.com/ahmed12345877/travel-gold/settings/secrets/actions
```

### 2. انقر "New repository secret"
- الزر أخضر في الأعلى يمين الصفحة

### 3. أضف البيانات
**اسم السر:**
```
FIREBASE_SERVICE_ACCOUNT_VANIR_F4260
```

**القيمة:**
```
{
  "type": "service_account",
  "project_id": "vanir-f4260",
  "private_key_id": "...",
  "private_key": "...",
  ...
}
```

انسخ محتوى Firebase Service Account JSON كاملاً بدون أي تعديل

### 4. انقر "Add secret"

## بعد إضافة السر:

### النشر التلقائي:
- أي push إلى `main` أو `develop` سيشغل GitHub Actions
- سيتم البناء والنشر تلقائياً على Firebase

### التحقق من النشر:
1. اذهب إلى GitHub → Actions tab
2. ستجد workflow "Deploy to Firebase Hosting"
3. شاهد حالة التشغيل

### الموقع النهائي:
```
https://vanir-f4260.web.app
```

## استكشاف الأخطاء:

### الخطأ: "Secret not found"
✓ تأكد من اسم السر: `FIREBASE_SERVICE_ACCOUNT_VANIR_F4260`

### الخطأ: "Invalid Firebase Service Account"
✓ تأكد من نسخ JSON كاملاً من Firebase Console
✓ لا توجد مسافات زائدة في البداية أو النهاية

### الخطأ: "Build failed"
✓ شاهد logs في GitHub Actions
✓ تأكد من أن `pnpm build` يعمل محلياً

## الملفات المرجعية:
- `.github/workflows/firebase-deploy.yml` - سكريبت النشر
- `firebase.json` - إعدادات Firebase
- `.firebaserc` - معرف المشروع

---

**ملاحظة:** بعد إضافة السر، أي تغيير تدفعه إلى GitHub سيتم نشره تلقائياً! 🚀
