# دليل ربط الدومين مع Firebase Hosting

## معلومات المشروع
- **المشروع:** Travel Gold (VANIR)
- **Firebase Project:** vanir-f4260
- **الدومين:** vanirgroup.com
- **الموقع الحالي:** https://vanir-f4260.web.app

---

## الخطوة 1: إضافة الدومين في Firebase Console

### المسار:
1. اذهب إلى Firebase Console: https://console.firebase.google.com
2. اختر المشروع: **vanir-f4260**
3. من القائمة الجانبية: **Hosting** → **Sites**
4. اضغط زر **Add custom domain**

### الإدخال:
- أدخل الدومين: `vanirgroup.com`
- اضغط **Continue**

---

## الخطوة 2: التحقق من الملكية

Firebase سيعطيك **TXT Record** للتحقق من ملكية الدومين:

```
Name: _firebase
Type: TXT
Value: [قيمة التحقق - ستظهر في Firebase]
TTL: 3600
```

**أضف هذا السجل في إعدادات DNS لدومينك**

---

## الخطوة 3: إعدادات DNS النهائية

### أين تضيف إعدادات DNS؟
- إذا اشتريت من **GoDaddy**: https://www.godaddy.com/
- إذا اشتريت من **Namecheap**: https://www.namecheap.com/
- إذا اشتريت من **Google Domains**: https://domains.google.com/
- إذا اشتريت من **Cloudflare**: https://www.cloudflare.com/

### السجلات المطلوبة:

#### 1. TXT Record (للتحقق - مؤقت):
```
Host: _firebase
Type: TXT
Value: [من Firebase]
```

#### 2. A Records (4 سجلات):
```
Host: @ (أو vanirgroup.com)
Type: A
Value: 199.36.158.100

---

Host: @ (أو vanirgroup.com)
Type: A
Value: 199.36.158.101

---

Host: @ (أو vanirgroup.com)
Type: A
Value: 199.36.158.102

---

Host: @ (أو vanirgroup.com)
Type: A
Value: 199.36.158.103
```

#### 3. AAAA Record (IPv6):
```
Host: @ (أو vanirgroup.com)
Type: AAAA
Value: 2607:f8b0:4085:809::200e
```

#### 4. CNAME للـ www:
```
Host: www
Type: CNAME
Value: vanirgroup.com
```

---

## الخطوة 4: انتظر التحقق

- **التحقق من TXT:** 5-10 دقائق
- **الانتشار الكامل:** 24-48 ساعة
- Firebase سيخبرك عندما يكون كل شيء جاهز

---

## الخطوة 5: التحقق في Firebase

1. عُد إلى Firebase Console
2. في قسم **Hosting** → **Sites**
3. ستجد حالة الدومين
4. عندما تكتمل: ✅ **Active**

---

## بعد الانتهاء

- **الموقع الجديد:** https://vanirgroup.com
- **مع www:** https://www.vanirgroup.com
- **الموقع القديم:** https://vanir-f4260.web.app (سيبقى يعمل)

---

## استكشاف الأخطاء

### المشكلة: "DNS لم يتحدث بعد"
- الحل: انتظر 24-48 ساعة وتحقق من صحة السجلات

### المشكلة: "خطأ في التحقق من الملكية"
- تأكد من: TXT Record صحيح تماماً
- تحقق من: TTL (يجب أن يكون منخفضاً أثناء الإعداد)

### المشكلة: "الموقع لا يفتح"
- تحقق من: جميع A Records مدخلة صحيحة
- تأكد من: CNAME صحيح للـ www

---

## معلومات مفيدة

### فحص سجلات DNS:
```bash
# Windows / Mac / Linux
nslookup vanirgroup.com
```

### أدوات أخرى للفحص:
- Google Admin Toolbox: https://toolbox.googleapps.com/apps/checkmx/
- MXToolbox: https://mxtoolbox.com/

---

## الدعم

إذا واجهت مشاكل:
- Firebase Support: https://firebase.google.com/support
- Documentation: https://firebase.google.com/docs/hosting/custom-domain
