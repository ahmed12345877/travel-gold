# دليل استخدام Hero Section المصري العصري

## نظرة عامة

تم إنشاء نسختين احترافيتين من Hero Section تجمع بين:
- ✨ الطابع المصري القديم (الأهرامات، الحرافيش، الفراعنة)
- 🎬 التأثيرات الحديثة (SVG Masking, GSAP Animations)
- 🎨 تصميم عصري متقدم مع Particles و Smooth Transitions

---

## النسخة الأولى: HeroSectionEgyptian

### الميزات
✅ SVG Mask على شكل هرم مصري مع نقوش فرعونية
✅ GSAP Animation للنصوص (حرف تلو الآخر)
✅ Particle System بألوان ذهبية
✅ Ornaments عائمة (⟐ - رموز مصرية)
✅ Video/Image Background مع Blur
✅ Button مع Shimmer Effect

### الاستخدام

```tsx
import HeroSectionEgyptian from "@/components/HeroSectionEgyptian";

export default function Home() {
  return (
    <HeroSectionEgyptian
      title="استكشف مصر الخالدة"
      subtitle="رحلة عبر الزمن بين الحضارة العريقة والعصرية المتحركة"
      ctaText="ابدأ الآن"
      ctaLink="/destinations"
      imageSrc="https://images.unsplash.com/..." // Optional
      videoSrc="https://example.com/video.mp4"    // Optional
    />
  );
}
```

### Props

| Prop | Type | Default | الوصف |
|------|------|---------|-------|
| `title` | string | "استكشف مصر الخالدة" | العنوان الرئيسي |
| `subtitle` | string | "رحلة عبر الزمن..." | النص الفرعي |
| `ctaText` | string | "ابدأ الآن" | نص الزر |
| `ctaLink` | string | "/destinations" | رابط الزر |
| `imageSrc` | string | Unsplash image | صورة خلفية (إذا لم يكن هناك فيديو) |
| `videoSrc` | string | undefined | فيديو خلفية |

---

## النسخة الثانية: HeroSectionEgyptianAdvanced

### الميزات الإضافية
✨ Integrated Search Card
✨ More complex SVG patterns (Eye of Horus)
✨ Scarab beetles animations
✨ Location, Date, Guests inputs
✨ Search functionality built-in

### الاستخدام

```tsx
import HeroSectionEgyptianAdvanced from "@/components/HeroSectionEgyptianAdvanced";

export default function Home() {
  return (
    <HeroSectionEgyptianAdvanced
      title="استكشف مصر الخالدة"
      subtitle="رحلة عبر الزمن بين الحضارة العريقة والعصرية المتحركة"
    />
  );
}
```

### الميزات الخاصة
- البحث عن الوجهات
- اختيار التاريخ
- عدد الأشخاص
- Integration مع `/destinations?search=...`

---

## كيفية التخصيص

### تغيير الألوان

**في أي من النسختين، يمكنك تعديل الألوان من خلال:**

```tsx
// تعديل لون الأهرام
<polygon points="50,0 0,35 100,35" fill="black" opacity="0.85" />

// تعديل لون الجزيئات
style={{
  background: `radial-gradient(circle, rgba(212, 168, 83, ${p.opacity}) ...)`
}}

// تعديل لون الـ Glow
background: 'radial-gradient(circle, rgba(212, 168, 83, 0.3) ...)'
```

### تغيير الخلفية

```tsx
// استخدام صورة ثابتة
<HeroSectionEgyptian
  imageSrc="https://your-image-url.com/image.jpg"
/>

// استخدام فيديو
<HeroSectionEgyptian
  videoSrc="https://your-video-url.com/video.mp4"
/>
```

### تغيير سرعة الـ Animations

```tsx
// في GSAP animations - زيادة/تقليل duration
gsap.fromTo(
  titleRef.current,
  {...},
  {...duration: 1.2, ...} // غيّر هذا الرقم
);
```

---

## التأثيرات والفيزياء

### 1. SVG Masking
- يستخدم `maskImage` و `WebkitMaskImage` للتوافق
- SVG يحتوي على:
  - أهرام
  - نقوش فرعونية
  - عيون حورس
  - حزوز أفقية

### 2. GSAP Animations
- Text stagger: كل حرف يظهر على حدة
- Particle floating: جزيئات ذهبية عائمة
- Smooth transitions: انتقالات سلسة

### 3. Framer Motion
- Scroll indicators مع bounce
- CTA button interactions

---

## الأداء

### Optimization Tips
1. **Video Compression**: ضغط الفيديو قبل الرفع
2. **Image Optimization**: استخدام modern formats (WebP)
3. **GSAP Registration**: تم استخدام GSAP بدون plugins ثقيلة
4. **Particle Count**: 20 جزيء (قابل للتعديل)

### Browser Support
✅ Chrome/Chromium
✅ Firefox
✅ Safari (مع WebkitMaskImage fallback)
✅ Edge

---

## الدمج مع الصفحات الأخرى

### كمثال - في Home.tsx:

```tsx
import HeroSectionEgyptian from "@/components/HeroSectionEgyptian";
import AboutSection from "@/components/AboutSection";
import DestinationsSection from "@/components/DestinationsSection";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSectionEgyptian {...props} />
      <AboutSection />
      <DestinationsSection />
      {/* sections أخرى... */}
      <Footer />
    </div>
  );
}
```

---

## استكشاف الأخطاء

### المشكلة: الخلفية لا تظهر
**الحل**: تأكد من أن الـ video/image URL صحيحة

```tsx
// صحيح
<HeroSectionEgyptian imageSrc="https://domain.com/image.jpg" />

// خطأ
<HeroSectionEgyptian imageSrc="./image.jpg" />
```

### المشكلة: الـ SVG Mask لا يظهر صحيح
**الحل**: تأكد من وجود `<svg id="hero-mask">` في DOM

```tsx
// تحقق من Browser DevTools
// F12 → Elements → ابحث عن <svg>
```

### المشكلة: الـ Animations بطيئة
**الحل**: تقليل عدد الجزيئات أو تعطيل بعض الـ animations

```tsx
// في EgyptianParticles - قلل particlesCount
const particlesCount = 10; // بدلاً من 20
```

---

## أمثلة متقدمة

### مثال 1: Hero مع صورة كاملة

```tsx
<HeroSectionEgyptian
  title="تجربة فريدة"
  subtitle="استكشف الحضارة المصرية"
  imageSrc="https://images.unsplash.com/photo-1565008576549-bdde41d9b9a7"
  ctaText="اكتشف المزيد"
  ctaLink="/gallery"
/>
```

### مثال 2: Hero مع بحث متقدم

```tsx
<HeroSectionEgyptianAdvanced
  title="مرحباً بك"
  subtitle="ابحث عن وجهتك المفضلة"
/>
```

---

## الملفات المتعلقة

```
client/src/components/
  ├── HeroSectionEgyptian.tsx (427 lines)
  ├── HeroSectionEgyptianAdvanced.tsx (435 lines)
  └── (يمكن استبدال HeroSection.tsx بأحدها)

client/src/pages/
  └── Home.tsx (محدث لاستخدام Hero الجديد)
```

---

## المكتبات المستخدمة

```json
{
  "gsap": "^3.x.x",           // Animations
  "framer-motion": "^12.x.x", // Interactive effects
  "lucide-react": "latest",   // Icons
  "wouter": "latest"          // Routing
}
```

---

## نصائح للتصميم

### ألوان موصى بها
- **ذهبي (Primary)**: `#D4A853`
- **ذهبي فاتح**: `#F5E6B8`
- **أسود عميق**: `#0d1117`
- **رمادي داكن**: `#1a1f35`

### Fonts
- **العناوين**: Georgia, serif (لتأثير فرعوني)
- **الأساسي**: -apple-system, BlinkMacSystemFont

### Border Radius
- Buttons: `rounded-lg` (12px)
- Cards: `rounded-2xl` (16px)
- Minor: `rounded-full` (50%)

---

## الخطوات التالية

1. ✅ تثبيت GSAP
2. ✅ إضافة HeroSection الجديدة
3. ✅ تحديث Home.tsx
4. ✅ تخصيص الألوان والنصوص
5. ⏭️ تجربة في المتصفح
6. ⏭️ تحسين الأداء

---

## التوصية النهائية

**استخدم `HeroSectionEgyptian`** للمزيد من البساطة والأداء العالي.

**استخدم `HeroSectionEgyptianAdvanced`** إذا أردت دمج البحث مباشرة في الـ Hero.
