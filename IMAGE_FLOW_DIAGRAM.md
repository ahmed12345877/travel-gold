# مخطط سير عملية الصور

## المسار الكامل من الرفع إلى العرض

```
┌─────────────────────────────────────────────────────────────────────┐
│                    رفع الصورة من Admin Panel                        │
│                        (GalleryAdmin.tsx)                            │
└────────────────────────────────────┬────────────────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │   الملف: Base64 في Memory     │
                    │   الحجم: حتى 10 ميجابايت     │
                    │   (بعد اختيار من المستخدم)   │
                    └────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │        تRPC Call: gallery.uploadImage()             │
        │  (ترسل Base64 Data إلى الخادم)                    │
        │                                                    │
        │  Input: {                                          │
        │    fileData: "base64string...",                   │
        │    filename: "image.jpg",                         │
        │    mimeType: "image/jpeg"                         │
        │  }                                                │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │  Server: gallery Router (uploadImage mutation)     │
        │  ملف: server/routers/gallery.ts                   │
        │                                                    │
        │  1. تحويل Base64 إلى Buffer                       │
        │  2. التحقق من الحجم                              │
        │  3. توليد اسم فريد: gallery/abc123.jpg          │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │   Firebase Storage Function: storagePut()          │
        │   ملف: lib/firebase-storage.ts                    │
        │                                                    │
        │   1. تحويل Buffer وإرساله                        │
        │   2. إعدادات التخزين المؤقت: 1 سنة              │
        │   3. إرجاع الرابط الدائم                        │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │        Firebase Storage Bucket                      │
        │   project-name.appspot.com/gallery/abc123.jpg     │
        │                                                    │
        │   الرابط الدائم:                                 │
        │   https://storage.googleapis.com/project.../...   │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │     حفظ الصورة في Firestore                        │
        │   (مع البيانات الوصفية)                           │
        │                                                    │
        │   Collection: gallery_items                        │
        │   Doc: {                                           │
        │     imageUrl: "https://storage...",              │
        │     title: "...",                                │
        │     titleAr: "...",                              │
        │     category: "luxury",                          │
        │     featured: "yes",                             │
        │     isVisible: "visible",                        │
        │     createdAt: timestamp,                        │
        │     ...                                          │
        │   }                                               │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
    ┌────────────────────────────────────────────────────────────┐
    │         العميل يتلقى الرد بنجاح                           │
    │   Response: { url: "https://storage...", fileKey: "..." }│
    │   Toast: "تم رفع الصورة بنجاح"                          │
    │   formData.imageUrl = "https://storage..."             │
    └────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │       إضافة المزيد من البيانات و الحفظ              │
        │    (العنوان، الوصف، التصنيف، إلخ)                 │
        │                                                    │
        │   tRPC Call: gallery.create()                     │
        │   Input: {                                         │
        │     imageUrl: "https://storage...",              │
        │     title: "...",                                │
        │     category: "luxury",                          │
        │     ...                                          │
        │   }                                               │
        └────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │ Firestore Updated Successfully  │
                    │ Toast: "تم إضافة الصورة بنجاح"│
                    └────────────────┬────────────────┘
                                     │
                                     ▼
             ┌──────────────────────────────────────────────┐
             │      الآن: الصورة جاهزة للعرض!            │
             │    (مخزنة في Firestore مع رابط دائم)     │
             └──────────────────────────────────────────────┘


╔══════════════════════════════════════════════════════════════════════╗
║                   اجعل الصورة مرئية على الموقع                      ║
║                                                                      ║
║ عند دخول المستخدم إلى الصفحة الرئيسية:                             ║
╚══════════════════════════════════════════════════════════════════════╝

                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │       الصفحة الرئيسية Home.tsx تُحمل               │
        │       (تتضمن GallerySection)                      │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │    GallerySection Component يُحمل                  │
        │    ملف: components/GallerySection.tsx             │
        │                                                    │
        │    useEffect → tRPC Call: gallery.listVisible()  │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │     Server: gallery.listVisible() Query            │
        │     ملف: server/routers/gallery.ts                │
        │                                                    │
        │   Database Query:                                  │
        │   db.collection('gallery_items')                  │
        │     .where('isVisible', '==', 'visible')         │
        │     .orderBy('sortOrder', 'asc')                  │
        │     .get()                                        │
        │                                                    │
        │   النتيجة: array من الصور مع روابطها            │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │    العميل يتلقى البيانات                          │
        │                                                    │
        │   [                                                │
        │     {                                              │
        │       _docId: "abc123",                           │
        │       imageUrl: "https://storage...",            │
        │       title: "صورة فخمة",                        │
        │       category: "luxury",                        │
        │       featured: "yes",                           │
        │       ...                                        │
        │     },                                            │
        │     { ... },                                      │
        │     { ... }                                       │
        │   ]                                               │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │    GallerySection يعرض الصور                       │
        │                                                    │
        │    الصور تظهر في:                                │
        │    - شبكة Grid (3 أعمدة)                          │
        │    - مع الفلترة حسب التصنيفات                     │
        │    - مع معاينات عند التمرير                      │
        │    - مع أيقونة "مميزة" إن وجدت                  │
        └────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │   ✅ الصورة تظهر على الموقع!   │
                    │   المستخدم يراها في المعرض     │
                    └─────────────────────────────────┘
```

## نقاط مراقبة مهمة

### 1. عند الرفع (Upload)
**في Console المتصفح:**
```javascript
[GallerySection] Images loaded successfully: X
[Gallery] Created new item: docId=abc123, imageUrl=https://...
[Firebase Storage] Successfully uploaded: gallery/abc123.jpg
```

**في Server Logs:**
```
[Firebase Storage] Successfully uploaded: gallery/xyz789.jpg
[Gallery] Created new item: docId=xyz789, imageUrl=https://storage.googleapis.com/...
```

### 2. عند التحميل (Display)
**في Console:**
```javascript
[GallerySection] Images loaded successfully: 5
[GallerySection] Image URL: {
  title: "صورة 1",
  url: "https://storage.googleapis.com/...",
  category: "luxury"
}
```

### 3. عند الخطأ
**في Console:**
```javascript
[GallerySection] Image failed to load: {
  url: "https://storage.googleapis.com/...",
  title: "صورة 1",
  error: {...}
}
```

## مراحل الفحص

| المرحلة | الفحص | الأداة |
|--------|------|-------|
| الرفع | هل الصورة تُرفع بنجاح؟ | Admin Panel Console |
| التخزين | هل الصورة محفوظة في Firebase؟ | Firebase Console |
| حفظ الرابط | هل الرابط محفوظ في Firestore؟ | Firestore Console |
| الاسترجاع | هل يتم جلب الصور من الخادم؟ | Network Tab (F12) |
| العرض | هل تظهر الصور على الموقع؟ | Home Page + Console |

## الملفات المرتبطة

```
Client Side:
├── components/GallerySection.tsx      ← عرض الصور
├── pages/admin/GalleryAdmin.tsx       ← إدارة الصور
├── pages/admin/DestinationsAdmin.tsx  ← رفع صور الوجهات
└── pages/Home.tsx                     ← تضمين GallerySection

Server Side:
├── server/routers/gallery.ts          ← منطق Firestore
├── server/routers/admin.blog.ts       ← منطق Blog (صور أخرى)
├── server/routers/admin.destinations.ts ← منطق الوجهات
├── server/_core/firebaseAdmin.ts      ← تهيئة Firebase
└── lib/firebase-storage.ts            ← تحميل الملفات

Database:
├── Firestore > gallery_items          ← مجموعة الصور
├── Firestore > gallery_videos         ← مجموعة الفيديوهات
├── Firestore > destinations           ← مجموعة الوجهات
└── Firestore > blogPosts              ← مجموعة المقالات

Storage:
└── Firebase Storage > gallery/        ← الملفات الفعلية
```

---

**ملاحظة:** إذا لم تظهر الصورة بعد الرفع، تحقق من الخطوات أعلاه بالترتيب.
