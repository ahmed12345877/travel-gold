import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquareQuote,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Save,
  X,
  User,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  content: string;
  rating: number;
  trip: string;
  featured: boolean;
  createdAt: string;
}

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    location: "",
    avatar: "",
    content: "",
    rating: 5,
    trip: "",
    featured: false,
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { data: saved, isLoading } = trpc.siteSettings.get.useQuery(
    { category: "testimonials", key: "testimonials_data" },
    { staleTime: 30000 },
  );
  const setMut = trpc.siteSettings.set.useMutation();

  useEffect(() => {
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) {
          setTestimonials(p);
        }
      } catch {}
    }
  }, [saved]);

  const saveToDb = useCallback(
    async (items: Testimonial[]) => {
      setSaving(true);
      try {
        await setMut.mutateAsync({
          category: "testimonials",
          key: "testimonials_data",
          value: JSON.stringify(items),
        });
        setHasChanges(false);
        toast.success("تم حفظ التغييرات في قاعدة البيانات");
      } catch {
        toast.error("فشل في حفظ التغييرات");
      } finally {
        setSaving(false);
      }
    },
    [setMut],
  );

  const mark = (items: Testimonial[]) => {
    setTestimonials(items);
    setHasChanges(true);
  };

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      role: "",
      location: "",
      avatar: "",
      content: "",
      rating: 5,
      trip: "",
      featured: false,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      location: item.location,
      avatar: item.avatar,
      content: item.content,
      rating: item.rating,
      trip: item.trip,
      featured: item.featured,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      mark(
        testimonials.map((t) =>
          t.id === editingItem.id ? { ...t, ...formData } : t,
        ),
      );
    } else {
      mark([
        ...testimonials,
        {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setIsDialogOpen(false);
  };

  const deleteItem = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الشهادة؟")) {
      mark(testimonials.filter((t) => t.id !== id));
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onChange?: (r: number) => void,
  ) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={() => interactive && onChange?.(i)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={14}
            className={
              i <= rating
                ? "text-[var(--theme-primary)] fill-[var(--theme-primary)]"
                : "text-white/10"
            }
          />
        </button>
      ))}
    </div>
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          className="animate-spin text-[var(--theme-primary)]"
          size={32}
        />
      </div>
    );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquareQuote
              className="text-[var(--theme-primary)]"
              size={24}
            />
            إدارة الشهادات والتقييمات
          </h1>
          <p className="text-white/50 text-sm mt-1">
            إضافة وتعديل شهادات العملاء
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <div className="flex items-center gap-2 text-amber-400/80 text-sm">
              <AlertTriangle size={16} />
              <span>تغييرات غير محفوظة</span>
            </div>
          )}
          <Button
            onClick={() => saveToDb(testimonials)}
            disabled={!hasChanges || saving}
            className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold border border-emerald-500/30"
          >
            {saving ? (
              <Loader2 size={16} className="ml-2 animate-spin" />
            ) : (
              <Save size={16} className="ml-2" />
            )}
            حفظ التغييرات
          </Button>
          <Button
            onClick={openCreate}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
          >
            <Plus size={16} className="ml-2" />
            إضافة شهادة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{testimonials.length}</p>
          <p className="text-xs text-white/50">إجمالي الشهادات</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[var(--theme-primary)]">
            {(testimonials.length > 0
              ? testimonials.reduce((a, t) => a + t.rating, 0) /
                testimonials.length
              : 0
            ).toFixed(1)}
          </p>
          <p className="text-xs text-white/50">متوسط التقييم</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {testimonials.filter((t) => t.featured).length}
          </p>
          <p className="text-xs text-white/50">مميزة</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
          size={16}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[var(--theme-surface)] border-white/10 text-white pr-10"
          placeholder="البحث عن شهادة..."
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className={`bg-[var(--theme-surface)] border rounded-lg p-5 ${t.featured ? "border-[var(--theme-primary)]/20" : "border-white/5"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center overflow-hidden">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-[var(--theme-primary)]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                  <p className="text-xs text-white/30">{t.location}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(t)}
                  className="p-1.5 text-white/30 hover:text-[var(--theme-primary)]"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteItem(t.id)}
                  className="p-1.5 text-white/30 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-3">
              "{t.content}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {renderStars(t.rating)}
                <span className="text-xs text-white/30">• {t.trip}</span>
              </div>
              {t.featured && (
                <span className="text-[10px] bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] px-2 py-0.5 rounded-full">
                  مميزة
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? "تعديل الشهادة" : "إضافة شهادة جديدة"}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white mb-1">الاسم</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    placeholder="اسم العميل"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">
                    المنصب
                  </label>
                  <Input
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    placeholder="CEO, Manager..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white mb-1">
                    الموقع
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    placeholder="New York, USA"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">
                    الرحلة
                  </label>
                  <Input
                    value={formData.trip}
                    onChange={(e) =>
                      setFormData({ ...formData, trip: e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    placeholder="Luxury Nile Cruise"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  رابط الصورة الشخصية
                </label>
                <Input
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  نص الشهادة
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  rows={3}
                  placeholder="ما قاله العميل..."
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">التقييم</label>
                {renderStars(formData.rating, true, (r) =>
                  setFormData({ ...formData, rating: r }),
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="rounded border-white/20"
                  id="testimonial-featured"
                />
                <label
                  htmlFor="testimonial-featured"
                  className="text-sm text-white/60"
                >
                  شهادة مميزة
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
              >
                <Save size={16} className="ml-2" />
                {editingItem ? "حفظ التعديلات" : "إضافة الشهادة"}
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="border-white/10 text-white/60"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
