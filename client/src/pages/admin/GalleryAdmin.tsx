import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Image, Plus, Search, Edit2, Trash2, Eye, Upload, Grid, List,
  Save, X, Star, Tag, FolderOpen
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { buildMutationCallbacks } from "@/hooks/useAdminCrud";

interface GalleryImage {
  id: number;
  title: string;
  titleAr?: string;
  imageUrl: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  categoryAr?: string;
  location?: string;
  locationAr?: string;
  featured: "yes" | "no";
  aspect: "landscape" | "portrait" | "square";
  sortOrder: number;
  createdAt?: string;
  isVisible?: "visible" | "hidden";
}

const CATEGORIES = ["all", "luxury", "safari", "beach", "cuisine", "culture", "adventure"];

export default function GalleryAdmin() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    imageUrl: "",
    description: "",
    descriptionAr: "",
    category: "luxury",
    categoryAr: "",
    location: "",
    locationAr: "",
    featured: "no" as "yes" | "no",
    aspect: "landscape" as "landscape" | "portrait" | "square",
  });

  // Fetch gallery items from database
  const { data: images = [], isLoading, refetch } = (trpc.gallery.listAll.useQuery(
    { limit: 200, offset: 0 },
    { staleTime: 5 * 60 * 1000 }
  )) as any;

  // Mutations
  const createMutation = trpc.gallery.create.useMutation(
    buildMutationCallbacks({ successMessage: "تم إضافة الصورة بنجاح", errorMessage: "خطأ في إضافة الصورة", refetch, onSuccess: () => setIsDialogOpen(false) }),
  );

  const updateMutation = trpc.gallery.update.useMutation(
    buildMutationCallbacks({ successMessage: "تم تحديث الصورة بنجاح", errorMessage: "خطأ في تحديث الصورة", refetch, onSuccess: () => { setIsDialogOpen(false); setEditingImage(null); } }),
  );

  const deleteMutation = trpc.gallery.delete.useMutation(
    buildMutationCallbacks({ successMessage: "تم حذف الصورة بنجاح", errorMessage: "خطأ في حذف الصورة", refetch }),
  );

  const uploadMutation = trpc.gallery.uploadImage.useMutation({
    onSuccess: (result) => {
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      toast.success("تم رفع الصورة بنجاح");
    },
    onError: (error: unknown) => {
      console.error("[uploadMutation] Error:", error);
      toast.error("خطأ في رفع الصورة");
    },
  });

  const filtered = useMemo(() => {
    return images.filter((img: any) => {
      const matchSearch = img.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "all" || img.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [images, search, activeCategory]);

  const openCreate = () => {
    setEditingImage(null);
    setFormData({
      title: "",
      titleAr: "",
      imageUrl: "",
      description: "",
      descriptionAr: "",
      category: "luxury",
      categoryAr: "",
      location: "",
      locationAr: "",
      featured: "no",
      aspect: "landscape",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (img: GalleryImage) => {
    setEditingImage(img);
    setFormData({
      title: img.title,
      titleAr: img.titleAr || "",
      imageUrl: img.imageUrl,
      description: img.description || "",
      descriptionAr: img.descriptionAr || "",
      category: img.category,
      categoryAr: img.categoryAr || "",
      location: img.location || "",
      locationAr: img.locationAr || "",
      featured: img.featured,
      aspect: img.aspect,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast.error("العنوان والصورة مطلوبة");
      return;
    }

    if (editingImage) {
      await updateMutation.mutateAsync({
        id: editingImage.id,
        title: formData.title,
        titleAr: formData.titleAr,
        imageUrl: formData.imageUrl,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        category: formData.category,
        categoryAr: formData.categoryAr,
        location: formData.location,
        locationAr: formData.locationAr,
        featured: formData.featured,
        aspect: formData.aspect,
      });
    } else {
      await createMutation.mutateAsync({
        title: formData.title,
        titleAr: formData.titleAr,
        imageUrl: formData.imageUrl,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        category: formData.category,
        categoryAr: formData.categoryAr,
        location: formData.location,
        locationAr: formData.locationAr,
        featured: formData.featured,
        aspect: formData.aspect,
      });
    }
  };

  const deleteImage = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 10 ميجابايت");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(",")[1];
      await uploadMutation.mutateAsync({
        fileData: base64Data,
        filename: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Image className="text-[var(--theme-primary)]" size={24} />
            إدارة المعرض
          </h1>
          <p className="text-white/50 text-sm mt-1">رفع وتنظيم الصور في المعرض</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreate} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold">
            <Upload size={16} className="ml-2" />
            رفع صورة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{images.length}</p>
          <p className="text-xs text-white/50">إجمالي الصور</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[var(--theme-primary)]">{images.filter((i: any) => i.featured === "yes").length}</p>
          <p className="text-xs text-white/50">مميزة</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{new Set(images.map((i: any) => i.category)).size}</p>
          <p className="text-xs text-white/50">تصنيفات</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{isLoading ? "..." : images.length}</p>
          <p className="text-xs text-white/50">معالجة</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white pr-10" placeholder="البحث..." />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                activeCategory === cat ? "bg-[var(--theme-primary)] text-black" : "bg-white/5 text-white/50 hover:text-white/80"
              }`}
            >
              {cat === "all" ? "الكل" : cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[var(--theme-surface)] border border-white/5 rounded-lg p-1">
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30"}`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30"}`}>
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center text-white/50">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center text-white/50">لا توجد صور</div>
          ) : (
            filtered.map((img: any) => (
              <div key={img.id} className="group bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden hover:border-[var(--theme-primary)]/20 transition-colors">
                <div className="relative aspect-[4/3] bg-[#1a1a1a]">
                  <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                  {img.featured === "yes" && (
                    <span className="absolute top-2 right-2 bg-[var(--theme-primary)] text-black text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                      مميزة
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(img)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                      <Edit2 size={16} className="text-white" />
                    </button>
                    <button 
                      onClick={() => updateMutation.mutate({
                        id: img.id,
                        featured: img.featured === "yes" ? "no" : "yes",
                      })}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                    >
                      <Star size={16} className={img.featured === "yes" ? "text-[var(--theme-primary)] fill-[var(--theme-primary)]" : "text-white"} />
                    </button>
                    <button onClick={() => deleteImage(img.id)} className="p-2 bg-white/10 rounded-lg hover:bg-red-500/30">
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-white truncate">{img.title}</p>
                  <p className="text-[10px] text-white/30 mt-1">{img.category}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right text-xs text-white/50 p-3">الصورة</th>
                <th className="text-right text-xs text-white/50 p-3">العنوان</th>
                <th className="text-right text-xs text-white/50 p-3">التصنيف</th>
                <th className="text-right text-xs text-white/50 p-3">مميزة</th>
                <th className="text-right text-xs text-white/50 p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-white/50">جاري التحميل...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-white/50">لا توجد صور</td>
                </tr>
              ) : (
                filtered.map((img: any) => (
                  <tr key={img.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3"><img src={img.imageUrl} alt="" className="w-12 h-9 object-cover rounded" /></td>
                    <td className="p-3 text-sm text-white">{img.title}</td>
                    <td className="p-3 text-xs text-white/50">{img.category}</td>
                    <td className="p-3">
                      <button 
                        onClick={() => updateMutation.mutate({
                          id: img.id,
                          featured: img.featured === "yes" ? "no" : "yes",
                        })}
                      >
                        <Star size={14} className={img.featured === "yes" ? "text-[var(--theme-primary)] fill-[var(--theme-primary)]" : "text-white/20"} />
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(img)} className="p-1 text-white/30 hover:text-[var(--theme-primary)]"><Edit2 size={14} /></button>
                        <button onClick={() => deleteImage(img.id)} className="p-1 text-white/30 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingImage ? "تع��يل الصورة" : "رفع صورة جديدة"}</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white mb-1">عنوان الصورة</label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="bg-[#1a1a1a] border-white/10 text-white" 
                  placeholder="عنوان الصورة" 
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">عنوان الصورة (العربية)</label>
                <Input 
                  value={formData.titleAr} 
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} 
                  className="bg-[#1a1a1a] border-white/10 text-white" 
                  placeholder="العنوان بالعربية" 
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الصورة</label>
                {formData.imageUrl && (
                  <div className="mb-2 relative w-full aspect-video rounded-lg overflow-hidden">
                    <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center justify-center w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-md cursor-pointer hover:border-white/20 transition-colors">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                    disabled={uploadMutation.isPending}
                  />
                  <Upload size={16} className="mr-2 text-white/60" />
                  <span className="text-sm text-white/60">
                    {uploadMutation.isPending ? "جاري الرفع..." : "اختر صورة"}
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الوصف</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm" 
                  placeholder="وصف الصورة"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الوصف (العربية)</label>
                <textarea 
                  value={formData.descriptionAr} 
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} 
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm" 
                  placeholder="الوصف بالعربية"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white mb-1">التصنيف</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                  >
                    {CATEGORIES.filter(c => c !== "all").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">الاتجاه</label>
                  <select 
                    value={formData.aspect} 
                    onChange={(e) => setFormData({ ...formData, aspect: e.target.value as "landscape" | "portrait" | "square" })} 
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="landscape">أفقي</option>
                    <option value="portrait">عمودي</option>
                    <option value="square">مربع</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.featured === "yes"} 
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? "yes" : "no" })} 
                  className="rounded border-white/20" 
                  id="featured" 
                />
                <label htmlFor="featured" className="text-sm text-white/60">صورة مميزة</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleSave} 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
              >
                <Save size={16} className="ml-2" />
                {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : (editingImage ? "حفظ التعديلات" : "رفع الصورة")}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="border-white/10 text-white/60">إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
