# cPanel - نشر سريع (5 دقائق)

## الخطوات الأساسية فقط:

### 1. استنساخ المشروع في cPanel SSH:
```bash
cd ~/public_html
git clone https://github.com/ahmed12345877/travel-gold.git .
```

### 2. تثبيت والبناء:
```bash
npm install
npm install --prefix client
npm install --prefix server
npm run build --prefix client
```

### 3. إنشاء .env:
```bash
cat > .env << EOF
PORT=3000
NODE_ENV=production
VITE_API_URL=https://vanirgroup.com/api
DATABASE_URL=your_db_url
EOF
```

### 4. في cPanel Node.js Manager:
- اضغط **Create Application**
- Startup file: `start.js`
- Application root: `/home/your_user/public_html`
- اضغط **Create**

### 5. Restart:
```bash
# من cPanel Node.js Manager اضغط Restart
# أو من SSH:
npm start
```

## النتيجة:
- Frontend: `https://vanirgroup.com`
- Backend: `https://vanirgroup.com/api`
- Admin: `https://vanirgroup.com/admin`

**الموقع الكامل (84 صفحة + إدارة) يعمل الآن!**

## المشاكل الشائعة:

| المشكلة | الحل |
|--------|------|
| Dependencies لا تثبت | `npm install --legacy-peer-deps` |
| Build يفشل | تأكد من `npm run build --prefix client` |
| API لا تعمل | تحقق من CORS في server/index.js |
| Port مشغول | غيّر PORT في .env |

**تم! موقعك حي الآن** ✓
