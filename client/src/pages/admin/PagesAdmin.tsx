import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ExternalLink,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface PageItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: "published" | "draft" | "hidden";
  template: string;
  order: number;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

const INITIAL_PAGES: PageItem[] = [
  {
    id: 1,
    title: "الصفحة الرئيسية",
    slug: "/",
    description: "الصفحة الرئيسية للموقع",
    status: "published",
    template: "home",
    order: 1,
    parentId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-20",
  },
  {
    id: 2,
    title: "من نحن",
    slug: "/about",
    description: "صفحة من نحن",
    status: "published",
    template: "default",
    order: 2,
    parentId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-15",
  },
  {
    id: 3,
    title: "الوجهات",
    slug: "/destinations",
    description: "استكشف وجهاتنا السياحية",
    status: "published",
    template: "default",
    order: 3,
    parentId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-18",
  },
  {
    id: 4,
    title: "العروض",
    slug: "/offers",
    description: "عروض وحزم سياحية مميزة",
    status: "published",
    template: "default",
    order: 4,
    parentId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-19",
  },
  {
    id: 5,
    title: "المعرض",
    slug: "/gallery",
    description: "معرض الصور والفيديوهات",
    status: "published",
    template: "gallery",
    order: 5,
    parentId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-17",
  },
  {
    id: 6,
    title: "المدونة",
    slug: "/blog",
    description: "مقالات ونصائح سفر",
    status: "published",
    template: "blog",
    order: 6,
    parentId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-20",
  },
  {
    id: 7,
    title: "الحجز",
    slug: "/booking",
    description: "احجز رحلتك الآن",
    status: "published",
    template: "default",
    order: 7,
    parentId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-16",
  },
  {
    id: 8,
    title: "اتصل بنا",
    slug: "/contact",
    description: "تواصل معنا",
    status: "published",
    template: "default",
    order: 8,
    parentId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-14",
  },
  {
    id: 9,
    title: "AI Studio",
    slug: "/ai-studio",
    description: "أدوات الذكاء الاصطناعي",
    status: "published",
    template: "default",
    order: 9,
    parentId: null,
    createdAt: "2024-02-01",
    updatedAt: "2024-04-20",
  },
  {
    id: 10,
    title: "التسويق",
    slug: "/marketing",
    description: "أدوات التسويق الذكية",
    status: "published",
    template: "default",
    order: 10,
    parentId: null,
    createdAt: "2024-03-01",
    updatedAt: "2024-04-20",
  },
];

export default function PagesAdmin() {
  const [pages, setPages] = useState<PageItem[]>(INITIAL_PAGES);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: saved, isLoading } = trpc.siteSettings.get.useQuery(
    { category: "pages", key: "pages_structure" },
    { staleTime: 30000 },
  );
  const setMut = trpc.siteSettings.set.useMutation();

  useEffect(() => {
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) setPages(p);
      } catch {}
    }
  }, [saved]);

  const saveToDb = useCallback(
    async (items: PageItem[]) => {
      setSaving(true);
      try {
        await setMut.mutateAsync({
          category: "pages",
          key: "pages_structure",
          value: JSON.stringify(items),
        });
        setHasChanges(false);
        toast.success("تم حفظ بيانات الصفحات في قاعدة البيانات");
      } catch {
        toast.error("فشل في حفظ البيانات");
      } finally {
        setSaving(false);
      }
    },
    [setMut],
  );

  const mark = (items: PageItem[]) => {
    setPages(items);
    setHasChanges(true);
  };
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft" as "published" | "draft" | "hidden",
    template: "default",
  });

  const filteredPages = pages.filter(
    (p) => p.title.includes(search) || p.slug.includes(search),
  );

  const openCreate = () => {
    setEditingPage(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      status: "draft",
      template: "default",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (page: PageItem) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      description: page.description,
      status: page.status,
      template: page.template,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    let newPages: PageItem[];
    if (editingPage) {
      newPages = pages.map((p) =>
        p.id === editingPage.id
          ? {
              ...p,
              ...formData,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : p,
      );
    } else {
      const newPage: PageItem = {
        id: Math.max(...pages.map((p) => p.id)) + 1,
        ...formData,
        order: pages.length + 1,
        parentId: null,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      newPages = [...pages, newPage];
    }
    mark(newPages);
    setIsDialogOpen(false);
  };

  const deletePage = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الصفحة؟")) {
      mark(pages.filter((p) => p.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    mark(
      pages.map((p) => {
        if (p.id !== id) return p;
        const next = p.status === "published" ? "hidden" : "published";
        return { ...p, status: next };
      }),
    );
  };

  const moveUp = (id: number) => {
    const idx = pages.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    const newPages = [...pages];
    [newPages[idx - 1], newPages[idx]] = [newPages[idx], newPages[idx - 1]];
    newPages.forEach((p, i) => (p.order = i + 1));
    mark(newPages);
  };

  const moveDown = (id: number) => {
    const idx = pages.findIndex((p) => p.id === id);
    if (idx >= pages.length - 1) return;
    const newPages = [...pages];
    [newPages[idx], newPages[idx + 1]] = [newPages[idx + 1], newPages[idx]];
    newPages.forEach((p, i) => (p.order = i + 1));
    mark(newPages);
  };

  const generateSlug = (title: string) => {
    return (
      "/" +
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
    );
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      hidden: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    const labels: Record<string, string> = {
      published: "منشور",
      draft: "مسودة",
      hidden: "مخفي",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs border ${styles[status] || ""}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          className="animate-spin text-[var(--theme-primary)]"
          size={32}
        />
        <span className="mr-3 text-white/60">جاري تحميل الصفحات...</span>
      </div>
    );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-[var(--theme-primary)]" size={24} />
            إدارة الصفحات والروابط
          </h1>
          <p className="text-white/50 text-sm mt-1">
            إضافة وتعديل وحذف الصفحات وإدارة الروابط
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openCreate}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
          >
            <Plus size={16} className="ml-2" /> إضافة صفحة
          </Button>
          <Button
            onClick={() => saveToDb(pages)}
            disabled={saving || !hasChanges}
            className={
              hasChanges
                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                : "border-white/10 text-white/40"
            }
            variant={hasChanges ? "default" : "outline"}
          >
            {saving ? (
              <Loader2 size={16} className="ml-2 animate-spin" />
            ) : (
              <Save size={16} className="ml-2" />
            )}
            {saving ? "جاري الحفظ..." : hasChanges ? "حفظ التغييرات" : "محفوظ"}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-400" />
          <p className="text-sm text-amber-300">لديك تغييرات غير محفوظة.</p>
        </div>
      )}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2">
        <CheckCircle2 size={16} className="text-emerald-400" />
        <p className="text-xs text-white/60">
          البيانات محملة من قاعدة البيانات
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{pages.length}</p>
          <p className="text-xs text-white/50">إجمالي الصفحات</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {pages.filter((p) => p.status === "published").length}
          </p>
          <p className="text-xs text-white/50">منشورة</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {pages.filter((p) => p.status === "draft").length}
          </p>
          <p className="text-xs text-white/50">مسودة</p>
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
          placeholder="البحث عن صفحة..."
        />
      </div>

      {/* Pages Table */}
      <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-right text-xs text-white/50 p-3 w-8">#</th>
              <th className="text-right text-xs text-white/50 p-3">الصفحة</th>
              <th className="text-right text-xs text-white/50 p-3">الرابط</th>
              <th className="text-right text-xs text-white/50 p-3">القالب</th>
              <th className="text-right text-xs text-white/50 p-3">الحالة</th>
              <th className="text-right text-xs text-white/50 p-3">الترتيب</th>
              <th className="text-right text-xs text-white/50 p-3">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <tr
                key={page.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-3 text-white/30 text-sm">
                  <GripVertical size={14} />
                </td>
                <td className="p-3">
                  <p className="text-sm font-medium text-white">{page.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {page.description}
                  </p>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <code className="text-xs text-[var(--theme-primary)] bg-[var(--theme-primary)]/5 px-2 py-0.5 rounded">
                      {page.slug}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(page.slug)}
                      className="text-white/20 hover:text-white/60"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td className="p-3 text-xs text-white/50">{page.template}</td>
                <td className="p-3">{statusBadge(page.status)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(page.id)}
                      className="text-white/30 hover:text-white/70 p-0.5"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveDown(page.id)}
                      className="text-white/30 hover:text-white/70 p-0.5"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(page)}
                      className="p-1.5 text-white/40 hover:text-[var(--theme-primary)] transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => toggleStatus(page.id)}
                      className="p-1.5 text-white/40 hover:text-blue-400 transition-colors"
                    >
                      {page.status === "published" ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                    <a
                      href={page.slug}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-white/40 hover:text-emerald-400 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
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

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingPage ? "تعديل الصفحة" : "إضافة صفحة جديدة"}
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
                  عنوان الصفحة
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: editingPage
                        ? formData.slug
                        : generateSlug(e.target.value),
                    });
                  }}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  placeholder="عنوان الصفحة"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  الرابط (Slug)
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white font-mono text-sm"
                  placeholder="/page-slug"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الوصف</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  placeholder="وصف الصفحة (SEO)"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white mb-1">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "published"
                          | "draft"
                          | "hidden",
                      })
                    }
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                    <option value="hidden">مخفي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">
                    القالب
                  </label>
                  <select
                    value={formData.template}
                    onChange={(e) =>
                      setFormData({ ...formData, template: e.target.value })
                    }
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="default">افتراضي</option>
                    <option value="home">الرئيسية</option>
                    <option value="blog">مدونة</option>
                    <option value="gallery">معرض</option>
                    <option value="landing">صفحة هبوط</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
              >
                <Save size={16} className="ml-2" />
                {editingPage ? "حفظ التعديلات" : "إضافة الصفحة"}
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
