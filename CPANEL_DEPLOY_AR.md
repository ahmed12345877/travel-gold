# دليل نشر تطبيق Vite + React + Express على cPanel

## المتطلبات:
- cPanel مع دعم Node.js (18+ أو أعلى)
- SSH access
- الدومين vanirgroup.com

## الخطوات السريعة (5 دقائق):

### 1. SSH Login
```bash
ssh username@premium145.web-hosting.com
cd ~/public_html
```

### 2. نسخ المشروع
```bash
git clone https://github.com/ahmed12345678985/travel-gold.git .
```

### 3. تثبيت المتعلقات
```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 4. بناء Frontend
```bash
npm run build --prefix client
```

### 5. في cPanel Node.js Manager

1. اذهب إلى **Node.js Manager**
2. انقر **Create Application**
3. اختر:
   - Node.js: 18 أو أعلى
   - App root: /public_html
   - Startup: server/src/index.js
   - URL: vanirgroup.com
4. اضغط **Create**

## الملفات الرئيسية:
- **client/** - Frontend مع 84 صفحة
- **server/** - Backend Express.js
- **.env** - متغيرات البيئة

## جاهز!
موقعك سيكون حياً على vanirgroup.com
