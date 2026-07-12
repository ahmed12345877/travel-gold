# أوامر SSH لرفع المشروع على cPanel

## التسجيل الدخول

```bash
ssh username@premium145.web-hosting.com
```

## الأوامر الأساسية

### 1. الانتقال إلى مجلد المشروع
```bash
cd ~/public_html
```

### 2. استنساخ المشروع من GitHub
```bash
git clone https://github.com/ahmed12345877/travel-gold.git .
```

### 3. تثبيت الاعتماديات
```bash
pnpm install
# أو
npm install
```

### 4. بناء المشروع
```bash
pnpm build
```

### 5. بدء التطبيق
```bash
npm start
# أو للإنتاج:
npm run prod
```

## أوامر مفيدة أخرى

### عرض نسخة Node.js
```bash
node --version
npm --version
pnpm --version
```

### حذف المكتبات والملفات المؤقتة
```bash
rm -rf node_modules .next out
pnpm install
pnpm build
```

### عرض السجلات
```bash
tail -100 /home/username/.pm2/logs/app-error.log
tail -100 /home/username/.pm2/logs/app-out.log
```

### أوامر PM2 (إذا كانت مثبتة)
```bash
pm2 start server.js --name "travel-gold"
pm2 status
pm2 logs
pm2 restart travel-gold
pm2 stop travel-gold
```

### تحديث المشروع من GitHub
```bash
cd ~/public_html
git pull origin main
pnpm install
pnpm build
```

## ملفات المشروع

```
~/public_html/
├── app/                 # صفحات Next.js
├── components/          # مكونات React
├── public/             # الملفات العامة
├── node_modules/       # الاعتماديات
├── .next/              # ملفات البناء
├── .github/            # GitHub Actions
├── package.json        # الاعتماديات
├── next.config.mjs     # إعدادات Next.js
├── server.js          # ملف بدء التطبيق
└── tsconfig.json      # إعدادات TypeScript
```

## استكشاف الأخطاء

### تحقق من نسخة Node.js
```bash
node --version
# يجب أن تكون 18.x أو أعلى
```

### حل مشكلة: pnpm غير مثبت
```bash
npm install -g pnpm
pnpm --version
```

### حل مشكلة: المنفذ مشغول
```bash
# ابحث عن العملية على المنفذ 3000
lsof -i :3000
# أوقفها إذا لزم الأمر
kill -9 <PID>
```

### عرض معلومات النظام
```bash
uname -a
df -h
ps aux
```

---

**نصيحة:** احفظ هذه الأوامر في ملف نصي للرجوع إليها لاحقاً.
