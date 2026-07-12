# دليل النشر على cPanel - الخطوات الكاملة

## المتطلبات
- ✓ cPanel مع دعم Node.js
- ✓ Project على GitHub
- ✓ اسم المجال: vanirgroup.com

## الخطوات الأساسية

### 1. إنشاء تطبيق Node.js على cPanel

#### الطريقة الأولى: من واجهة cPanel (الأسهل)

```
1. اذهب إلى: cPanel → Node.js Manager
2. اضغط: CREATE APPLICATION
3. املأ البيانات:
   - Node.js Version: 20.x
   - Application name: travel-gold
   - Domain: vanirgroup.com أو www.vanirgroup.com
   - Application Startup File: server.js
   - Application Root: public_html/travel-gold
4. اضغط: CREATE
```

### 2. استنساخ المستودع

بعد إنشاء التطبيق:

```bash
cd ~/public_html
git clone https://github.com/ahmed12345877/travel-gold.git
cd travel-gold
```

### 3. تثبيت الاعتماديات

```bash
npm install
# أو
pnpm install
```

### 4. بناء المشروع

```bash
npm run build
# أو
pnpm build
```

### 5. إعادة تشغيل التطبيق

- من cPanel: Node.js Manager → اختر التطبيق → Restart
- أو: `pm2 restart travel-gold`

### 6. التحقق

```
https://vanirgroup.com
```

---

## الخطوات المتقدمة (اختياري)

### إعداد SSL Certificate

```
cPanel → AutoSSL
أو
cPanel → Let's Encrypt AutoSSL
```

### إعداد CDN/Cache

```
cPanel → CloudFlare
```

### نسخ احتياطي تلقائي

```
cPanel → Backup Wizard
```

---

## الملفات المهمة

```
travel-gold/
├── package.json          ← تعريف المشروع
├── next.config.mjs       ← إعدادات Next.js
├── server.js             ← ملف البدء (اختياري)
├── out/                  ← الملفات المبنية (إذا استخدمت export)
└── .env.local            ← متغيرات البيئة (محلي فقط)
```

---

## استكشاف الأخطاء

### الخطأ: "Cannot find module"
```bash
# الحل
rm -rf node_modules package-lock.json
npm install
```

### الخطأ: Port 3000 مستخدم
```bash
# cPanel يدير البورت تلقائياً
# لا تقلق - التطبيق سيعمل على بورت عشوائي
```

### الخطأ: Permission denied
```bash
chmod -R 755 ~/public_html/travel-gold
chmod -R 755 ~/public_html/travel-gold/node_modules
```

### الخطأ: Out of memory
```bash
# زيادة الذاكرة في cPanel
# أو تواصل مع support الاستضافة
```

---

## الفروقات بين Firebase و cPanel

| الميزة | Firebase | cPanel |
|--------|----------|--------|
| التكلفة | مجاني (بحدود) | مدفوع شهري |
| الأداء | سريع جداً | جيد |
| الصيانة | تلقائية | يدوية |
| SSL | مجاني | مجاني (Let's Encrypt) |
| قاعدة بيانات | مدمجة | متاح |

---

## التحديثات المستقبلية

عند إضافة تحديثات جديدة:

```bash
cd ~/public_html/travel-gold
git pull origin main
npm install
npm run build
# ثم Restart من cPanel
```

---

## الدعم

- cPanel Support: https://cpanel.com
- Documentation: https://docs.cpanel.com
