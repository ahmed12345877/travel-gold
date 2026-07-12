# نشر مشروع Vite + React + Express على cPanel - دليل شامل

## البنية الكاملة للمشروع:
```
travel-gold/
├── client/          # Frontend - Vite + React
├── server/          # Backend - Express.js
├── shared/          # الملفات المشتركة
└── package.json     # ملف جذري
```

## الخطوات الكاملة للنشر على cPanel:

### 1. تسجيل الدخول إلى cPanel

اذهب إلى: `https://premium145.web-hosting.com:2083`
- Username: حسابك
- Password: كلمة المرور

### 2. إنشاء Node.js Application

#### الطريقة الأولى: عبر Node.js Manager في cPanel

1. في cPanel، اذهب إلى: **Node.js Manager** أو **Node.js Selector**
2. اضغط **Create Application**
3. ملأ البيانات:
   - **Node.js version:** 20.x أو أحدث
   - **Application URL:** اترك كما هو أو اختر subdomain
   - **Application startup file:** `start.js` أو `server/index.js`
   - **Application root:** `/home/username/public_html/travel-gold`
4. اضغط **Create**

### 3. استنساخ المشروع

عبر SSH في cPanel Terminal:

```bash
# تسجيل الدخول
ssh username@premium145.web-hosting.com

# الانتقال إلى public_html
cd ~/public_html

# استنساخ المشروع
git clone https://github.com/ahmed12345877/travel-gold.git .

# أو إذا كان المستودع خاص:
git clone https://github.com/ahmed12345877/travel-gold.git travel-gold
cd travel-gold
```

### 4. تثبيت المتعلقات

```bash
# تثبيت dependencies للمشروع الرئيسي
npm install

# تثبيت dependencies للـ client
npm install --prefix client

# تثبيت dependencies للـ server
npm install --prefix server
```

### 5. بناء المشروع

```bash
# بناء Vite frontend
npm run build --prefix client

# النتيجة ستكون في: client/dist/
```

### 6. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```bash
# Backend config
PORT=3000
NODE_ENV=production
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key

# Frontend config
VITE_API_URL=https://vanirgroup.com/api
```

أو في root للـ server:

```bash
# server/.env
PORT=3000
NODE_ENV=production
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

### 7. إنشاء ملف البدء (start.js)

في جذر المشروع، أنشئ ملف `start.js`:

```javascript
// start.js
const path = require('path');
const express = require('express');

// Import server setup من Express app
const app = require('./server/index.js');

// Serve static files من Vite build
const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

// Fallback إلى index.html للـ SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**أو إذا كان لديك `server/index.js` منفصل:**

```bash
# في cPanel Node.js Manager، اجعل Application startup file:
server/index.js
```

### 8. بدء التطبيق

عبر cPanel Node.js Manager:
- اضغط على **Manage App** بجانب التطبيق
- اضغط **Start/Restart Application**

أو عبر SSH:

```bash
cd ~/public_html/travel-gold
npm start
```

### 9. إعداد DNS والدومين

في cPanel:
1. اذهب إلى: **Domains** أو **Addon Domains**
2. أضف دومينك `vanirgroup.com`
3. اربطه بـ application root: `/public_html/travel-gold`

### 10. التحقق من النشر

زر الموقع في المتصفح:
- `https://vanirgroup.com` (Frontend)
- `https://vanirgroup.com/api/health` (Backend health check)

## هيكل الملفات بعد النشر:

```
~/public_html/
├── travel-gold/
│   ├── client/
│   │   ├── src/
│   │   ├── dist/          ← بناء Frontend
│   │   └── package.json
│   ├── server/
│   │   ├── routers/
│   │   ├── models/
│   │   ├── index.js       ← نقطة الدخول
│   │   └── package.json
│   ├── start.js           ← ملف البدء
│   ├── package.json
│   └── .env               ← متغيرات البيئة
```

## حل المشاكل الشائعة:

### المشكلة: "Cannot find module"
**الحل:**
```bash
npm install
npm install --prefix client
npm install --prefix server
```

### المشكلة: "Port already in use"
**الحل:**
```bash
# غيّر PORT في .env
PORT=8080

# أو في Node.js Manager، عدّل الـ port
```

### المشكلة: Frontend لا يحمل الـ API
**الحل:**
- تأكد من `VITE_API_URL` في `.env`
- تأكد من CORS في `server/index.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://vanirgroup.com',
  credentials: true
}));
```

### المشكلة: Static files لا تحمل
**الحل:**
```javascript
// في start.js أو server/index.js
app.use(express.static(path.join(__dirname, 'client', 'dist')));
```

## نصائح مهمة:

1. **استخدم PM2 لـ process management:**
```bash
npm install -g pm2
pm2 start start.js --name "travel-gold"
pm2 save
pm2 startup
```

2. **استخدم nginx كـ reverse proxy** (إذا أردت)

3. **فعّل HTTPS** من cPanel SSL Manager

4. **راقب الـ logs:**
```bash
tail -f ~/travel-gold/logs/error.log
```

## الخلاصة:

- cPanel يدعم Node.js بالكامل
- يمكنك نشر Frontend و Backend معاً
- الأداء جيد للمشاريع المتوسطة
- سهل جداً الإدارة والتحديث

**هل واجهت أي مشاكل أثناء النشر؟**
