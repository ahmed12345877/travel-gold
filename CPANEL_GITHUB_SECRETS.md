# إعداد GitHub Secrets لنشر cPanel التلقائي

## الخطوة 1: الحصول على بيانات cPanel

### من cPanel:
1. اذهب إلى: `cPanel → FTP Accounts`
2. ستجد:
   - **FTP Host**: عادة يكون hostname مثل `premium145.web-hosting.com`
   - **FTP Username**: اسم المستخدم
   - **FTP Password**: كلمة المرور

### للـ SSH (اختياري):
1. اذهب إلى: `cPanel → SSH Keys`
2. أو اسأل support الاستضافة عن:
   - **SSH Host**: نفس FTP Host عادة
   - **SSH Username**: نفس FTP Username
   - **SSH Password**: نفس كلمة المرور أو SSH key

---

## الخطوة 2: إضافة Secrets إلى GitHub

1. اذهب إلى: `https://github.com/ahmed12345877/travel-gold/settings/secrets/actions`

2. أضف الـ Secrets التالية:

### Secret 1: FTP Host
```
Name: CPANEL_FTP_HOST
Value: premium145.web-hosting.com
```

### Secret 2: FTP User
```
Name: CPANEL_FTP_USER
Value: [اسم المستخدم من cPanel]
```

### Secret 3: FTP Password
```
Name: CPANEL_FTP_PASSWORD
Value: [كلمة المرور من cPanel]
```

### Secret 4: SSH Host (اختياري لإعادة التشغيل التلقائي)
```
Name: CPANEL_SSH_HOST
Value: premium145.web-hosting.com
```

### Secret 5: SSH User (اختياري)
```
Name: CPANEL_SSH_USER
Value: [اسم المستخدم]
```

### Secret 6: SSH Password (اختياري)
```
Name: CPANEL_SSH_PASSWORD
Value: [كلمة المرور]
```

---

## الخطوة 3: التحقق

1. ادفع تغييراً إلى GitHub:
```bash
git push origin main
```

2. اذهب إلى: `GitHub → Actions`

3. ستشاهد workflow يعمل بنفس الاسم: **Deploy to cPanel**

4. انتظر حتى ينتهي (يستغرق 2-3 دقائق)

5. تحقق من: `https://vanirgroup.com`

---

## استكشاف الأخطاء

### الخطأ: "Authentication failed"
- **السبب**: بيانات FTP خاطئة
- **الحل**: تحقق من اسم المستخدم وكلمة المرور في cPanel

### الخطأ: "Connection refused"
- **السبب**: FTP Host خاطئ
- **الحل**: استخدم Hostname من cPanel (مثل premium145.web-hosting.com)

### الخطأ: "Permission denied"
- **السبب**: الملفات لم تُنقل بشكل صحيح
- **الحل**: تحقق من أن المجلد `public_html/travel-gold` موجود وله صلاحيات صحيحة

### الخطأ: "Module not found"
- **السبب**: npm install لم يعمل
- **الحل**: قم يدوياً بـ `npm install` عبر SSH أو cPanel Terminal

---

## الحل البديل: النشر اليدوي (بدون Automation)

إذا لم تريد استخدام Automation:

```bash
# 1. انسخ المشروع عبر cPanel File Manager أو FTP
# 2. في cPanel Terminal:
cd ~/public_html/travel-gold
git pull origin main
npm install
npm run build
# 3. أعد تشغيل التطبيق من Node.js Manager
```

---

## أسئلة شائعة

### س: هل بياناتي آمنة؟
ج: نعم، GitHub Secrets مشفرة ولا تظهر في الـ logs.

### س: هل النشر يحدث تلقائياً؟
ج: نعم، عند كل push إلى main أو develop.

### س: كم مرة يمكنني نشر في اليوم؟
ج: بدون حد - GitHub Actions مجاني للمشاريع العامة.

### س: ماذا لو فشل النشر؟
ج: ستتلقى إشعار من GitHub ويمكنك مراجعة السجلات في Actions tab.
