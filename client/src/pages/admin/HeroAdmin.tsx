import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Save, AlertCircle, Eye, ImageIcon, Type, Link2, Sparkles, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface HeroImage {
  id: number;
  url: string;
  label: string;
  sublabel: string;
  link: string;
}

interface HeroData {
  title: string;
  rotatingWords: string[];
  subtitle: string;
  buttonText1: string;
  buttonText2: string;
  buttonLink1: string;
  buttonLink2: string;
}

export default function HeroAdmin() {
  const [heroData, setHeroData] = useState<HeroData>({
    title: "VANIR GROUP — LUXURY TRAVEL",
    rotatingWords: ["Discover", "Explore", "Experience"],
    subtitle: "Egypt's Wonders",
    buttonText1: "Begin Your Journey",
    buttonText2: "Explore Gallery",
    buttonLink1: "/booking",
    buttonLink2: "/gallery",
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

  const { data: savedData, isLoading: isLoadingData } = trpc.siteSettings.get.useQuery({ category: "hero", key: "hero_data" }, { staleTime: 30000 });
  const { data: savedImages, isLoading: isLoadingImages } = trpc.siteSettings.get.useQuery({ category: "hero", key: "hero_images" }, { staleTime: 30000 });
  const setMut = trpc.siteSettings.set.useMutation();

  useEffect(() => { if (savedData) { try { const p = JSON.parse(savedData); setHeroData(p); } catch {} } }, [savedData]);
  useEffect(() => { if (savedImages) { try { const p = JSON.parse(savedImages); if (Array.isArray(p) && p.length > 0) setHeroImages(p); } catch {} } }, [savedImages]);

  const saveToDb = useCallback(async () => {
    setSaving(true);
    try {
      await setMut.mutateAsync({ category: "hero", key: "hero_data", value: JSON.stringify(heroData) });
      await setMut.mutateAsync({ category: "hero", key: "hero_images", value: JSON.stringify(heroImages) });
      setHasChanges(false);
      toast.success("تم الحفظ في قاعدة البيانات");
    } catch {
      toast.error("فشل في الحفظ");
    }
    finally { setSaving(false); }
  }, [setMut, heroData, heroImages]);

  const markData = (data: HeroData) => { setHeroData(data); setHasChanges(true); };
  const markImages = (images: HeroImage[]) => { setHeroImages(images); setHasChanges(true); };

  const handleImageUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        markImages(heroImages.map(img => img.id === id ? { ...img, url: result } : img));
      };
      reader.readAsDataURL(file);
    }
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
    markData({
      ...heroData,
      rotatingWords: heroData.rotatingWords.filter((_, i) => i !== index),
    });
  };

  const tabs = [
    { id: "text" as const, label: "النصوص", icon: Type },
    { id: "images" as const, label: "الصور", icon: ImageIcon },
    { id: "buttons" as const, label: "الأزرار", icon: Link2 },
  ];

  if (isLoadingData || isLoadingImages) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[var(--theme-primary)]" size={48} /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-[var(--theme-primary)]" size={24} />
            إدارة Hero Section
          </h1>
          <p className="text-white/50 text-sm mt-1">تعديل صورة الخلفية والنصوص والأزرار في الواجهة الرئيسية</p>
        </div>
        <div className="flex items-center gap-4">
          {hasChanges && <div className="flex items-center gap-2 text-yellow-400"><AlertCircle size={16} /><span>تغييرات غير محفوظة</span></div>}
          <Button
            onClick={saveToDb}
            disabled={saving || !hasChanges}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
          >
            {saving ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Save size={16} className="ml-2" />}
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-b-2 border-[var(--theme-primary)]"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-4 bg-[var(--theme-surface)] border border-white/5 rounded-lg p-6">
          {activeTab === "text" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">النصوص الرئيسية</h3>

              <div>
                <label className="block text-sm font-medium text-white mb-2">العنوان الرئيسي</label>
                <Input
                  value={heroData.title}
                  onChange={(e) => markData({ ...heroData, title: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  placeholder="VANIR GROUP — LUXURY TRAVEL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">الكلمات المتغيرة (Rotating Words)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {heroData.rotatingWords.map((word, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-3 py-1 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-full text-sm border border-[var(--theme-primary)]/20"
                    >
                      {word}
                      <button
                        onClick={() => removeRotatingWord(i)}
                        className="ml-1 text-[var(--theme-primary)]/60 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addRotatingWord()}
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    placeholder="أضف كلمة جديدة..."
                  />
                  <Button onClick={addRotatingWord} variant="outline" className="border-[var(--theme-primary)]/20 text-[var(--theme-primary)]">
                    إضافة
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">العنوان الفرعي</label>
                <Input
                  value={heroData.subtitle}
                  onChange={(e) => markData({ ...heroData, subtitle: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  placeholder="Egypt's Wonders"
                />
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">صور الـ Hero (4 صور)</h3>
              {heroImages.map((img) => (
                <div key={img.id} className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--theme-primary)]">صورة #{img.id}</span>
                    {img.url && (
                      <img src={img.url} alt="" className="w-16 h-10 object-cover rounded" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(img.id, e)}
                      className="hidden"
                      id={`hero-img-${img.id}`}
                    />
                    <label
                      htmlFor={`hero-img-${img.id}`}
                      className="flex items-center gap-2 px-3 py-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 rounded-lg cursor-pointer hover:bg-[var(--theme-primary)]/20 transition-colors text-sm w-fit"
                    >
                      <Upload size={14} />
                      {img.url ? "تغيير الصورة" : "اختر صورة"}
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-white/50 mb-1">العنوان</label>
                      <Input
                        value={img.label}
                        onChange={(e) => updateImage(img.id, "label", e.target.value)}
                        className="bg-[var(--theme-surface)] border-white/10 text-white text-sm h-8"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">العنوان الفرعي</label>
                      <Input
                        value={img.sublabel}
                        onChange={(e) => updateImage(img.id, "sublabel", e.target.value)}
                        className="bg-[var(--theme-surface)] border-white/10 text-white text-sm h-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">الرابط</label>
                    <Input
                      value={img.link}
                      onChange={(e) => updateImage(img.id, "link", e.target.value)}
                      className="bg-[var(--theme-surface)] border-white/10 text-white text-sm h-8"
                    />
                  </div>
                </div>
              ))}
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
                    <Input
                      value={heroData.buttonText1}
                      onChange={(e) => markData({ ...heroData, buttonText1: e.target.value })}
                      className="bg-[var(--theme-surface)] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">الرابط</label>
                    <Input
                      value={heroData.buttonLink1}
                      onChange={(e) => markData({ ...heroData, buttonLink1: e.target.value })}
                      className="bg-[var(--theme-surface)] border-white/10 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-[var(--theme-primary)]">الزر الثاني (ثانوي)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">النص</label>
                    <Input
                      value={heroData.buttonText2}
                      onChange={(e) => markData({ ...heroData, buttonText2: e.target.value })}
                      className="bg-[var(--theme-surface)] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">الرابط</label>
                    <Input
                      value={heroData.buttonLink2}
                      onChange={(e) => markData({ ...heroData, buttonLink2: e.target.value })}
                      className="bg-[var(--theme-surface)] border-white/10 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="bg-[var(--theme-surface)] border-white/5 rounded-lg p-4 lg:p-0 lg:bg-transparent lg:border-none">
          <div className="sticky top-24">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="text-[var(--theme-primary)]" size={20} />
              معاينة حية
            </h3>
            <div className="aspect-[16/9] bg-black rounded-lg overflow-hidden border-2 border-[var(--theme-primary)]">
              {/* This is a simplified preview. The actual component is in src/components/Hero.tsx */}
              <div className="w-full h-full bg-cover bg-center relative text-white flex flex-col justify-center items-center text-center p-8" style={{backgroundImage: `url(${heroImages.find(img => img.id === 1)?.url || '/placeholder.svg'})`}}>
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10">
                  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight">
                    {heroData.title.split(" — ")[0]} — <span className="text-[var(--theme-primary)]">{heroData.title.split(" — ")[1]}</span>
                  </h1>
                  <div className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight my-2 h-16">
                    {/* Simplified rotating words preview */}
                    <span className="text-white">{heroData.rotatingWords[0]}</span>
                  </div>
                  <p className="text-xl md:text-2xl text-white/80 font-light mt-4">{heroData.subtitle}</p>
                  <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-bold text-lg px-8 py-6">
                      {heroData.buttonText1}
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 hover:text-white font-bold text-lg px-8 py-6">
                      {heroData.buttonText2}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {heroImages.map(img => (
                <div key={img.id} className="aspect-video bg-black/20 rounded border-2 border-transparent hover:border-[var(--theme-primary)] cursor-pointer relative overflow-hidden group">
                  {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center"><ImageIcon className="text-gray-600" /></div>}
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
  );
}
