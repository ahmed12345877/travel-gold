# Firebase Hosting - دليل سريع

## 3 خطوات فقط للبدء

### 1. تثبيت Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. استنساخ المستودع والبناء
```bash
git clone https://github.com/ahmed12345877/travel-gold.git
cd travel-gold
pnpm install
pnpm build
```

### 3. النشر
**الخيار أ - النشر المباشر:**
```bash
firebase deploy
```

**الخيار ب - النشر التلقائي عبر GitHub (موصى به):**
1. أضف `FIREBASE_SERVICE_ACCOUNT_VANIR_F4260` إلى GitHub Secrets
2. ادفع إلى GitHub - سيتم النشر تلقائياً

---

## الموقع النهائي
🌐 **https://vanir-f4260.web.app**

---

## معلومات المشروع
- **Project ID**: vanir-f4260
- **Build Output**: `out/` directory
- **Node Version**: 20+
- **Package Manager**: pnpm

---

## التحقق من النشر
```bash
firebase hosting:sites:list
```

---

**للمزيد من التفاصيل:** اقرأ `FIREBASE_DEPLOY_STEPS.md`
