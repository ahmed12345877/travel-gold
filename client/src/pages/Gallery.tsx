/*
 * Gallery Page - Professional Portfolio Showcase
 * Design: Art Deco Luxe - Black & Gold
 * Features: Masonry grid, category filters, lightbox, hover effects, animations, social sharing
 * Data: Dynamic from DB with static fallback
 */
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Camera,
  ZoomIn,
  Play,
  Video,
  Clock,
  Eye,
  Sparkles,
  Globe,
  Award,
  Heart,
  Share2,
  Download,
  Grid3X3,
  LayoutGrid,
  Maximize2,
  Facebook,
  Instagram,
  Link2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import OptimizedImage from "@/components/OptimizedImage";
import PageMeta from "@/components/PageMeta";

/* ─── Social Links ─── */
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1DvRyfaQRC/",
  instagram: "https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi",
};

/* ─── CDN Base ─── */
const CDN =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8";

/* ─── Gallery Item Interface (unified for DB + static) ─── */
interface GalleryItemDisplay {
  id: number;
  src: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  location: string;
  locationAr: string;
  featured?: boolean;
  aspect: "landscape" | "portrait" | "square";
}

/* ─── Static Fallback Data ─── */
const staticGalleryItems: GalleryItemDisplay[] = [
  {
    id: 1,
    src: "/manus-storage/1ea6c9b2f3fbdac06639a33dc44d9b8f180d000265ecbd5278a892c0a3f64c88_74b6d5bc.avif",
    title: "Egyptian Luxury Experience",
    titleAr: "تجربة الفخامة المصرية",
    description:
      "Discover the elegance and grandeur of Egypt's most luxurious destinations.",
    descriptionAr: "اكتشف أناقة وعظمة أفخم وجهات مصر السياحية.",
    category: "Luxury Travel",
    categoryAr: "السفر الفاخر",
    location: "Egypt",
    locationAr: "مصر",
    featured: true,
    aspect: "landscape",
  },
  {
    id: 2,
    src: "/manus-storage/2a20e5d22b1f9142308a09e9f4cb42317410d08e8879e0bff6ffd3abc5d2505f_1a37c6fc.avif",
    title: "Desert Wonders",
    titleAr: "عجائب الصحراء",
    description:
      "Experience the breathtaking beauty of Egypt's golden deserts.",
    descriptionAr: "استمتع بجمال الصحراء الذهبية الخلاب.",
    category: "Desert Safari",
    categoryAr: "سفاري الصحراء",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 3,
    src: "/manus-storage/4e1cb98ca898778f5ed91703cde6555b77a4eade317b8319000e649c76b31b33_576f4203.avif",
    title: "Ancient Temples",
    titleAr: "المعابد القديمة",
    description: "Explore the mystical temples of ancient Egypt.",
    descriptionAr: "استكشف معابد مصر القديمة الغامضة.",
    category: "Temples & Monuments",
    categoryAr: "المعابد والآثار",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 4,
    src: "/manus-storage/23effebbb46bb1c3053c1c50c5c196c88106b6b3fb5ef857f31d117fc0ff40fa_1ca89850.avif",
    title: "Nile River Journey",
    titleAr: "رحلة النيل",
    description: "Cruise along the legendary Nile River.",
    descriptionAr: "أبحر على طول نهر النيل الأسطوري.",
    category: "River Cruises",
    categoryAr: "رحلات النيل",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 5,
    src: "/manus-storage/16e3e9a8129f6bf15ad6346a1a029be61ede9f61fee6c5ae02095dbb4ba69f53_be86cd87.avif",
    title: "Red Sea Paradise",
    titleAr: "جنة البحر الأحمر",
    description: "Relax in the stunning Red Sea resorts.",
    descriptionAr: "استرخ في منتجعات البحر الأحمر الخيالية.",
    category: "Beach Resorts",
    categoryAr: "منتجعات الشاطئ",
    location: "Red Sea",
    locationAr: "البحر الأحمر",
    aspect: "landscape",
  },
  {
    id: 6,
    src: "/manus-storage/79ab804dad1d1a907e2154b70a7e6815975ec29a5ced1bb8f059b496eff79d92_e17519cf.avif",
    title: "Cultural Heritage",
    titleAr: "التراث الثقافي",
    description: "Immerse yourself in Egypt's rich cultural heritage.",
    descriptionAr: "انغمس في التراث الثقافي الغني لمصر.",
    category: "Culture & History",
    categoryAr: "الثقافة والتاريخ",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 7,
    src: "/manus-storage/334c3d7b0e48e3c65f3f396980e59b5e968fc733a6d44dc508b992d557ccb152_dbd5cd44.avif",
    title: "Luxurious Accommodations",
    titleAr: "الإقامة الفاخرة",
    description: "Stay in world-class luxury hotels and resorts.",
    descriptionAr: "أقم في فنادق ومنتجعات فاخرة من الدرجة الأولى.",
    category: "Luxury Hotels",
    categoryAr: "فنادق فاخرة",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 8,
    src: "/manus-storage/427a029c72e5a784c085660517b1b1e106a13e9de9aaedb405de04f5bb002d43_53077433.avif",
    title: "Gourmet Dining",
    titleAr: "تناول الطعام الفاخر",
    description: "Savor world-class cuisine at our partner restaurants.",
    descriptionAr: "استمتع بأطباق عالمية من الدرجة الأولى.",
    category: "Dining Experience",
    categoryAr: "تجربة الطعام",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 9,
    src: "/manus-storage/5838fb3241475fc3ed3b06bf68fa7d6b9864d42e9a69b98287bc624bbf158a10_fbd3bec1.avif",
    title: "Adventure Activities",
    titleAr: "أنشطة المغامرة",
    description: "Experience thrilling adventure activities.",
    descriptionAr: "جرب أنشطة المغامرة المثيرة.",
    category: "Adventure",
    categoryAr: "المغامرة",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 10,
    src: "/manus-storage/114d5c2734eacb724d334228b20026638cf11d61a5501cfdd4b64b1b570b790b_8393755e.avif",
    title: "Sunset Views",
    titleAr: "إطلالات الغروب",
    description: "Witness stunning sunsets across Egypt.",
    descriptionAr: "شاهد غروب الشمس الخلاب عبر مصر.",
    category: "Photography",
    categoryAr: "التصوير",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 11,
    src: "/manus-storage/39043104353552d2da37ea4e7192557d84e866382cb9cbec7c9784435c0bdfb0_5d6bf99e.avif",
    title: "Spa & Wellness",
    titleAr: "المنتجع الصحي والعافية",
    description: "Rejuvenate at our premium spa facilities.",
    descriptionAr: "تجدد نشاطك في منشآتنا الصحية الممتازة.",
    category: "Wellness",
    categoryAr: "العافية",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 12,
    src: "/manus-storage/42085e9bc1244f37455aef01a3ecd187e2a17e92fec5225b858e78a3526f0f9f_b5bd747a.avif",
    title: "Water Sports",
    titleAr: "الرياضات المائية",
    description: "Enjoy exciting water sports activities.",
    descriptionAr: "استمتع برياضات مائية مثيرة.",
    category: "Water Sports",
    categoryAr: "الرياضات المائية",
    location: "Red Sea",
    locationAr: "البحر الأحمر",
    aspect: "landscape",
  },
  {
    id: 13,
    src: "/manus-storage/0f1a032b90fd47616b5f88d4eb206a6a65088744b3ce1a4ca13f516a4d5e307f_35754279.avif",
    title: "Local Markets",
    titleAr: "الأسواق المحلية",
    description: "Explore vibrant local markets and bazaars.",
    descriptionAr: "استكشف الأسواق والبازارات المحلية النابضة بالحياة.",
    category: "Culture & History",
    categoryAr: "الثقافة والتاريخ",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 14,
    src: "/manus-storage/a06194ca69639b218e5a9675022f61872dd5a0676915ae79fdc82d34aaef4ec5_c888ea47.avif",
    title: "Guided Tours",
    titleAr: "الجولات الموجهة",
    description: "Expert-led tours of Egypt's most iconic sites.",
    descriptionAr: "جولات يقودها خبراء لأشهر مواقع مصر.",
    category: "Tours",
    categoryAr: "الجولات",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 15,
    src: "/manus-storage/a931665964fd7f33fab594af19918fe68b6b580da76e05b41de6c643447dc99a_30b156b3.avif",
    title: "Sunset Cruises",
    titleAr: "رحلات الغروب",
    description: "Romantic sunset cruises on the Nile.",
    descriptionAr: "رحلات غروب رومانسية على النيل.",
    category: "River Cruises",
    categoryAr: "رحلات النيل",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 16,
    src: "/manus-storage/b8fc3158789d8f4e81448b1404ff40237dcc35b2b40db8d867bfac25bbb981ef_9960a96f.avif",
    title: "Photography Tours",
    titleAr: "جولات التصوير",
    description: "Capture Egypt's beauty through professional photography.",
    descriptionAr: "التقط جمال مصر من خلال التصوير الاحترافي.",
    category: "Photography",
    categoryAr: "التصوير",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 17,
    src: "/manus-storage/bb85a7ef13d263dff024bc44a3562189ebf58ed1409dc4e5104e95de901f0057_70085c99.avif",
    title: "Camel Trekking",
    titleAr: "رحلات الجمال",
    description: "Traditional camel trekking through the desert.",
    descriptionAr: "رحلات جمال تقليدية عبر الصحراء.",
    category: "Desert Safari",
    categoryAr: "سفاري الصحراء",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 18,
    src: "/manus-storage/c16784ac39d36174416402849bd6885a0c3b79c240f9e3b00e89182ef6b7e94e_648f43fd.avif",
    title: "Night Tours",
    titleAr: "الجولات الليلية",
    description: "Experience Egypt's attractions under the stars.",
    descriptionAr: "استمتع بمعالم مصر تحت النجوم.",
    category: "Tours",
    categoryAr: "الجولات",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 19,
    src: "/manus-storage/caaad7993f980e71d43390bf0080790caf10bdb7487c6784080b03bfe6c3bca8_3fde7674.avif",
    title: "Scuba Diving",
    titleAr: "الغوص",
    description: "Explore underwater wonders in the Red Sea.",
    descriptionAr: "استكشف العجائب تحت الماء في البحر الأحمر.",
    category: "Water Sports",
    categoryAr: "الرياضات المائية",
    location: "Red Sea",
    locationAr: "البحر الأحمر",
    aspect: "landscape",
  },
  {
    id: 20,
    src: "/manus-storage/cd1ae1f2f560f76988054d7707002c47c545b0491bb24f11d3c929308a1dabde_d2ea925c.avif",
    title: "Family Packages",
    titleAr: "حزم العائلة",
    description: "Perfect vacation packages for families.",
    descriptionAr: "حزم عطلات مثالية للعائلات.",
    category: "Family Travel",
    categoryAr: "السفر العائلي",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 21,
    src: "/manus-storage/cfb71acd3efc73c1a74774927261b72755462b84df21dfb632b814f9f8a854ce_56bb9262.avif",
    title: "Honeymoon Suites",
    titleAr: "أجنحة شهر العسل",
    description: "Romantic honeymoon packages in luxury resorts.",
    descriptionAr: "حزم شهر عسل رومانسية في المنتجعات الفاخرة.",
    category: "Luxury Hotels",
    categoryAr: "فنادق فاخرة",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 22,
    src: "/manus-storage/d466a55d36bfae2cc697d72dae1eb5b80df751017130e7097247c09664b96255_ec0fcf43.avif",
    title: "Stargazing",
    titleAr: "مراقبة النجوم",
    description: "Gaze at the stars in Egypt's clear desert skies.",
    descriptionAr: "تأمل النجوم في سماء الصحراء الصافية.",
    category: "Adventure",
    categoryAr: "المغامرة",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 23,
    src: "/manus-storage/d9225c2581c744a38c23d87e8a4ce4a1deeab84eb909954522ca553ae4571ad4_c8d28a30.avif",
    title: "Sunrise Hikes",
    titleAr: "رحلات الشروق",
    description: "Hike to scenic viewpoints for stunning sunrises.",
    descriptionAr: "اصعد إلى نقاط المراقبة الخلابة لمشاهدة الشروق.",
    category: "Adventure",
    categoryAr: "المغامرة",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 24,
    src: "/manus-storage/dd3d2890de4ecffd47057f095d6ad6f8335cafe5cf4528cf32fe34592dda2a59_13b4a4f7.avif",
    title: "Oasis Exploration",
    titleAr: "استكشاف الواحات",
    description: "Discover hidden oases in the Egyptian desert.",
    descriptionAr: "اكتشف الواحات المخفية في الصحراء المصرية.",
    category: "Desert Safari",
    categoryAr: "سفاري الصحراء",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 25,
    src: "/manus-storage/de0cbe1715f594a2d26ffba679c1dc6de7c5a5b48a6aa71071b9cbbbc8cb2b2b_20fa4c9f.avif",
    title: "Museum Tours",
    titleAr: "جولات المتاحف",
    description: "Guided tours through Egypt's world-class museums.",
    descriptionAr: "جولات موجهة عبر متاحف مصر من الدرجة الأولى.",
    category: "Culture & History",
    categoryAr: "الثقافة والتاريخ",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 26,
    src: "/manus-storage/e2a977724245a4cf0e4b7a0f07424cf202288df85c4bc033cd3b10fdb9cfe861_3bef8e2a.avif",
    title: "Private Yacht",
    titleAr: "اليخت الخاص",
    description: "Exclusive private yacht experiences.",
    descriptionAr: "تجارب يخت خاصة حصرية.",
    category: "Luxury Travel",
    categoryAr: "السفر الفاخر",
    location: "Red Sea",
    locationAr: "البحر الأحمر",
    aspect: "landscape",
  },
  {
    id: 27,
    src: "/manus-storage/f68765a1c4232c38adf3c395861aa911f246359f840a1efb386ef2c41510e7a0_f7165f1f.avif",
    title: "Desert Camping",
    titleAr: "التخييم في الصحراء",
    description: "Authentic desert camping experiences.",
    descriptionAr: "تجارب تخييم صحراوية أصيلة.",
    category: "Adventure",
    categoryAr: "المغامرة",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 28,
    src: "/manus-storage/f7bf2f13dd2a85f17cd30c5fe4f01e95f5a887952b00a2d4e2f5064651d6b4e2_698a03fa.avif",
    title: "Felucca Sailing",
    titleAr: "الإبحار بالفلوكة",
    description: "Traditional felucca sailing on the Nile.",
    descriptionAr: "الإبحار التقليدي بالفلوكة على النيل.",
    category: "River Cruises",
    categoryAr: "رحلات النيل",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 29,
    src: "/manus-storage/fe28b0881bedead8115627b1d3827a867b843e9d5ed6a7883681e9195b1a3094_1677e3d7.avif",
    title: "Cooking Classes",
    titleAr: "دروس الطهي",
    description: "Learn authentic Egyptian cuisine.",
    descriptionAr: "تعلم الطهي المصري الأصيل.",
    category: "Dining Experience",
    categoryAr: "تجربة الطعام",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 30,
    src: "/manus-storage/5dc72516632d67da21dc90ae345277beca1fca40a485d8562749b3f54c00ffa5_ccb1a73b.avif",
    title: "Balloon Rides",
    titleAr: "رحلات البالون",
    description: "Hot air balloon rides over the Valley of the Kings.",
    descriptionAr: "رحلات البالون الساخن فوق وادي الملوك.",
    category: "Adventure",
    categoryAr: "المغامرة",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 31,
    src: "/manus-storage/7d781c52387cc689c4b056baf4a57bed40d95cec0f5ad5cb998176cc18d76daa_51926cd4.avif",
    title: "Luxury Spa",
    titleAr: "منتجع صحي فاخر",
    description: "World-class spa treatments and wellness.",
    descriptionAr: "علاجات منتجع صحي وعافية من الدرجة الأولى.",
    category: "Wellness",
    categoryAr: "العافية",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "portrait",
  },
  {
    id: 32,
    src: "/manus-storage/59e8b742517b3fe5e797de38898a48e419d9ce8af3572a3291b6fa82556876cf_7733ff97.avif",
    title: "Golf Courses",
    titleAr: "ملاعب الجولف",
    description: "Championship golf courses in Egypt.",
    descriptionAr: "ملاعب جولف بطولة في مصر.",
    category: "Sports",
    categoryAr: "الرياضة",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 33,
    src: "/manus-storage/6419d5be1ff80_5f544c56.avif",
    title: "Luxury Shopping",
    titleAr: "التسوق الفاخر",
    description: "Exclusive shopping experiences.",
    descriptionAr: "تجارب تسوق حصرية.",
    category: "Luxury Travel",
    categoryAr: "السفر الفاخر",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
  },
  {
    id: 34,
    src: "/manus-storage/16e3e9a8129f6bf15ad6346a1a029be61ede9f61fee6c5ae02095dbb4ba69f53_be86cd87.avif",
    title: "Premium Events",
    titleAr: "الفعاليات الممتازة",
    description: "Exclusive event hosting and celebrations.",
    descriptionAr: "استضافة فعاليات واحتفالات حصرية.",
    category: "Events",
    categoryAr: "الفعاليات",
    location: "Egypt",
    locationAr: "مصر",
    aspect: "landscape",
    featured: true,
  },
];

/* ─── Static Video Fallback ─── */
interface VideoItemDisplay {
  id: number;
  thumbnail: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  duration: string;
  views: string;
  category: string;
  categoryAr: string;
}

const staticVideoItems: VideoItemDisplay[] = [
  {
    id: 1,
    thumbnail: `${CDN}/video1_thumb.jpg`,
    title: "Desert Expedition",
    titleAr: "رحلة الصحراء",
    description: "An exciting journey through Egypt's vast desert landscapes.",
    descriptionAr: "رحلة مثيرة عبر المناظر الصحراوية الشاسعة في مصر.",
    duration: "4:32",
    views: "12.5K",
    category: "Adventure",
    categoryAr: "المغامرة",
  },
  {
    id: 2,
    thumbnail: `${CDN}/video2_thumb.jpg`,
    title: "Nile River Journey",
    titleAr: "رحلة النيل",
    description: "Experience the magic of a cruise on the legendary Nile.",
    descriptionAr: "استمتع بسحر رحلة على النيل الأسطوري.",
    duration: "5:15",
    views: "18.3K",
    category: "Cruises",
    categoryAr: "الرحلات",
  },
  {
    id: 3,
    thumbnail: `${CDN}/video3_thumb.jpg`,
    title: "Ancient Temples",
    titleAr: "المعابد القديمة",
    description: "Discover the mysteries of Egypt's most iconic temples.",
    descriptionAr: "اكتشف أسرار أشهر معابد مصر.",
    duration: "6:48",
    views: "22.1K",
    category: "History",
    categoryAr: "التاريخ",
  },
  {
    id: 4,
    thumbnail: `${CDN}/video4_thumb.jpg`,
    title: "Cairo Nights",
    titleAr: "ليالي القاهرة",
    description: "Experience the vibrant nightlife and culture of Cairo.",
    descriptionAr:
      "استمتع بالحياة الليلية والثقافة النابضة بالحياة في القاهرة.",
    duration: "3:59",
    views: "15.7K",
    category: "City Tours",
    categoryAr: "جولات المدن",
  },
];

/* ─── Gallery Component ─── */
export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryItemDisplay | null>(
    null,
  );
  const [selectedVideo, setSelectedVideo] = useState<VideoItemDisplay | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch gallery data from DB (with fallback to static)
  const { data: dbGalleryItems = [] } = trpc.gallery.listVisible.useQuery(
    undefined,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  ) as any;

  const galleryItems =
    dbGalleryItems.length > 0 ? dbGalleryItems : staticGalleryItems;

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(galleryItems.map((item: any) => item.category));
    return ["All", ...Array.from(cats)];
  }, [galleryItems]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return galleryItems;
    return galleryItems.filter((item: any) => item.category === activeCategory);
  }, [galleryItems, activeCategory]);

  // Handle image click
  const handleImageClick = useCallback((item: any) => {
    setSelectedImage(item);
  }, []);

  // Handle video click
  const handleVideoClick = useCallback((item: any) => {
    setSelectedVideo(item);
  }, []);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Close video modal
  const closeVideoModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Navigate to next/prev image
  const navigateImage = useCallback(
    (direction: "next" | "prev") => {
      if (!selectedImage) return;
      const currentIndex = filteredItems.findIndex(
        (item: any) => item.id === selectedImage.id,
      );
      const newIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (newIndex >= 0 && newIndex < filteredItems.length) {
        setSelectedImage(filteredItems[newIndex]);
      }
    },
    [selectedImage, filteredItems],
  );

  // Share image
  const shareImage = useCallback((item: any) => {
    const shareText = `Check out this amazing ${item.category} experience from Vanir Travel Group: ${item.title}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: shareText,
        url: window.location.href,
      });
    } else {
      toast.success("Share link copied to clipboard!");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--theme-background)] text-white">
      <Navbar />
      <SEO
        title="Gallery - Vanir Travel Group"
        description="Explore our stunning gallery of Egyptian luxury travel experiences, from desert safaris to Nile cruises."
        ogImage={galleryItems[0]?.src}
      />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-3 sm:px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/manus-storage/hero-gallery_41ca4d64.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-background)]/85 via-[var(--theme-background)]/75 to-[var(--theme-background)]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] bg-clip-text text-transparent">
              Gallery
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">
              Discover the beauty and elegance of our luxury travel experiences
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-12">
            {(categories as string[]).map((category: string) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category)}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-all text-xs sm:text-sm ${
                  activeCategory === category
                    ? "bg-[var(--theme-primary)] text-[var(--theme-background)] font-semibold"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-[var(--theme-primary)] text-[var(--theme-background)]"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-[var(--theme-primary)] text-[var(--theme-background)]"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section
        ref={containerRef}
        className="px-3 sm:px-4 md:px-8 pb-12 sm:pb-20"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            layout
            className={`grid gap-3 sm:gap-4 md:gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max"
                : "grid-cols-1"
            }`}
          >
            <AnimatePresence mode="wait">
              {filteredItems.map((item: GalleryItemDisplay) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleImageClick(item)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden bg-gray-900 ${
                    item.aspect === "portrait" ? "row-span-2" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <OptimizedImage
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-lg font-semibold mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-300 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin size={14} />
                        {item.location}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-[var(--theme-primary)]/90 text-[var(--theme-background)] px-3 py-1 rounded-full text-xs font-semibold">
                      {item.category}
                    </div>

                    {/* Featured Badge */}
                    {item.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-500/90 text-[var(--theme-background)] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Sparkles size={12} />
                        Featured
                      </div>
                    )}

                    {/* Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn
                        size={40}
                        className="text-[var(--theme-primary)]"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Videos Section */}
          <div className="mt-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 sm:mb-8 text-center bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] bg-clip-text text-transparent">
              Featured Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {staticVideoItems.map((video: VideoItemDisplay) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleVideoClick(video)}
                  className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-900"
                >
                  <div className="relative h-48 overflow-hidden">
                    <OptimizedImage
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play
                        size={50}
                        className="text-[var(--theme-primary)] group-hover:scale-125 transition-transform"
                      />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <Clock size={12} />
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye size={12} />
                      {video.views}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              {/* Image */}
              <OptimizedImage
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-auto rounded-lg"
              />

              {/* Info */}
              <div className="mt-4 text-white">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedImage.title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {selectedImage.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <MapPin size={16} />
                  {selectedImage.location}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => shareImage(selectedImage)}
                    className="flex items-center gap-2 bg-[var(--theme-primary)] text-[var(--theme-background)] px-4 py-2 rounded-lg hover:bg-[#E5B86B] transition-colors"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={() => toast.success("Image downloaded!")}
                    className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={() => navigateImage("prev")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 text-[var(--theme-primary)] hover:text-[var(--theme-primary-light)] transition-colors"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={() => navigateImage("next")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 text-[var(--theme-primary)] hover:text-[var(--theme-primary-light)] transition-colors"
              >
                <ChevronRight size={40} />
              </button>

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-[var(--theme-primary)] transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeVideoModal}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              <div className="bg-black rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <Play size={80} className="text-[var(--theme-primary)]" />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-gray-300 mb-4">
                    {selectedVideo.description}
                  </p>
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="absolute top-4 right-4 text-white hover:text-[var(--theme-primary)] transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BackToTop />
      <Footer />
    </div>
  );
}
