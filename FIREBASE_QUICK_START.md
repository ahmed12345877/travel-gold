# ⚡ Firebase Storage - Quick Start (5 خطوات)

## الملخص السريع جداً

```
❌ المشكلة الحالية:
   الصور تُحفظ محلياً → تختفي عند إعادة التشغيل

✅ الحل:
   رفع الصور إلى Firebase Storage → تبقى دائماً
```

---

## 5️⃣ خطوات فقط:

### 1️⃣ احصل على Service Account
```
https://console.firebase.google.com
→ Project Settings ⚙️
→ Service Accounts
→ Generate New Private Key
→ احفظ الملف JSON
```

### 2️⃣ أضف متغيرات البيئة
```
Firebase Console
→ Hosting / App Hosting
→ Environment Variables
→ Add:

Name: FIREBASE_SERVICE_ACCOUNT_JSON
Value: (كل محتوى ملف JSON)

Name: FIREBASE_STORAGE_BUCKET  
Value: gen-lang-client-0364375301.appspot.com
```

### 3️⃣ فعّل Google Cloud APIs
```
Google Cloud Console
→ Search: "Cloud Storage API"
→ Enable
```

### 4️⃣ أضف IAM Roles
```
Google Cloud Console
→ IAM & Admin
→ ابحث عن firebase-adminsdk-...
→ أضف أدوار:
  ☑️ Storage Object Creator
  ☑️ Storage Object Viewer
```

### 5️⃣ Deploy
```
firebase deploy
أو اضغط Redeploy في Firebase Console
```

---

## ✅ اختبر الآن

```
1. Upload صورة من Admin
2. شيك Firebase Console → Storage
3. أعد تشغيل التطبيق
4. الصورة لا تزال موجودة؟ ✅ تمام!
```

---

## 🆘 خطأ؟

| الخطأ | الحل |
|------|------|
| `FIREBASE_SERVICE_ACCOUNT_JSON is not set` | أضفه في Firebase Console |
| `Invalid JSON` | انسخ كل ملف JSON بالكامل |
| `Permission denied` | أضف IAM roles (انظر الخطوة 4) |
| `API not enabled` | فعّل Cloud Storage API (الخطوة 3) |

---

## 📚 معلومات إضافية

اقرأ الملفات الأخرى:
- `FIREBASE_SETUP_STEP_BY_STEP.md` - شرح مفصل
- `FIREBASE_STORAGE_FLOW.md` - رسوم بيانية
- `verify-firebase-setup.sh` - script فحص

---

**الوقت المتوقع: 10-15 دقيقة** ⏱️  
**الصعوبة: سهلة جداً** ✅
