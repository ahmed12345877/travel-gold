# خطوات رفع المشروع على cPanel بسهولة

## الطريقة الأسرع (Git Clone)

### خطوة 1: افتح SSH Terminal
في cPanel:
1. اذهب إلى **Terminal**
2. أو استخدم: `ssh username@premium145.web-hosting.com`

### خطوة 2: نسخ هذه الأوامر والصقها
```bash
cd ~/public_html
git clone https://github.com/ahmed12345877/travel-gold.git .
pnpm install
pnpm build
npm start
```

**انتظر 2-3 دقائق حتى ينتهي البناء**

### خطوة 3: تحقق من التطبيق
```
http://your-domain.com
```

---

## الطريقة عبر cPanel UI (نقرة واحدة تقريباً)

### خطوة 1: اذهب إلى Node.js
```
cPanel → Tools → Node.js
```

### خطوة 2: اضغط CREATE APPLICATION
- **Application Startup File:** `server.js`
- **Application Root:** `/home/username/public_html`

### خطوة 3: انسخ المشروع
اختر أحد:
- **Git Clone:**
  ```bash
  git clone https://github.com/ahmed12345877/travel-gold.git .
  ```
- **FTP Upload:**
  رفع الملفات من جهازك مباشرة

### خطوة 4: اضغط Restart
في Node.js Manager اضغط **Restart Application**

---

## الملفات المطلوبة للرفع

```
✓ app/                 # الصفحات
✓ components/          # المكونات  
✓ public/             # الصور والملفات
✓ package.json        # الاعتماديات
✓ next.config.mjs     # الإعدادات
✓ server.js          # ملف البدء
✓ tsconfig.json      # TypeScript
✓ .env.local (إذا وجد) # البيئة المحلية
```

## بعد الرفع

### 1. تحقق من الحالة
```bash
npm start
# أو عبر cPanel:
Restart Application
```

### 2. افتح الموقع
```
https://your-domain.com
```

### 3. إذا حدث خطأ
```bash
# اعرض السجلات
tail -50 build.log
# أو في cPanel:
View Error Log
```

---

## مراجعة سريعة

| الخطوة | الأمر |
|-------|-------|
| 1 | `cd ~/public_html` |
| 2 | `git clone https://github.com/ahmed12345877/travel-gold.git .` |
| 3 | `pnpm install` |
| 4 | `pnpm build` |
| 5 | `npm start` أو Restart في cPanel |
| 6 | افتح `https://your-domain.com` |

---

**المشروع سيكون مباشر على:** `https://vanirgroup.com`

استغرق الوقت: **3-5 دقائق**
