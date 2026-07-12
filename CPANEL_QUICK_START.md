# كيفية النشر على cPanel - خطوات سريعة

## 3 خطوات فقط:

### 1️⃣ إنشاء تطبيق Node.js في cPanel
```
cPanel → Node.js Manager → CREATE APPLICATION
- Node Version: 20.x
- App Name: travel-gold
- Domain: vanirgroup.com
- Startup File: server.js
- Root: public_html/travel-gold
```

### 2️⃣ استنساخ واستعداد المشروع
```bash
cd ~/public_html
git clone https://github.com/ahmed12345877/travel-gold.git
cd travel-gold
npm install
npm run build
```

### 3️⃣ إعادة تشغيل
```
cPanel → Node.js Manager → اختر travel-gold → Restart
```

---

## التحقق من التشغيل
```
https://vanirgroup.com
```

---

## أوامر مفيدة

```bash
# بناء المشروع
npm run build

# تشغيل محلي (للاختبار)
npm run dev

# إنتاجي على cPanel
npm run prod

# مشاهدة السجلات
tail -f logs/app.log
```

---

## إذا حدثت مشاكل

| المشكلة | الحل |
|--------|------|
| Error Module Not Found | `npm install` |
| Port مستخدم | cPanel يدير البورت تلقائياً |
| Permission Denied | `chmod -R 755 ~/public_html/travel-gold` |
| بطء التطبيق | تواصل مع support cPanel |

---

## بديل: Firebase (إذا عملت DNS)
- استخدم Firebase للأداء الأفضل
- cPanel للحفظ على السيرفر الحالي
