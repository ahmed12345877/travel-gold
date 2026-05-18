import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Image,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Upload,
  Grid,
  List,
  Save,
  X,
  Star,
  Tag,
  FolderOpen,
} from "lucide-react";

interface GalleryImage {
  id: number;
  title: string;
  url: string;
  category: string;
  tags: string[];
  featured: boolean;
  order: number;
  createdAt: string;
}

const SAMPLE_IMAGES: GalleryImage[] = [
  {
    id: 1,
    title: "Pyramids at Sunset",
    url: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=300",
    category: "pyramids",
    tags: ["pyramids", "sunset", "giza"],
    featured: true,
    order: 1,
    createdAt: "2024-04-20",
  },
  {
    id: 2,
    title: "Nile Cruise",
    url: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=300",
    category: "nile",
    tags: ["nile", "cruise", "luxury"],
    featured: true,
    order: 2,
    createdAt: "2024-04-19",
  },
  {
    id: 3,
    title: "Luxor Temple",
    url: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=300",
    category: "temples",
    tags: ["luxor", "temple", "ancient"],
    featured: false,
    order: 3,
    createdAt: "2024-04-18",
  },
  {
    id: 4,
    title: "Red Sea Diving",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300",
    category: "activities",
    tags: ["diving", "red-sea", "coral"],
    featured: false,
    order: 4,
    createdAt: "2024-04-17",
  },
  {
    id: 5,
    title: "Desert Safari",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=300",
    category: "activities",
    tags: ["desert", "safari", "adventure"],
    featured: true,
    order: 5,
    createdAt: "2024-04-16",
  },
  {
    id: 6,
    title: "Abu Simbel",
    url: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=300",
    category: "temples",
    tags: ["abu-simbel", "temple", "aswan"],
    featured: false,
    order: 6,
    createdAt: "2024-04-15",
  },
];

const CATEGORIES = [
  "all",
  "pyramids",
  "nile",
  "temples",
  "activities",
  "luxury",
  "food",
];

export default function GalleryAdmin() {
  const [images, setImages] = useState<GalleryImage[]>(SAMPLE_IMAGES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    category: "pyramids",
    tags: "",
    featured: false,
  });

  const filtered = images.filter((img) => {
    const matchSearch =
      img.title.toLowerCase().includes(search.toLowerCase()) ||
      img.tags.some((t) => t.includes(search.toLowerCase()));
    const matchCategory =
      activeCategory === "all" || img.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    setEditingImage(null);
    setFormData({
      title: "",
      url: "",
      category: "pyramids",
      tags: "",
      featured: false,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (img: GalleryImage) => {
    setEditingImage(img);
    setFormData({
      title: img.title,
      url: img.url,
      category: img.category,
      tags: img.tags.join(", "),
      featured: img.featured,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (editingImage) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === editingImage.id ? { ...img, ...formData, tags } : img,
        ),
      );
    } else {
      setImages((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...formData,
          tags,
          order: prev.length + 1,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setIsDialogOpen(false);
  };

  const deleteImage = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
      setImages((prev) => prev.filter((img) => img.id !== id));
    }
  };

  const toggleFeatured = (id: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, featured: !img.featured } : img,
      ),
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Image className="text-[var(--theme-primary)]" size={24} />
            إدارة المعرض
          </h1>
          <p className="text-white/50 text-sm mt-1">
            رفع وتنظيم الصور في المعرض
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openCreate}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
          >
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
          <p className="text-2xl font-bold text-[var(--theme-primary)]">
            {images.filter((i) => i.featured).length}
          </p>
          <p className="text-xs text-white/50">مميزة</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {new Set(images.map((i) => i.category)).size}
          </p>
          <p className="text-xs text-white/50">تصنيفات</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {new Set(images.flatMap((i) => i.tags)).size}
          </p>
          <p className="text-xs text-white/50">وسوم</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
            size={16}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[var(--theme-surface)] border-white/10 text-white pr-10"
            placeholder="البحث..."
          />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--theme-primary)] text-black"
                  : "bg-white/5 text-white/50 hover:text-white/80"
              }`}
            >
              {cat === "all" ? "الكل" : cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[var(--theme-surface)] border border-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30"}`}
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30"}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img) => (
            <div
              key={img.id}
              className="group bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden hover:border-[var(--theme-primary)]/20 transition-colors"
            >
              <div className="relative aspect-[4/3] bg-[#1a1a1a]">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
                {img.featured && (
                  <span className="absolute top-2 right-2 bg-[var(--theme-primary)] text-black text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                    مميزة
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEdit(img)}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                  >
                    <Edit2 size={16} className="text-white" />
                  </button>
                  <button
                    onClick={() => toggleFeatured(img.id)}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                  >
                    <Star
                      size={16}
                      className={
                        img.featured
                          ? "text-[var(--theme-primary)] fill-[var(--theme-primary)]"
                          : "text-white"
                      }
                    />
                  </button>
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="p-2 bg-white/10 rounded-lg hover:bg-red-500/30"
                  >
                    <Trash2 size={16} className="text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white truncate">
                  {img.title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Tag size={10} className="text-white/30" />
                  <p className="text-[10px] text-white/30 truncate">
                    {img.tags.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right text-xs text-white/50 p-3">الصورة</th>
                <th className="text-right text-xs text-white/50 p-3">
                  العنوان
                </th>
                <th className="text-right text-xs text-white/50 p-3">
                  التصنيف
                </th>
                <th className="text-right text-xs text-white/50 p-3">الوسوم</th>
                <th className="text-right text-xs text-white/50 p-3">مميزة</th>
                <th className="text-right text-xs text-white/50 p-3">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((img) => (
                <tr
                  key={img.id}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="p-3">
                    <img
                      src={img.url}
                      alt=""
                      className="w-12 h-9 object-cover rounded"
                    />
                  </td>
                  <td className="p-3 text-sm text-white">{img.title}</td>
                  <td className="p-3 text-xs text-white/50">{img.category}</td>
                  <td className="p-3 text-xs text-white/30">
                    {img.tags.join(", ")}
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleFeatured(img.id)}>
                      <Star
                        size={14}
                        className={
                          img.featured
                            ? "text-[var(--theme-primary)] fill-[var(--theme-primary)]"
                            : "text-white/20"
                        }
                      />
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(img)}
                        className="p-1 text-white/30 hover:text-[var(--theme-primary)]"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteImage(img.id)}
                        className="p-1 text-white/30 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingImage ? "تعديل الصورة" : "رفع صورة جديدة"}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white mb-1">
                  عنوان الصورة
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  placeholder="عنوان الصورة"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  رابط الصورة أو رفع ملف
                </label>
                <Input
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">التصنيف</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                >
                  {CATEGORIES.filter((c) => c !== "all").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  الوسوم (مفصولة بفواصل)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  placeholder="pyramids, sunset, giza"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="rounded border-white/20"
                  id="featured"
                />
                <label htmlFor="featured" className="text-sm text-white/60">
                  صورة مميزة
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
              >
                <Save size={16} className="ml-2" />
                {editingImage ? "حفظ التعديلات" : "رفع الصورة"}
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
