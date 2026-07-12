# دليل رفع المشروع على cPanel

## المتطلبات
- cPanel مع دعم Node.js
- وصول SSH أو FTP
- Git مثبت (اختياري)

## الطريقة 1: استخدام Git Clone (الأسهل والأسرع)

### خطوة 1: تسجيل الدخول عبر SSH
```bash
# من جهازك أو من File Manager في cPanel
ssh username@your-domain.com
```

### خطوة 2: انتقل إلى مجلد public_html
```bash
cd ~/public_html
```

### خطوة 3: استنسخ المشروع
```bash
git clone https://github.com/ahmed12345877/travel-gold.git .
```

### خطوة 4: تثبيت الاعتماديات
```bash
pnpm install
# أو إذا كان npm:
npm install
```

### خطوة 5: بناء المشروع
```bash
pnpm build
# أو:
npm run build
```

## الطريقة 2: استخدام cPanel Node.js Manager (موصى به)

### خطوة 1: اذهب إلى cPanel
1. اذهب إلى: `premium145.web-hosting.com:2083/cpsess.../` 
2. اختر **Tools** → **Node.js**

### خطوة 2: أنشئ تطبيق جديد
1. اضغط **CREATE APPLICATION**
2. اختر إعدادات:
   - **Application mode:** Production
   - **Node.js version:** 20.x أو 22.x
   - **Application URL:** اتركها كما هي أو غيرها
   - **Application Startup File:** `server.js`
   - **Application Root:** `/home/username/public_html`

### خطوة 3: بيانات الاتصال
cPanel سيعطيك:
- **Application Status:** Active/Inactive
- **Port:** رقم المنفذ
- **Environment Variables:** لتعيين متغيرات البيئة

### خطوة 4: رفع الملفات

**عبر FTP:**
```
Host: premium145.web-hosting.com
Username: cpaneluser
Password: كلمة مرور cPanel
Port: 21
```

**عبر SSH:**
```bash
scp -r ./travel-gold/* username@domain.com:~/public_html/
```

### خطوة 5: تثبيت والبناء
في cPanel Node.js Manager:
1. اضغط على التطبيق
2. اضغط **Run npm install**
3. اضغط **Run Script** واختر `npm run build`

### خطوة 6: تشغيل التطبيق
في cPanel Node.js Manager:
1. اضغط **Restart Application**
2. التطبيق سينطلق تلقائياً

## الطريقة 3: استخدام GitHub Actions (التلقائي)

### خطوة 1: أضف GitHub Secrets
اذهب إلى: `https://github.com/ahmed12345877/travel-gold/settings/secrets/actions`

أضف:
```
CPANEL_USERNAME=your_cpanel_username
CPANEL_PASSWORD=your_cpanel_password
CPANEL_DOMAIN=your-domain.com
CPANEL_APP_PATH=/home/username/public_html
```

### خطوة 2: الدفع والنشر التلقائي
كل push إلى GitHub سيقوم تلقائياً بـ:
- البناء
- الاختبار
- النشر على cPanel

## التحقق من التطبيق

### 1. تحقق من الحالة في cPanel
```bash
# في cPanel Node.js Manager
- Application Status: Active ✓
- الخادم يعمل على المنفذ المعين
```

### 2. اختبر الموقع
```bash
curl http://your-domain.com:port
```

### 3. تحقق من السجلات
```bash
# في cPanel Node.js Manager
اضغط على التطبيق → View Error Log
```

## المشاكل الشائعة والحلول

### المشكلة: Port Already in Use
```bash
# الحل: غير المنفذ في cPanel Node.js Manager
اختر رقم منفذ مختلف (3000, 8080, 8443)
```

### المشكلة: Module Not Found
```bash
# الحل: أعد تثبيت الاعتماديات
cd ~/public_html
pnpm install
```

### المشكلة: Build Failed
```bash
# الحل: تحقق من السجلات
npm run build 2>&1 | tee build.log
cat build.log
```

## ملفات مهمة

- `server.js` - ملف بدء التطبيق
- `package.json` - الاعتماديات والأوامر
- `.env.local` - متغيرات البيئة (أضفها محلياً فقط)
- `next.config.mjs` - إعدادات Next.js

## متغيرات البيئة المطلوبة

في cPanel Node.js Manager، أضف في Environment Variables:
```
NODE_ENV=production
PORT=3000  # أو رقم المنفذ المعين
```

## الدعم والمساعدة

- **cPanel Documentation:** https://cpanel.net/
- **Node.js on cPanel:** https://docs.cpanel.net/knowledge-base/nodeJs/
- **GitHub Issues:** https://github.com/ahmed12345877/travel-gold/issues

---

**ملاحظة:** التطبيق سينطلق تلقائياً بعد كل إعادة تشغيل لـ cPanel أو الخادم.
