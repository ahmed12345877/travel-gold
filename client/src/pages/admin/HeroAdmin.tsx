import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Save, AlertCircle, Eye, ImageIcon, Type, Link2, Sparkles, Loader2, Film, Layout, Monitor, Columns2, Maximize, X, Plus, Trash2, RotateCcw, Palette, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { SubPageHero } from "@/contexts/ThemeColorsProvider";

/* ─── Types ─── */
interface HeroImage {
  id: number;
  url: string;
  label: string;
  sublabel: string;
  link: string;
}

interface TextStyle {
  fontSize: number;
  fontWeight: "normal" | "bold" | "900";
  color: string;
  textAlign: "left" | "center" | "right";
  textShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  opacity: number;
}

interface RotatingWordsStyle {
  animation: "fade" | "slide" | "flip" | "zoom" | "typewriter" | "bounce";
  speed: number; // milliseconds
  textColor: string;
  backgroundColor?: string;
  showBackground: boolean;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
}

interface HeroData {
  title: string;
  rotatingWords: string[];
  subtitle: string;
  buttonText1: string;
  buttonText2: string;
  buttonLink1: string;
  buttonLink2: string;
  mediaType: "image" | "video" | "gradient";
  backgroundType?: "static-image" | "html5-video" | "dynamic-slider";
  sliderEngine?: "framer-motion" | "swiper" | "splide";
  sliderEffect?: "fade" | "cube" | "flip" | "coverflow" | "creative";
  autoplayMs?: number;
  loopSlides?: boolean;
  textFadeInEnabled?: boolean;
  textFadeInDuration?: number;
  mediaUrl: string;
  overlayOpacity: number;
  overlayColor: "dark" | "light";
  mediaCropX?: number;
  mediaCropY?: number;
  featuredImageUrl?: string;
  // Text Styles
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  rotatingWordsStyle?: RotatingWordsStyle;
  button1Style?: TextStyle;
  button2Style?: TextStyle;
  button1BgColor?: string;
  button2BgColor?: string;
  button1HoverBgColor?: string;
  button2HoverBgColor?: string;
}

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm";
const ACCEPTED_MEDIA_TYPES = `${ACCEPTED_IMAGE_TYPES},${ACCEPTED_VIDEO_TYPES}`;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Default Text Style
const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  color: "#ffffff",
  textAlign: "center",
  textShadow: true,
  shadowColor: "#000000",
  shadowBlur: 8,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  lineHeight: 1.4,
  letterSpacing: 1,
  textTransform: "none",
  opacity: 1,
};

// Default Rotating Words Style
const DEFAULT_ROTATING_STYLE: RotatingWordsStyle = {
  animation: "fade",
  speed: 3000,
  textColor: "#FFD700",
  backgroundColor: "transparent",
  showBackground: false,
  paddingX: 8,
  paddingY: 4,
  borderRadius: 4,
};

const SUB_PAGES = [
  { id: "about", label: "About Us", labelAr: "من نحن" },
  { id: "services", label: "Services", labelAr: "الخدمات" },
  { id: "contact", label: "Contact", labelAr: "اتصل بنا" },
  { id: "destinations", label: "Destinations", labelAr: "الوجهات" },
  { id: "gallery", label: "Gallery", labelAr: "المعرض" },
  { id: "blog", label: "Blog", labelAr: "المدونة" },
  { id: "programs", label: "Programs", labelAr: "البرامج" },
  { id: "offers", label: "Offers", labelAr: "العروض" },
];

const DEFAULT_SUB_HERO: SubPageHero = {
  page: "",
  layout: "centered",
  title: "",
  subtitle: "",
  mediaUrl: "",
  mediaType: "gradient",
  gradientFrom: "#1A1A2E",
  gradientTo: "#0A0A0A",
  overlayOpacity: 60,
};

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

export default function HeroAdmin() {
  /* ─── Main hero state ─── */
  const [heroData, setHeroData] = useState<HeroData>({
    title: "VANIR GROUP — LUXURY TRAVEL",
    rotatingWords: ["Discover", "Explore", "Experience"],
    subtitle: "Egypt's Wonders",
    buttonText1: "Begin Your Journey",
    buttonText2: "Explore Gallery",
    buttonLink1: "/booking",
    buttonLink2: "/gallery",
    mediaType: "image",
    backgroundType: "static-image",
    sliderEngine: "framer-motion",
    sliderEffect: "fade",
    autoplayMs: 3500,
    loopSlides: true,
    textFadeInEnabled: true,
    textFadeInDuration: 900,
    mediaUrl: "",
    overlayOpacity: 50,
    overlayColor: "dark",
    mediaCropX: 50,
    mediaCropY: 50,
    featuredImageUrl: "",
    // Default Text Styles
    titleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 56, fontWeight: "900" },
    subtitleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 32, fontWeight: "bold" },
    rotatingWordsStyle: DEFAULT_ROTATING_STYLE,
    button1Style: { ...DEFAULT_TEXT_STYLE, fontSize: 16, fontWeight: "bold" },
    button2Style: { ...DEFAULT_TEXT_STYLE, fontSize: 16, fontWeight: "bold" },
    button1BgColor: "#FFD700",
    button2BgColor: "transparent",
    button1HoverBgColor: "#FFC700",
    button2HoverBgColor: "rgba(255, 255, 255, 0.1)",
  });

  const [heroImages, setHeroImages] = useState<HeroImage[]>([
    { id: 1, url: "", label: "Destinations", sublabel: "ANCIENT WONDERS", link: "/destinations" },
    { id: 2, url: "", label: "Exclusive Offers", sublabel: "PREMIUM DEALS", link: "/offers" },
    { id: 3, url: "", label: "Gallery", sublabel: "CAPTURED MOMENTS", link: "/gallery" },
    { id: 4, url: "", label: "Experiences", sublabel: "UNFORGETTABLE", link: "/programs" },
  ]);

  const [newWord, setNewWord] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);
  const [uploadingBgMedia, setUploadingBgMedia] = useState(false);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  // Advanced Text Management
  const [editingStyle, setEditingStyle] = useState<"title" | "subtitle" | "rotating" | "button1" | "button2" | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Rotating words preview effect
  useEffect(() => {
    if (!heroData?.rotatingWords || heroData?.rotatingWords.length === 0) return;
    const speed = heroData?.rotatingWordsStyle?.speed || 3000;
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % heroData.rotatingWords.length);
    }, speed);
    return () => clearInterval(interval);
  }, [heroData?.rotatingWords, heroData?.rotatingWordsStyle?.speed]);

  /* ─── Sub-page hero state ─── */
  const [subHeroes, setSubHeroes] = useState<SubPageHero[]>([]);
  const [activeSubPage, setActiveSubPage] = useState<string>("about");
  const [subSaving, setSubSaving] = useState(false);
  const [subHasChanges, setSubHasChanges] = useState(false);
  const [uploadingSubMedia, setUploadingSubMedia] = useState(false);

  /* ─── tRPC ─── */
  const { data: savedData, isLoading: isLoadingData } = trpc.siteSettings.get.useQuery({ category: "hero", key: "hero_settings" }, { staleTime: 30000 });
  const { data: savedDataLegacy } = trpc.siteSettings.get.useQuery({ category: "hero", key: "hero_data" }, { staleTime: 30000 });
  const { data: savedImages, isLoading: isLoadingImages } = trpc.siteSettings.get.useQuery({ category: "hero", key: "hero_images" }, { staleTime: 30000 });
  const { data: savedSubHeroes, isLoading: isLoadingSub } = trpc.siteSettings.get.useQuery({ category: "hero", key: "sub_page_heroes" }, { staleTime: 30000 });
  const setMut = trpc.siteSettings.set.useMutation();
  const uploadImageMut = trpc.gallery.uploadImage.useMutation();

  useEffect(() => {
    const payload = savedData || savedDataLegacy;
    if (!payload) return;
    try {
      const p = JSON.parse(payload);
      setHeroData(prev => ({
        ...prev,
        ...p,
        backgroundType: p.backgroundType || (p.mediaType === "video" ? "html5-video" : "static-image"),
        sliderEngine: p.sliderEngine || "framer-motion",
        sliderEffect: p.sliderEffect || "fade",
        autoplayMs: typeof p.autoplayMs === "number" ? p.autoplayMs : 3500,
        loopSlides: typeof p.loopSlides === "boolean" ? p.loopSlides : true,
        textFadeInEnabled: typeof p.textFadeInEnabled === "boolean" ? p.textFadeInEnabled : true,
        textFadeInDuration: typeof p.textFadeInDuration === "number" ? p.textFadeInDuration : 900,
      }));
    } catch {}
  }, [savedData, savedDataLegacy]);
  useEffect(() => { if (savedImages) { try { const p = JSON.parse(savedImages); if (Array.isArray(p) && p.length > 0) setHeroImages(p); } catch {} } }, [savedImages]);
  useEffect(() => { if (savedSubHeroes) { try { const p = JSON.parse(savedSubHeroes); if (Array.isArray(p)) setSubHeroes(p); } catch {} } }, [savedSubHeroes]);

  /* ─── Main Hero persistence ─── */
  const saveToDb = useCallback(async () => {
    setSaving(true);
    try {
      await setMut.mutateAsync({ category: "hero", key: "hero_settings", value: JSON.stringify(heroData) });
      await setMut.mutateAsync({ category: "hero", key: "hero_images", value: JSON.stringify(heroImages) });
      setHasChanges(false);
      toast.success("تم الحفظ في قاعدة البيانات (Firebase Firestore)");
    } catch {
      toast.error("فشل في الحفظ");
    } finally { setSaving(false); }
  }, [setMut, heroData, heroImages]);

  /* ─── Sub-page Hero persistence ─── */
  const saveSubHeroes = useCallback(async () => {
    setSubSaving(true);
    try {
      await setMut.mutateAsync({ category: "hero", key: "sub_page_heroes", value: JSON.stringify(subHeroes) });
      setSubHasChanges(false);
      toast.success("تم حفظ الصفحات الفرعية");
    } catch {
      toast.error("فشل في الحفظ");
    } finally { setSubSaving(false); }
  }, [setMut, subHeroes]);

  const markData = (data: HeroData) => { setHeroData(data); setHasChanges(true); };
  const markImages = (images: HeroImage[]) => { setHeroImages(images); setHasChanges(true); };

  /* ─── Media upload (Firebase Storage) ─── */
  const uploadMedia = async (file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE) throw new Error("حجم الملف يتجاوز 10MB");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const base64 = dataUrl.split(",")[1];
    const { url } = await uploadImageMut.mutateAsync({
      fileData: base64,
      filename: file.name,
      mimeType: file.type,
    });
    return url;
  };

  const handleImageUpload = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImageId(id);
    try {
      const url = await uploadMedia(file);
      markImages(heroImages.map(img => img.id === id ? { ...img, url } : img));
      toast.success("تم رفع الملف بنجاح (Firebase Storage)");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setUploadingImageId(null); }
  };

  const handleBgMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBgMedia(true);
    try {
      const url = await uploadMedia(file);
      const mType = file.type.startsWith("video/") ? "video" : "image";
      markData({
        ...heroData,
        mediaUrl: url,
        mediaType: mType as "image" | "video",
        backgroundType: mType === "video" ? "html5-video" : "static-image",
      });
      toast.success("تم رفع الوسائط");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setUploadingBgMedia(false); }
  };

  const handleSubMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSubMedia(true);
    try {
      const url = await uploadMedia(file);
      const mType = file.type.startsWith("video/") ? "video" : "image";
      updateSubHero(activeSubPage, { mediaUrl: url, mediaType: mType as "image" | "video" });
      toast.success("تم رفع وسائط الصفحة الفرعية");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setUploadingSubMedia(false); }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFeaturedImage(true);
    try {
      const url = await uploadMedia(file);
      markData({ ...heroData, featuredImageUrl: url });
      toast.success("تم رفع الصورة المميزة بنجاح");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setUploadingFeaturedImage(false); }
  };

  const updateImage = (id: number, field: keyof HeroImage, value: string) => {
    markImages(heroImages.map(img => img.id === id ? { ...img, [field]: value } : img));
  };

  const addRotatingWord = () => {
    if (newWord.trim()) {
      markData({ ...heroData, rotatingWords: [...heroData.rotatingWords, newWord.trim()] });
      setNewWord("");
    }
  };

  const removeRotatingWord = (index: number) => {
    markData({ ...heroData, rotatingWords: heroData.rotatingWords.filter((_, i) => i !== index) });
  };

  /* ─── Advanced Text Style Functions ─── */
  const updateTitleStyle = (updates: Partial<TextStyle>) => {
    markData({
      ...heroData,
      titleStyle: { ...heroData.titleStyle, ...updates },
    });
  };

  const updateSubtitleStyle = (updates: Partial<TextStyle>) => {
    markData({
      ...heroData,
      subtitleStyle: { ...heroData.subtitleStyle, ...updates },
    });
  };

  const updateRotatingWordsStyle = (updates: Partial<RotatingWordsStyle>) => {
    markData({
      ...heroData,
      rotatingWordsStyle: { ...heroData.rotatingWordsStyle, ...updates },
    });
  };

  const updateButton1Style = (updates: Partial<TextStyle>) => {
    markData({
      ...heroData,
      button1Style: { ...heroData.button1Style, ...updates },
    });
  };

  const updateButton2Style = (updates: Partial<TextStyle>) => {
    markData({
      ...heroData,
      button2Style: { ...heroData.button2Style, ...updates },
    });
  };

  const resetTitleStyle = () => updateTitleStyle({ ...DEFAULT_TEXT_STYLE, fontSize: 56, fontWeight: "900" });
  const resetSubtitleStyle = () => updateSubtitleStyle({ ...DEFAULT_TEXT_STYLE, fontSize: 32, fontWeight: "bold" });
  const resetRotatingStyle = () => updateRotatingWordsStyle(DEFAULT_ROTATING_STYLE);
  const resetButton1Style = () => updateButton1Style({ ...DEFAULT_TEXT_STYLE, fontSize: 16, fontWeight: "bold" });
  const resetButton2Style = () => updateButton2Style({ ...DEFAULT_TEXT_STYLE, fontSize: 16, fontWeight: "bold" });

  /* ─── Sub-page hero helpers ─── */
  const getSubHero = (page: string): SubPageHero => {
    return subHeroes.find(h => h.page === page) || { ...DEFAULT_SUB_HERO, page };
  };

  const updateSubHero = (page: string, updates: Partial<SubPageHero>) => {
    setSubHeroes(prev => {
      const existing = prev.find(h => h.page === page);
      if (existing) return prev.map(h => h.page === page ? { ...h, ...updates } : h);
      return [...prev, { ...DEFAULT_SUB_HERO, page, ...updates }];
    });
    setSubHasChanges(true);
  };

  const mainTabs = [
    { id: "text" as const, label: "النصوص", icon: Type },
    { id: "advanced" as const, label: "تنسيق النصوص المتقدم", icon: Palette },
    { id: "media" as const, label: "الوسائط", icon: Film },
    { id: "images" as const, label: "الصور", icon: ImageIcon },
    { id: "buttons" as const, label: "الأزرار", icon: Link2 },
  ];

  if (isLoadingData || isLoadingImages || isLoadingSub) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[var(--theme-primary)]" size={48} /></div>;

  const currentSubHero = getSubHero(activeSubPage);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-[var(--theme-primary)]" size={24} />
            إدارة Hero Section
          </h1>
          <p className="text-white/50 text-sm mt-1">إدارة الواجهة الرئيسية والصفحات الفرعية مع دعم الصور والفيديو</p>
        </div>
      </div>

      <Tabs defaultValue="main" className="space-y-4">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="main" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Monitor className="w-4 h-4 ml-1" /> الصفحة الرئيسية
          </TabsTrigger>
          <TabsTrigger value="subpages" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Layout className="w-4 h-4 ml-1" /> الصفحات الفرعية
          </TabsTrigger>
        </TabsList>

        {/* ═══ Main Hero Tab ═══ */}
        <TabsContent value="main" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {mainTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20"
                      : "text-white/50 hover:text-white/80 border border-transparent"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {hasChanges && <div className="flex items-center gap-2 text-yellow-400"><AlertCircle size={16} /><span className="text-sm">تغييرات غير محفوظة</span></div>}
              <Button onClick={saveToDb} disabled={saving || !hasChanges} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold">
                {saving ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Save size={16} className="ml-2" />}
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4 bg-[var(--theme-surface)] border border-white/5 rounded-lg p-6">
              {activeTab === "text" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">النصوص الرئيسية</h3>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">العنوان الرئيسي</label>
                    <Input value={heroData.title} onChange={(e) => markData({ ...heroData, title: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="VANIR GROUP — LUXURY TRAVEL" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">الكلمات المتغيرة</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {heroData.rotatingWords.map((word, i) => (
                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-full text-sm border border-[var(--theme-primary)]/20">
                          {word}
                          <button onClick={() => removeRotatingWord(i)} className="ml-1 text-[var(--theme-primary)]/60 hover:text-red-400">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newWord} onChange={(e) => setNewWord(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addRotatingWord()} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="أضف كلمة جديدة..." />
                      <Button onClick={addRotatingWord} variant="outline" className="border-[var(--theme-primary)]/20 text-[var(--theme-primary)]">إضافة</Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">العنوان الفرعي</label>
                    <Input value={heroData.subtitle} onChange={(e) => markData({ ...heroData, subtitle: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="Egypt's Wonders" />
                  </div>
                </div>
              )}

              {activeTab === "advanced" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Palette size={20} /> تنسيق النصوص المتقدم</h3>
                  <p className="text-sm text-white/50">التحكم الكامل في مظهر وسلوك النصوص والأزرار</p>

                  {/* Title Style */}
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-2"><Type size={16} /> العنوان الرئيسي</span>
                      <Button onClick={resetTitleStyle} variant="ghost" size="sm" className="text-xs text-white/50 hover:text-white/70">
                        <RotateCcw size={14} className="mr-1" /> إعادة تعيين
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/60">حجم الخط</Label>
                        <div className="flex items-center gap-2">
                          <Slider value={[heroData.titleStyle?.fontSize || 56]} onValueChange={(v) => updateTitleStyle({ fontSize: v[0] })} min={16} max={96} step={2} className="flex-1" />
                          <span className="text-xs text-white/70 w-8">{heroData.titleStyle?.fontSize || 56}px</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-white/60">سمك الخط</Label>
                        <Select value={heroData.titleStyle?.fontWeight || "bold"} onValueChange={(v) => updateTitleStyle({ fontWeight: v as any })}>
                          <SelectTrigger className="bg-black/40 border-white/10 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">عادي</SelectItem>
                            <SelectItem value="bold">غامق</SelectItem>
                            <SelectItem value="900">فائق الغموق</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/60">اللون</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={heroData.titleStyle?.color || "#ffffff"} onChange={(e) => updateTitleStyle({ color: e.target.value })} className="h-8 w-12 rounded cursor-pointer border border-white/10" />
                          <span className="text-xs text-white/70">{heroData.titleStyle?.color || "#ffffff"}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-white/60">التحويل</Label>
                        <Select value={heroData.titleStyle?.textTransform || "none"} onValueChange={(v) => updateTitleStyle({ textTransform: v as any })}>
                          <SelectTrigger className="bg-black/40 border-white/10 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">عادي</SelectItem>
                            <SelectItem value="uppercase">أحرف كبيرة</SelectItem>
                            <SelectItem value="lowercase">أحرف صغيرة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <Label className="text-xs text-white/60 flex items-center gap-2 mb-2"><Sparkles size={14} /> الظل النصي</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={heroData.titleStyle?.textShadow || false} onChange={(e) => updateTitleStyle({ textShadow: e.target.checked })} className="w-4 h-4 rounded" />
                          <span className="text-sm text-white/70">تفعيل الظل</span>
                        </div>
                        {heroData.titleStyle?.textShadow && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-white/60">لون الظل</Label>
                              <input type="color" value={heroData.titleStyle?.shadowColor || "#000000"} onChange={(e) => updateTitleStyle({ shadowColor: e.target.value })} className="h-6 w-full rounded cursor-pointer border border-white/10" />
                            </div>
                            <div>
                              <Label className="text-xs text-white/60">ضبابية</Label>
                              <Slider value={[heroData.titleStyle?.shadowBlur || 8]} onValueChange={(v) => updateTitleStyle({ shadowBlur: v[0] })} min={0} max={20} step={1} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rotating Words Style */}
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-2"><Zap size={16} /> الكلمات الدوارة</span>
                      <Button onClick={resetRotatingStyle} variant="ghost" size="sm" className="text-xs text-white/50 hover:text-white/70">
                        <RotateCcw size={14} className="mr-1" /> إعادة تعيين
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs text-white/60">نوع الرسوم المتحركة</Label>
                      <Select value={heroData.rotatingWordsStyle?.animation || "fade"} onValueChange={(v) => updateRotatingWordsStyle({ animation: v as any })}>
                        <SelectTrigger className="bg-black/40 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">تلاشي (Fade)</SelectItem>
                          <SelectItem value="slide">انزلاق (Slide)</SelectItem>
                          <SelectItem value="flip">قلب (Flip)</SelectItem>
                          <SelectItem value="zoom">تكبير (Zoom)</SelectItem>
                          <SelectItem value="typewriter">كاتبة (Typewriter)</SelectItem>
                          <SelectItem value="bounce">ارتداد (Bounce)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/60">السرعة (ميلي ثانية)</Label>
                        <div className="flex items-center gap-2">
                          <Slider value={[heroData.rotatingWordsStyle?.speed || 3000]} onValueChange={(v) => updateRotatingWordsStyle({ speed: v[0] })} min={1000} max={10000} step={500} className="flex-1" />
                          <span className="text-xs text-white/70 w-12">{heroData.rotatingWordsStyle?.speed || 3000}ms</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-white/60">اللون</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={heroData.rotatingWordsStyle?.textColor || "#FFD700"} onChange={(e) => updateRotatingWordsStyle({ textColor: e.target.value })} className="h-8 w-12 rounded cursor-pointer border border-white/10" />
                          <span className="text-xs text-white/70">{heroData.rotatingWordsStyle?.textColor || "#FFD700"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">وسائط الخلفية</h3>
                  <p className="text-sm text-white/50">يدعم: JPEG, PNG, WebP, GIF, MP4, WebM (حد أقصى 10MB)</p>

                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">نوع الخلفية المتقدم</Label>
                    <Select
                      value={heroData.backgroundType || "static-image"}
                      onValueChange={(v) =>
                        markData({
                          ...heroData,
                          backgroundType: v as HeroData["backgroundType"],
                          mediaType: v === "html5-video" ? "video" : v === "dynamic-slider" ? "image" : "image",
                        })
                      }
                    >
                      <SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="static-image">صورة ثابتة</SelectItem>
                        <SelectItem value="html5-video">فيديو HTML5</SelectItem>
                        <SelectItem value="dynamic-slider">سلايدر ديناميكي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {heroData.backgroundType === "dynamic-slider" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-white/10 rounded-lg p-4">
                      <div>
                        <Label className="text-white/70 text-sm mb-2 block">محرك العرض</Label>
                        <Select value={heroData.sliderEngine || "framer-motion"} onValueChange={(v) => markData({ ...heroData, sliderEngine: v as HeroData["sliderEngine"] })}>
                          <SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="framer-motion">Framer Motion</SelectItem>
                            <SelectItem value="swiper">Swiper.js Pattern</SelectItem>
                            <SelectItem value="splide">Splide.js Pattern</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm mb-2 block">تأثير السلايدر</Label>
                        <Select value={heroData.sliderEffect || "fade"} onValueChange={(v) => markData({ ...heroData, sliderEffect: v as HeroData["sliderEffect"] })}>
                          <SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fade">Fade</SelectItem>
                            <SelectItem value="cube">3D Cube</SelectItem>
                            <SelectItem value="flip">3D Flip</SelectItem>
                            <SelectItem value="coverflow">Coverflow</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-white/70 text-sm">Autoplay (ms): {heroData.autoplayMs || 3500}</Label>
                        <Slider value={[heroData.autoplayMs || 3500]} onValueChange={([v]) => markData({ ...heroData, autoplayMs: v })} min={1000} max={15000} step={250} className="mt-2" />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-white/80">
                        <input type="checkbox" checked={heroData.loopSlides ?? true} onChange={(e) => markData({ ...heroData, loopSlides: e.target.checked })} />
                        تشغيل دائري (Loop)
                      </label>
                    </div>
                  )}

                  <div className="border border-white/10 rounded-lg p-4 space-y-3">
                    <Label className="text-white/80 text-sm">Text Fade-In Animation</Label>
                    <label className="flex items-center gap-2 text-sm text-white/80">
                      <input type="checkbox" checked={heroData.textFadeInEnabled ?? true} onChange={(e) => markData({ ...heroData, textFadeInEnabled: e.target.checked })} />
                      تفعيل Fade-In للنص
                    </label>
                    {(heroData.textFadeInEnabled ?? true) && (
                      <div>
                        <Label className="text-white/70 text-sm">Fade Duration: {heroData.textFadeInDuration || 900}ms</Label>
                        <Slider value={[heroData.textFadeInDuration || 900]} onValueChange={([v]) => markData({ ...heroData, textFadeInDuration: v })} min={150} max={5000} step={50} className="mt-2" />
                      </div>
                    )}
                  </div>

                  {heroData.backgroundType !== "dynamic-slider" && (
                    <div>
                      <input type="file" accept={heroData.backgroundType === "html5-video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_MEDIA_TYPES} onChange={handleBgMediaUpload} className="hidden" id="hero-bg-media" disabled={uploadingBgMedia} />
                      <label htmlFor="hero-bg-media" className={`flex items-center gap-2 px-4 py-3 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 rounded-lg cursor-pointer hover:bg-[var(--theme-primary)]/20 transition-colors ${uploadingBgMedia ? "opacity-60 cursor-not-allowed" : ""}`}>
                        {uploadingBgMedia ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {uploadingBgMedia ? "جاري الرفع إلى Firebase Storage..." : "رفع ملف وسائط"}
                      </label>
                      {heroData.mediaUrl && (
                        <div className="mt-3 p-3 bg-black/30 rounded-lg border border-white/5">
                          {isVideoUrl(heroData.mediaUrl) ? (
                            <video src={heroData.mediaUrl} className="w-full h-32 object-cover rounded" muted autoPlay loop playsInline />
                          ) : (
                            <img src={heroData.mediaUrl} className="w-full h-32 object-cover rounded" alt="Background" />
                          )}
                          <button onClick={() => markData({ ...heroData, mediaUrl: "" })} className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><X size={12} /> إزالة</button>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label className="text-white/70 text-sm">شفافية التراكب: {heroData.overlayOpacity}%</Label>
                    <Slider value={[heroData.overlayOpacity]} onValueChange={([v]) => markData({ ...heroData, overlayOpacity: v })} min={0} max={100} step={5} className="mt-2" />
                  </div>

                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">لون التراكب</Label>
                    <Select value={heroData.overlayColor} onValueChange={(v) => markData({ ...heroData, overlayColor: v as "dark" | "light" })}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">داكن (أسود)</SelectItem>
                        <SelectItem value="light">فاتح (أبيض)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {heroData.backgroundType !== "dynamic-slider" && (
                    <div className="space-y-3 border border-white/10 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Maximize size={16} /> قص الوسائط (Crop)
                      </h4>
                      <p className="text-xs text-white/50">اضبط موضع الصورة/الفيديو داخل الإطار</p>
                      <div>
                        <Label className="text-white/70 text-sm">الموضع الأفقي: {heroData.mediaCropX ?? 50}%</Label>
                        <Slider value={[heroData.mediaCropX ?? 50]} onValueChange={([v]) => markData({ ...heroData, mediaCropX: v })} min={0} max={100} step={5} className="mt-2" />
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">الموضع الرأسي: {heroData.mediaCropY ?? 50}%</Label>
                        <Slider value={[heroData.mediaCropY ?? 50]} onValueChange={([v]) => markData({ ...heroData, mediaCropY: v })} min={0} max={100} step={5} className="mt-2" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "images" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">صور الـ Hero (4 صور شبكة + صورة مميزة)</h3>
                  <p className="text-sm text-white/50">يدعم: JPEG, PNG, WebP, GIF, MP4, WebM (حد أقصى 10MB)</p>

                  {/* Featured Image - الصورة الخامسة */}
                  <div className="bg-[#2a2a2a] border-2 border-[var(--theme-primary)]/30 rounded-lg p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)]" />
                      <span className="text-sm font-semibold text-[var(--theme-primary)]">الصورة المميزة (الصورة الخامسة الرئيسية)</span>
                    </div>
                    <p className="text-xs text-white/60">صورة إضافية تظهر في الواجهة الرئيسية - يمكن أن تكون صورة أو فيديو</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {heroData.featuredImageUrl && (
                          <div className="mb-3">
                            {isVideoUrl(heroData.featuredImageUrl) ? (
                              <video src={heroData.featuredImageUrl} className="w-20 h-20 object-cover rounded-lg border border-[var(--theme-primary)]/20" muted autoPlay loop playsInline />
                            ) : (
                              <img src={heroData.featuredImageUrl} alt="Featured" className="w-20 h-20 object-cover rounded-lg border border-[var(--theme-primary)]/20" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input type="file" accept={ACCEPTED_MEDIA_TYPES} onChange={handleFeaturedImageUpload} className="hidden" id="hero-featured-image" disabled={uploadingFeaturedImage} />
                        <label htmlFor="hero-featured-image" className={`flex items-center gap-2 px-4 py-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 rounded-lg cursor-pointer hover:bg-[var(--theme-primary)]/20 transition-colors text-sm w-fit ${uploadingFeaturedImage ? "opacity-60 cursor-not-allowed" : ""}`}>
                          {uploadingFeaturedImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          {uploadingFeaturedImage ? "جاري الرفع..." : heroData.featuredImageUrl ? "تغيير الصورة" : "رفع صورة"}
                        </label>
                        {heroData.featuredImageUrl && (
                          <button onClick={() => markData({ ...heroData, featuredImageUrl: "" })} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                            <X size={12} /> إزالة
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grid Images - الصور الأربع */}
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 mb-3">صور الشبكة (4 صور)</h4>
                    {heroImages.map((img) => (
                      <div key={img.id} className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[var(--theme-primary)]">صورة #{img.id}</span>
                          {img.url && (
                            isVideoUrl(img.url) ? <video src={img.url} className="w-16 h-10 object-cover rounded" muted autoPlay loop playsInline /> : <img src={img.url} alt="" className="w-16 h-10 object-cover rounded" />
                          )}
                        </div>
                        <div>
                          <input type="file" accept={ACCEPTED_MEDIA_TYPES} onChange={(e) => handleImageUpload(img.id, e)} className="hidden" id={`hero-img-${img.id}`} disabled={uploadingImageId === img.id} />
                          <label htmlFor={`hero-img-${img.id}`} className={`flex items-center gap-2 px-3 py-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 rounded-lg cursor-pointer hover:bg-[var(--theme-primary)]/20 transition-colors text-sm w-fit ${uploadingImageId === img.id ? "opacity-60 cursor-not-allowed" : ""}`}>
                            {uploadingImageId === img.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {uploadingImageId === img.id ? "جاري الرفع..." : img.url ? "تغيير" : "اختر ملف"}
                          </label>
                        </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">العنوان</label>
                          <Input value={img.label} onChange={(e) => updateImage(img.id, "label", e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm h-8" />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">العنوان الفرعي</label>
                          <Input value={img.sublabel} onChange={(e) => updateImage(img.id, "sublabel", e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm h-8" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">الرابط</label>
                        <Input value={img.link} onChange={(e) => updateImage(img.id, "link", e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm h-8" />
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              )}

              {activeTab === "buttons" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">أزرار الـ Hero</h3>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-[var(--theme-primary)]">الزر الأول (رئيسي)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">النص</label>
                        <Input value={heroData.buttonText1} onChange={(e) => markData({ ...heroData, buttonText1: e.target.value })} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">الرابط</label>
                        <Input value={heroData.buttonLink1} onChange={(e) => markData({ ...heroData, buttonLink1: e.target.value })} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-[var(--theme-primary)]">الزر الثاني (ثانوي)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">النص</label>
                        <Input value={heroData.buttonText2} onChange={(e) => markData({ ...heroData, buttonText2: e.target.value })} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">الرابط</label>
                        <Input value={heroData.buttonLink2} onChange={(e) => markData({ ...heroData, buttonLink2: e.target.value })} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <div className="bg-[var(--theme-surface)] border-white/5 rounded-lg p-4 lg:p-0 lg:bg-transparent lg:border-none">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Eye className="text-[var(--theme-primary)]" size={20} /> معاينة حية</h3>
                <div className="aspect-[16/9] bg-black rounded-lg overflow-hidden border-2 border-[var(--theme-primary)] relative">
                  {/* Background media */}
                  {heroData.backgroundType === "dynamic-slider" ? (
                    <img src={heroImages.find((img) => img.url)?.url || heroData.mediaUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                  ) : heroData.mediaType === "video" && heroData.mediaUrl ? (
                    <video src={heroData.mediaUrl} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `${heroData.mediaCropX ?? 50}% ${heroData.mediaCropY ?? 50}%` }} muted autoPlay loop playsInline />
                  ) : heroData.mediaType === "image" && heroData.mediaUrl ? (
                    <img src={heroData.mediaUrl} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `${heroData.mediaCropX ?? 50}% ${heroData.mediaCropY ?? 50}%` }} alt="" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, var(--theme-background), var(--theme-surface))` }} />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0" style={{ backgroundColor: heroData.overlayColor === "dark" ? `rgba(0,0,0,${heroData.overlayOpacity / 100})` : `rgba(255,255,255,${heroData.overlayOpacity / 100})` }} />
                  {/* Text */}
                  <div className="relative z-10 w-full h-full flex flex-col justify-center items-center p-8" style={{ textAlign: (heroData.titleStyle?.textAlign || "center") as any }}>
                    <h1 
                      className="leading-tight tracking-tighter"
                      style={{
                        transition: heroData.textFadeInEnabled ? `opacity ${heroData.textFadeInDuration || 900}ms ease` : undefined,
                        fontSize: `${heroData.titleStyle?.fontSize || 32}px`,
                        fontWeight: heroData.titleStyle?.fontWeight || "bold",
                        color: heroData.titleStyle?.color || "#ffffff",
                        textTransform: (heroData.titleStyle?.textTransform || "none") as any,
                        letterSpacing: `${heroData.titleStyle?.letterSpacing || 1}px`,
                        lineHeight: `${heroData.titleStyle?.lineHeight || 1.4}`,
                        opacity: heroData.titleStyle?.opacity || 1,
                        textShadow: heroData.titleStyle?.textShadow
                          ? `${heroData.titleStyle?.shadowOffsetX || 2}px ${heroData.titleStyle?.shadowOffsetY || 2}px ${heroData.titleStyle?.shadowBlur || 8}px ${heroData.titleStyle?.shadowColor || "rgba(0,0,0,0.5)"}`
                          : "none",
                      }}
                    >
                      {heroData.title}
                    </h1>
                    <div 
                      className="font-extrabold tracking-tighter leading-tight my-2 transition-opacity duration-300"
                      style={{
                        fontSize: `${heroData.subtitleStyle?.fontSize || 28}px`,
                        color: heroData.rotatingWordsStyle?.textColor || "#FFD700",
                        backgroundColor: heroData.rotatingWordsStyle?.showBackground 
                          ? (heroData.rotatingWordsStyle?.backgroundColor || "transparent")
                          : "transparent",
                        padding: heroData.rotatingWordsStyle?.showBackground
                          ? `${heroData.rotatingWordsStyle?.paddingY || 4}px ${heroData.rotatingWordsStyle?.paddingX || 8}px`
                          : "0",
                        borderRadius: `${heroData.rotatingWordsStyle?.borderRadius || 4}px`,
                        display: "inline-block",
                        opacity: 0.7,
                      }}
                    >
                      {heroData.rotatingWords[currentWordIndex] || "Discover"}
                    </div>
                    <p className="text-sm md:text-lg text-white/80 font-light mt-2" style={{ color: heroData.subtitleStyle?.color || "#ffffff" }}>
                      {heroData.subtitle}
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                      <Button 
                        size="sm" 
                        style={{
                          backgroundColor: heroData.button1BgColor || "#FFD700",
                          color: heroData.button1Style?.color || "#000000",
                          fontSize: `${heroData.button1Style?.fontSize || 14}px`,
                          fontWeight: heroData.button1Style?.fontWeight || "bold",
                        }}
                      >
                        {heroData.buttonText1}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        style={{
                          backgroundColor: heroData.button2BgColor || "transparent",
                          color: heroData.button2Style?.color || "#ffffff",
                          borderColor: "rgba(255,255,255,0.5)",
                          fontSize: `${heroData.button2Style?.fontSize || 14}px`,
                          fontWeight: heroData.button2Style?.fontWeight || "bold",
                        }}
                      >
                        {heroData.buttonText2}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {/* Featured Image */}
                  {heroData.featuredImageUrl && (
                    <div>
                      <p className="text-xs text-white/50 mb-1">الصورة المميزة (الخامسة)</p>
                      <div className="aspect-video bg-black/20 rounded border-2 border-[var(--theme-primary)]/50 relative overflow-hidden">
                        {isVideoUrl(heroData.featuredImageUrl) ? (
                          <video src={heroData.featuredImageUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                        ) : (
                          <img src={heroData.featuredImageUrl} className="w-full h-full object-cover" alt="Featured" />
                        )}
                      </div>
                    </div>
                  )}
                  {/* Grid Images */}
                  <div>
                    <p className="text-xs text-white/50 mb-1">صور الشبكة (4 صور)</p>
                    <div className="grid grid-cols-4 gap-2">
                      {heroImages.map(img => (
                        <div key={img.id} className="aspect-video bg-black/20 rounded border-2 border-transparent hover:border-[var(--theme-primary)] cursor-pointer relative overflow-hidden group">
                          {img.url ? (
                            isVideoUrl(img.url) ? <video src={img.url} className="w-full h-full object-cover" muted autoPlay loop playsInline /> : <img src={img.url} className="w-full h-full object-cover" alt="" />
                          ) : <div className="w-full h-full bg-gray-800 flex items-center justify-center"><ImageIcon className="text-gray-600" /></div>}
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs font-bold text-white leading-tight">{img.label}</p>
                            <p className="text-[10px] text-white/70 leading-tight">{img.sublabel}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ═══ Sub-Pages Hero Tab ═══ */}
        <TabsContent value="subpages" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">تخصيص Hero Section فريد لكل صفحة فرعية مع 3 تخطيطات مختلفة</p>
            <div className="flex items-center gap-3">
              {subHasChanges && <div className="flex items-center gap-2 text-yellow-400"><AlertCircle size={16} /><span className="text-sm">تغييرات غير محفوظة</span></div>}
              <Button onClick={saveSubHeroes} disabled={subSaving || !subHasChanges} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold">
                {subSaving ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Save size={16} className="ml-2" />}
                {subSaving ? "جاري الحفظ..." : "حفظ الصفحات الفرعية"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Page selector */}
            <div className="lg:col-span-1 space-y-2">
              {SUB_PAGES.map(page => (
                <button
                  key={page.id}
                  onClick={() => setActiveSubPage(page.id)}
                  className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSubPage === page.id ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <p>{page.label}</p>
                  <p className="text-xs opacity-60">{page.labelAr}</p>
                </button>
              ))}
            </div>

            {/* Editor */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{SUB_PAGES.find(p => p.id === activeSubPage)?.label} Hero</CardTitle>
                  <CardDescription className="text-white/50">اختر التخطيط وخصص المحتوى</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Layout selector */}
                  <div>
                    <Label className="text-white/70 text-sm mb-3 block">التخطي��</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "centered" as const, label: "نص متمركز", desc: "نص نظيف فوق خلفية بسيطة", icon: Monitor },
                        { value: "split" as const, label: "شاشة مقسمة", desc: "نص يسار، صورة يمين", icon: Columns2 },
                        { value: "fullbleed" as const, label: "خلفية كاملة", desc: "نص فوق صورة/فيديو كبير", icon: Maximize },
                      ].map(layout => (
                        <button
                          key={layout.value}
                          onClick={() => updateSubHero(activeSubPage, { layout: layout.value })}
                          className={`p-4 rounded-lg border text-right transition-all ${
                            currentSubHero.layout === layout.value
                              ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          <layout.icon size={24} className={currentSubHero.layout === layout.value ? "text-[var(--theme-primary)]" : "text-white/40"} />
                          <p className="text-sm font-medium text-white mt-2">{layout.label}</p>
                          <p className="text-xs text-white/40 mt-1">{layout.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/70 text-sm">العنوان</Label>
                      <Input value={currentSubHero.title} onChange={e => updateSubHero(activeSubPage, { title: e.target.value })} className="bg-black/40 border-white/10 text-white mt-1" placeholder={SUB_PAGES.find(p => p.id === activeSubPage)?.label || ""} />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">العنوان الفرعي</Label>
                      <Input value={currentSubHero.subtitle} onChange={e => updateSubHero(activeSubPage, { subtitle: e.target.value })} className="bg-black/40 border-white/10 text-white mt-1" placeholder="وصف مختصر..." />
                    </div>
                  </div>

                  {/* Media */}
                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">نوع الخلفية</Label>
                    <Select value={currentSubHero.mediaType} onValueChange={(v) => updateSubHero(activeSubPage, { mediaType: v as SubPageHero["mediaType"] })}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gradient">تدرج لوني</SelectItem>
                        <SelectItem value="image">صورة</SelectItem>
                        <SelectItem value="video">فيديو</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentSubHero.mediaType === "gradient" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70 text-sm">لون البداية</Label>
                        <div className="flex gap-2 items-center mt-1">
                          <input type="color" value={currentSubHero.gradientFrom} onChange={e => updateSubHero(activeSubPage, { gradientFrom: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-white/10" />
                          <Input value={currentSubHero.gradientFrom} onChange={e => updateSubHero(activeSubPage, { gradientFrom: e.target.value })} className="bg-black/40 border-white/10 text-white text-xs font-mono" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">لون النهاية</Label>
                        <div className="flex gap-2 items-center mt-1">
                          <input type="color" value={currentSubHero.gradientTo} onChange={e => updateSubHero(activeSubPage, { gradientTo: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-white/10" />
                          <Input value={currentSubHero.gradientTo} onChange={e => updateSubHero(activeSubPage, { gradientTo: e.target.value })} className="bg-black/40 border-white/10 text-white text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSubHero.mediaType !== "gradient" && (
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                      <div>
                        <Label className="text-white/70 text-sm mb-2 block">رفع الوسائط</Label>
                        <input type="file" accept={currentSubHero.mediaType === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_MEDIA_TYPES} onChange={handleSubMediaUpload} className="hidden" id="sub-hero-media" disabled={uploadingSubMedia} />
                        <label htmlFor="sub-hero-media" className={`flex items-center justify-center gap-2 px-4 py-6 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-2 border-dashed border-[var(--theme-primary)]/30 rounded-lg cursor-pointer hover:bg-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)]/50 transition-colors ${uploadingSubMedia ? "opacity-60 cursor-not-allowed" : ""}`}>
                          <div className="flex flex-col items-center gap-2">
                            {uploadingSubMedia ? (
                              <>
                                <Loader2 size={24} className="animate-spin" />
                                <span className="text-sm">جاري الرفع إلى Firebase Storage...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={24} />
                                <span className="text-sm">{currentSubHero.mediaType === "video" ? "انقر لرفع فيديو أو اسحب الملف هنا" : "انقر لرفع صورة أو اسحب الملف هنا"}</span>
                                <span className="text-xs text-white/50">{currentSubHero.mediaType === "video" ? "MP4, WebM (حد أقصى 10MB)" : "JPEG, PNG, WebP, GIF (حد أقصى 10MB)"}</span>
                              </>
                            )}
                          </div>
                        </label>
                      </div>

                      {currentSubHero.mediaUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/60">معاينة الوسائط المرفوعة</p>
                            <button onClick={() => updateSubHero(activeSubPage, { mediaUrl: "" })} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                              <X size={12} /> إزالة
                            </button>
                          </div>
                          <div className="relative rounded-lg overflow-hidden border border-[var(--theme-primary)]/30 bg-black/30">
                            {isVideoUrl(currentSubHero.mediaUrl) ? (
                              <video src={currentSubHero.mediaUrl} className="w-full h-32 object-cover" muted autoPlay loop playsInline />
                            ) : (
                              <img src={currentSubHero.mediaUrl} className="w-full h-32 object-cover" alt="Hero Media" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label className="text-white/70 text-sm">شفافية التراكب: {currentSubHero.overlayOpacity}%</Label>
                    <Slider value={[currentSubHero.overlayOpacity]} onValueChange={([v]) => updateSubHero(activeSubPage, { overlayOpacity: v })} min={0} max={100} step={5} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Sub-page Preview */}
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2"><Eye size={18} /> معاينة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-white/10 relative" style={{ height: "200px" }}>
                    {/* Background */}
                    {currentSubHero.mediaType === "gradient" ? (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${currentSubHero.gradientFrom}, ${currentSubHero.gradientTo})` }} />
                    ) : currentSubHero.mediaType === "video" && currentSubHero.mediaUrl ? (
                      <video src={currentSubHero.mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted autoPlay loop playsInline />
                    ) : currentSubHero.mediaUrl ? (
                      <img src={currentSubHero.mediaUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${currentSubHero.gradientFrom}, ${currentSubHero.gradientTo})` }} />
                    )}
                    <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${currentSubHero.overlayOpacity / 100})` }} />

                    {/* Content by layout */}
                    <div className={`relative z-10 h-full flex ${
                      currentSubHero.layout === "centered" ? "items-center justify-center text-center" :
                      currentSubHero.layout === "split" ? "items-center" :
                      "items-center justify-center text-center"
                    }`}>
                      {currentSubHero.layout === "split" ? (
                        <div className="grid grid-cols-2 w-full h-full">
                          <div className="flex flex-col justify-center px-8">
                            <h2 className="text-2xl font-bold text-white">{currentSubHero.title || SUB_PAGES.find(p => p.id === activeSubPage)?.label}</h2>
                            <p className="text-sm text-white/70 mt-2">{currentSubHero.subtitle}</p>
                          </div>
                          <div className="bg-white/5" />
                        </div>
                      ) : (
                        <div className="px-8">
                          <h2 className="text-2xl font-bold text-white">{currentSubHero.title || SUB_PAGES.find(p => p.id === activeSubPage)?.label}</h2>
                          <p className="text-sm text-white/70 mt-2">{currentSubHero.subtitle}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
