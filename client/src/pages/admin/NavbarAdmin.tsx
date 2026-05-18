import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Menu,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Save,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
  id: number;
  label: string;
  labelAr?: string;
  path: string;
  icon: string;
  visible: boolean;
  order: number;
  children: MenuItem[];
  isExternal: boolean;
  badge?: string;
}

const DEFAULT_MENU: MenuItem[] = [
  {
    id: 1,
    label: "HOME",
    labelAr: "الرئيسية",
    path: "/",
    icon: "🏠",
    visible: true,
    order: 1,
    children: [],
    isExternal: false,
  },
  {
    id: 2,
    label: "AI STUDIO",
    labelAr: "استوديو الذكاء",
    path: "/ai-studio",
    icon: "✨",
    visible: true,
    order: 2,
    children: [
      {
        id: 201,
        label: "AI Studio Home",
        labelAr: "الصفحة الرئيسية",
        path: "/ai-studio",
        icon: "🏠",
        visible: true,
        order: 1,
        children: [],
        isExternal: false,
      },
      {
        id: 202,
        label: "Image Generator",
        labelAr: "مولد الصور",
        path: "/ai-image-generator",
        icon: "🎨",
        visible: true,
        order: 2,
        children: [],
        isExternal: false,
      },
      {
        id: 203,
        label: "Marketing Suite",
        labelAr: "جناح التسويق",
        path: "/marketing",
        icon: "📢",
        visible: true,
        order: 3,
        children: [],
        isExternal: false,
      },
      {
        id: 204,
        label: "My Dashboard",
        labelAr: "لوحة التحكم",
        path: "/ai-dashboard",
        icon: "📊",
        visible: true,
        order: 4,
        children: [],
        isExternal: false,
      },
      {
        id: 205,
        label: "AI Pricing",
        labelAr: "أسعار AI",
        path: "/ai-pricing",
        icon: "💰",
        visible: true,
        order: 5,
        children: [],
        isExternal: false,
      },
    ],
    isExternal: false,
  },
  {
    id: 3,
    label: "DESTINATIONS",
    labelAr: "الوجهات",
    path: "/destinations",
    icon: "🗺️",
    visible: true,
    order: 3,
    children: [
      {
        id: 301,
        label: "View All",
        labelAr: "جميع الوجهات",
        path: "/destinations",
        icon: "🌍",
        visible: true,
        order: 1,
        children: [],
        isExternal: false,
      },
      {
        id: 302,
        label: "Book a Trip",
        labelAr: "حجز رحلة",
        path: "/booking",
        icon: "✈️",
        visible: true,
        order: 2,
        children: [],
        isExternal: false,
      },
      {
        id: 303,
        label: "Special Offers",
        labelAr: "عروض خاصة",
        path: "/offers",
        icon: "🏷️",
        visible: true,
        order: 3,
        children: [],
        isExternal: false,
      },
    ],
    isExternal: false,
  },
  {
    id: 4,
    label: "PROGRAMS",
    labelAr: "البرامج",
    path: "/programs",
    icon: "📋",
    visible: true,
    order: 4,
    children: [
      {
        id: 401,
        label: "View All",
        labelAr: "جميع البرامج",
        path: "/programs",
        icon: "📋",
        visible: true,
        order: 1,
        children: [],
        isExternal: false,
      },
      {
        id: 402,
        label: "Packages",
        labelAr: "الباقات",
        path: "/programs#packages",
        icon: "📦",
        visible: true,
        order: 2,
        children: [],
        isExternal: false,
      },
      {
        id: 403,
        label: "Hotels",
        labelAr: "الفنادق",
        path: "/programs#hotels",
        icon: "🏨",
        visible: true,
        order: 3,
        children: [],
        isExternal: false,
      },
      {
        id: 404,
        label: "Day Trips",
        labelAr: "رحلات يومية",
        path: "/programs#day-trips",
        icon: "🚌",
        visible: true,
        order: 4,
        children: [],
        isExternal: false,
      },
      {
        id: 405,
        label: "MICE",
        labelAr: "مؤتمرات",
        path: "/programs#mice",
        icon: "🎤",
        visible: true,
        order: 5,
        children: [],
        isExternal: false,
      },
      {
        id: 406,
        label: "Private Jet",
        labelAr: "طائرة خاصة",
        path: "/programs#private-jet",
        icon: "🛩️",
        visible: true,
        order: 6,
        children: [],
        isExternal: false,
      },
      {
        id: 407,
        label: "Fast Track",
        labelAr: "نقل المطار",
        path: "/programs#fast-track",
        icon: "🚗",
        visible: true,
        order: 7,
        children: [],
        isExternal: false,
      },
      {
        id: 408,
        label: "Visa",
        labelAr: "تأشيرات",
        path: "/programs#visa",
        icon: "🛂",
        visible: true,
        order: 8,
        children: [],
        isExternal: false,
      },
      {
        id: 409,
        label: "eSIM",
        labelAr: "شراء eSIM",
        path: "/programs#esim",
        icon: "📱",
        visible: true,
        order: 9,
        children: [],
        isExternal: false,
      },
    ],
    isExternal: false,
  },
  {
    id: 5,
    label: "SERVICES",
    labelAr: "الخدمات",
    path: "/services",
    icon: "⚙️",
    visible: true,
    order: 5,
    children: [
      {
        id: 501,
        label: "View All",
        labelAr: "جميع الخدمات",
        path: "/services",
        icon: "⚙️",
        visible: true,
        order: 1,
        children: [],
        isExternal: false,
      },
      {
        id: 502,
        label: "Flights",
        labelAr: "حجز طيران",
        path: "/services#flights",
        icon: "✈️",
        visible: true,
        order: 2,
        children: [],
        isExternal: false,
      },
      {
        id: 503,
        label: "Hotels",
        labelAr: "حجز فنادق",
        path: "/services#hotels",
        icon: "🏨",
        visible: true,
        order: 3,
        children: [],
        isExternal: false,
      },
      {
        id: 504,
        label: "Tours",
        labelAr: "باقات سياحية",
        path: "/services#tours",
        icon: "🗺️",
        visible: true,
        order: 4,
        children: [],
        isExternal: false,
      },
      {
        id: 505,
        label: "Insurance",
        labelAr: "تأمين السفر",
        path: "/services#insurance",
        icon: "🛡️",
        visible: true,
        order: 5,
        children: [],
        isExternal: false,
      },
      {
        id: 506,
        label: "Groups",
        labelAr: "سفر جماعي",
        path: "/services#groups",
        icon: "👥",
        visible: true,
        order: 6,
        children: [],
        isExternal: false,
      },
    ],
    isExternal: false,
  },
  {
    id: 6,
    label: "BLOG",
    labelAr: "المدونة",
    path: "/blog",
    icon: "📝",
    visible: true,
    order: 6,
    children: [],
    isExternal: false,
  },
  {
    id: 7,
    label: "MORE",
    labelAr: "المزيد",
    path: "#",
    icon: "⋯",
    visible: true,
    order: 7,
    badge: "More",
    children: [
      {
        id: 701,
        label: "VANIR GROUP",
        labelAr: "فانير جروب",
        path: "/vanir",
        icon: "🏛️",
        visible: true,
        order: 1,
        children: [],
        isExternal: false,
      },
      {
        id: 702,
        label: "News",
        labelAr: "أخبار",
        path: "/vanir#news",
        icon: "📰",
        visible: true,
        order: 2,
        children: [],
        isExternal: false,
      },
      {
        id: 703,
        label: "Offices",
        labelAr: "المكاتب",
        path: "/vanir#offices",
        icon: "🌐",
        visible: true,
        order: 3,
        children: [],
        isExternal: false,
      },
      {
        id: 704,
        label: "Affiliated",
        labelAr: "الشركات التابعة",
        path: "/vanir#affiliated",
        icon: "🤝",
        visible: true,
        order: 4,
        children: [],
        isExternal: false,
      },
      {
        id: 705,
        label: "About",
        labelAr: "من نحن",
        path: "/about",
        icon: "ℹ️",
        visible: true,
        order: 5,
        children: [],
        isExternal: false,
      },
      {
        id: 706,
        label: "Contact",
        labelAr: "اتصل بنا",
        path: "/contact",
        icon: "📞",
        visible: true,
        order: 6,
        children: [],
        isExternal: false,
      },
      {
        id: 707,
        label: "Gallery",
        labelAr: "المعرض",
        path: "/gallery",
        icon: "🖼️",
        visible: true,
        order: 7,
        children: [],
        isExternal: false,
      },
      {
        id: 708,
        label: "Reviews",
        labelAr: "التقييمات",
        path: "/reviews",
        icon: "⭐",
        visible: true,
        order: 8,
        children: [],
        isExternal: false,
      },
      {
        id: 709,
        label: "Case Studies",
        labelAr: "دراسات حالة",
        path: "/case-studies",
        icon: "📊",
        visible: true,
        order: 9,
        children: [],
        isExternal: false,
      },
    ],
    isExternal: false,
  },
  {
    id: 8,
    label: "MARKETING",
    labelAr: "التسويق",
    path: "/marketing",
    icon: "📢",
    visible: true,
    order: 8,
    badge: "Sub",
    children: [
      {
        id: 801,
        label: "Home",
        labelAr: "الرئيسية",
        path: "/marketing",
        icon: "📢",
        visible: true,
        order: 1,
        children: [],
        isExternal: false,
      },
      {
        id: 802,
        label: "Social Media",
        labelAr: "وسائل التواصل",
        path: "/marketing/social-media",
        icon: "📱",
        visible: true,
        order: 2,
        children: [],
        isExternal: false,
      },
      {
        id: 803,
        label: "Email",
        labelAr: "البريد",
        path: "/marketing/email",
        icon: "📧",
        visible: true,
        order: 3,
        children: [],
        isExternal: false,
      },
      {
        id: 804,
        label: "Trip Desc",
        labelAr: "وصف الرحلات",
        path: "/marketing/trip-description",
        icon: "✍️",
        visible: true,
        order: 4,
        children: [],
        isExternal: false,
      },
      {
        id: 805,
        label: "Blog SEO",
        labelAr: "SEO المدونة",
        path: "/marketing/blog-seo",
        icon: "🔍",
        visible: true,
        order: 5,
        children: [],
        isExternal: false,
      },
      {
        id: 806,
        label: "Ad Copy",
        labelAr: "نصوص إعلانية",
        path: "/marketing/ad-copy",
        icon: "📝",
        visible: true,
        order: 6,
        children: [],
        isExternal: false,
      },
      {
        id: 807,
        label: "Calendar",
        labelAr: "التقويم",
        path: "/marketing/calendar",
        icon: "📅",
        visible: true,
        order: 7,
        children: [],
        isExternal: false,
      },
    ],
    isExternal: false,
  },
  {
    id: 9,
    label: "OTHER",
    labelAr: "أخرى",
    path: "#",
    icon: "📄",
    visible: true,
    order: 9,
    badge: "Standalone",
    children: [
      {
        id: 901,
        label: "Booking",
        labelAr: "الحجز",
        path: "/booking",
        icon: "📋",
        visible: true,
        order: 1,
        children: [],
        isExternal: false,
      },
      {
        id: 902,
        label: "Profile",
        labelAr: "الملف",
        path: "/profile",
        icon: "👤",
        visible: true,
        order: 2,
        children: [],
        isExternal: false,
      },
      {
        id: 903,
        label: "Login",
        labelAr: "تسجيل الدخول",
        path: "/login",
        icon: "🔐",
        visible: true,
        order: 3,
        children: [],
        isExternal: false,
      },
    ],
    isExternal: false,
  },
];

function countAll(items: MenuItem[]): number {
  return items.reduce((a, i) => a + 1 + countAll(i.children), 0);
}
function countVisible(items: MenuItem[]): number {
  return items.reduce(
    (a, i) => a + (i.visible ? 1 : 0) + countVisible(i.children),
    0,
  );
}

export default function NavbarAdmin() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingParentId, setEditingParentId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(
    new Set([2, 3, 4, 5, 7, 8, 9]),
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [form, setForm] = useState({
    label: "",
    labelAr: "",
    path: "",
    icon: "",
    isExternal: false,
  });

  const { data: saved, isLoading } = trpc.siteSettings.get.useQuery(
    { category: "navbar", key: "menu_structure" },
    { staleTime: 30000 },
  );
  const setMut = trpc.siteSettings.set.useMutation();

  useEffect(() => {
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) setMenuItems(p);
      } catch {}
    }
  }, [saved]);

  const saveToDb = useCallback(
    async (items: MenuItem[]) => {
      setSaving(true);
      try {
        await setMut.mutateAsync({
          category: "navbar",
          key: "menu_structure",
          value: JSON.stringify(items),
        });
        setHasChanges(false);
        toast.success("تم حفظ ترتيب القائمة في قاعدة البيانات");
      } catch {
        toast.error("فشل في حفظ الترتيب");
      } finally {
        setSaving(false);
      }
    },
    [setMut],
  );

  const mark = (items: MenuItem[]) => {
    setMenuItems(items);
    setHasChanges(true);
  };
  const total = countAll(menuItems);
  const vis = countVisible(menuItems);

  const toggleExp = (id: number) =>
    setExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const expAll = () => {
    const s = new Set<number>();
    const c = (i: MenuItem[]) =>
      i.forEach((x) => {
        if (x.children.length) s.add(x.id);
        c(x.children);
      });
    c(menuItems);
    setExpanded(s);
  };

  const openCreate = (pid: number | null = null) => {
    setEditingItem(null);
    setEditingParentId(pid);
    setForm({ label: "", labelAr: "", path: "", icon: "", isExternal: false });
    setIsDialogOpen(true);
  };
  const openEdit = (item: MenuItem, pid: number | null = null) => {
    setEditingItem(item);
    setEditingParentId(pid);
    setForm({
      label: item.label,
      labelAr: item.labelAr || "",
      path: item.path,
      icon: item.icon,
      isExternal: item.isExternal,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    let ni: MenuItem[];
    if (editingItem) {
      const up = (items: MenuItem[]): MenuItem[] =>
        items.map((i) =>
          i.id === editingItem.id
            ? { ...i, ...form }
            : { ...i, children: up(i.children) },
        );
      ni = up(menuItems);
    } else {
      const nw: MenuItem = {
        id: Date.now(),
        ...form,
        visible: true,
        order: 0,
        children: [],
      };
      if (editingParentId) {
        ni = menuItems.map((i) =>
          i.id === editingParentId
            ? {
                ...i,
                children: [
                  ...i.children,
                  { ...nw, order: i.children.length + 1 },
                ],
              }
            : i,
        );
      } else {
        ni = [...menuItems, { ...nw, order: menuItems.length + 1 }];
      }
    }
    mark(ni);
    setIsDialogOpen(false);
  };

  const del = (id: number) => {
    if (!confirm("هل أنت متأكد؟")) return;
    const r = (i: MenuItem[]): MenuItem[] =>
      i
        .filter((x) => x.id !== id)
        .map((x) => ({ ...x, children: r(x.children) }));
    mark(r(menuItems));
  };
  const togVis = (id: number) => {
    const t = (i: MenuItem[]): MenuItem[] =>
      i.map((x) =>
        x.id === id
          ? { ...x, visible: !x.visible }
          : { ...x, children: t(x.children) },
      );
    mark(t(menuItems));
  };
  const move = (id: number, dir: "up" | "down") => {
    const r = (items: MenuItem[]): MenuItem[] => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1)
        return items.map((i) => ({ ...i, children: r(i.children) }));
      const s = dir === "up" ? idx - 1 : idx + 1;
      if (s < 0 || s >= items.length) return items;
      const n = [...items];
      [n[idx], n[s]] = [n[s], n[idx]];
      return n.map((i, j) => ({ ...i, order: j + 1 }));
    };
    mark(r(menuItems));
  };
  const reset = () => {
    if (!confirm("إعادة تعيين؟")) return;
    mark(DEFAULT_MENU);
  };
  const matches = (item: MenuItem): boolean => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      (item.labelAr || "").includes(q) ||
      item.path.toLowerCase().includes(q) ||
      item.children.some(matches)
    );
  };

  const renderItem = (item: MenuItem, pid: number | null = null, depth = 0) => {
    if (!matches(item)) return null;
    const isExp = expanded.has(item.id);
    const hasCh = item.children.length > 0;
    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 p-3 border-b border-white/5 hover:bg-white/[0.02] ${!item.visible ? "opacity-40" : ""}`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <GripVertical size={14} className="text-white/20 shrink-0" />
          {hasCh ? (
            <button
              onClick={() => toggleExp(item.id)}
              className="text-white/40 hover:text-white/80 shrink-0"
            >
              {isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[14px] shrink-0" />
          )}
          <span className="text-base shrink-0">{item.icon || "📄"}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white truncate">
                {item.label}
              </p>
              {item.labelAr && (
                <span className="text-xs text-white/30 hidden sm:inline">
                  ({item.labelAr})
                </span>
              )}
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20">
                  {item.badge}
                </span>
              )}
              {hasCh && (
                <span className="text-[10px] text-white/20">
                  {item.children.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <code className="text-[10px] text-[var(--theme-primary)]/60 truncate">
                {item.path}
              </code>
              {item.isExternal && (
                <ExternalLink size={10} className="text-blue-400" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => move(item.id, "up")}
              className="p-1 text-white/20 hover:text-white/60"
            >
              <ChevronUp size={12} />
            </button>
            <button
              onClick={() => move(item.id, "down")}
              className="p-1 text-white/20 hover:text-white/60"
            >
              <ChevronDown size={12} />
            </button>
            <button
              onClick={() => togVis(item.id)}
              className="p-1 text-white/20 hover:text-blue-400"
            >
              {item.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button
              onClick={() => openEdit(item, pid)}
              className="p-1 text-white/20 hover:text-[var(--theme-primary)]"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => openCreate(item.id)}
              className="p-1 text-white/20 hover:text-emerald-400"
            >
              <Plus size={12} />
            </button>
            <button
              onClick={() => del(item.id)}
              className="p-1 text-white/20 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        {hasCh && isExp && (
          <div>
            {item.children.map((c) => renderItem(c, item.id, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          className="animate-spin text-[var(--theme-primary)]"
          size={32}
        />
        <span className="mr-3 text-white/60">جاري تحميل بيانات القائمة...</span>
      </div>
    );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Menu className="text-[var(--theme-primary)]" size={24} /> إدارة
            القوائم والتنقل
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {total} عنصر ({vis} مرئي)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => openCreate()}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
          >
            <Plus size={16} className="ml-2" /> إضافة
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="border-white/10 text-white/60"
          >
            <RotateCcw size={16} className="ml-2" /> إعادة تعيين
          </Button>
          <Button
            onClick={() => saveToDb(menuItems)}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { v: menuItems.length, l: "أقسام", c: "text-[var(--theme-primary)]" },
          { v: total, l: "إجمالي", c: "text-emerald-400" },
          { v: vis, l: "مرئي", c: "text-blue-400" },
          { v: total - vis, l: "مخفي", c: "text-amber-400" },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-3 text-center"
          >
            <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
            <p className="text-xs text-white/40">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
        <p className="text-xs text-white/40 mb-3 flex items-center gap-1">
          <Eye size={12} /> معاينة
        </p>
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {menuItems
            .filter((i) => i.visible)
            .map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-1 text-sm text-white/80 whitespace-nowrap"
              >
                <span className="hover:text-[var(--theme-primary)]">
                  {i.label}
                </span>
                {i.children.length > 0 && (
                  <ChevronDown size={12} className="text-white/40" />
                )}
              </div>
            ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[var(--theme-surface)] border-white/10 text-white pr-9 text-sm"
            placeholder="بحث..."
          />
        </div>
        <Button
          onClick={expAll}
          variant="outline"
          size="sm"
          className="border-white/10 text-white/50 text-xs"
        >
          توسيع
        </Button>
        <Button
          onClick={() => setExpanded(new Set())}
          variant="outline"
          size="sm"
          className="border-white/10 text-white/50 text-xs"
        >
          طي
        </Button>
      </div>
      <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <p className="text-sm font-medium text-white">
            {menuItems.length} أقسام • {total} عنصر
          </p>
        </div>
        {menuItems.map((i) => renderItem(i))}
      </div>
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? "تعديل" : "إضافة"}
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
                <label className="block text-sm text-white mb-1">English</label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">عربي</label>
                <Input
                  value={form.labelAr}
                  onChange={(e) =>
                    setForm({ ...form, labelAr: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الرابط</label>
                <Input
                  value={form.path}
                  onChange={(e) => setForm({ ...form, path: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white font-mono text-sm"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  الأيقونة
                </label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={form.isExternal}
                  onChange={(e) =>
                    setForm({ ...form, isExternal: e.target.checked })
                  }
                />{" "}
                رابط خارجي
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
              >
                <Save size={16} className="ml-2" />
                {editingItem ? "حفظ" : "إضافة"}
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
