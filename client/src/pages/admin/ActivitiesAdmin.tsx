import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Save,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  Star,
  DollarSign,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Activity {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  category: string;
  rating: number;
  image: string;
}

const initialActivities: Activity[] = [];

export default function ActivitiesAdmin() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<Omit<Activity, "id" | "rating">>({
    name: "",
    nameAr: "",
    description: "",
    price: 0,
    duration: "",
    location: "",
    category: "",
    image: "",
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { data: saved, isLoading } = trpc.siteSettings.get.useQuery(
    { category: "activities", key: "activities_data" },
    { staleTime: 30000 },
  );
  const setMut = trpc.siteSettings.set.useMutation();

  useEffect(() => {
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) setActivities(p);
      } catch {}
    }
  }, [saved]);

  const saveToDb = useCallback(
    async (items: Activity[]) => {
      setSaving(true);
      try {
        await setMut.mutateAsync({
          category: "activities",
          key: "activities_data",
          value: JSON.stringify(items),
        });
        setHasChanges(false);
        toast.success("تم الحفظ في قاعدة البيانات");
      } catch {
        toast.error("فشل في الحفظ");
      } finally {
        setSaving(false);
      }
    },
    [setMut],
  );

  const mark = (items: Activity[]) => {
    setActivities(items);
    setHasChanges(true);
  };

  const openDialog = (item: Activity | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        nameAr: "",
        description: "",
        price: 0,
        duration: "",
        location: "",
        category: "",
        image: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      mark(
        activities.map((act) =>
          act.id === editingItem.id ? { ...editingItem, ...formData } : act,
        ),
      );
    } else {
      const newActivity: Activity = {
        id: Date.now(),
        ...formData,
        rating: 5, // Default rating
      };
      mark([newActivity, ...activities]);
    }
    setIsDialogOpen(false);
  };

  const deleteItem = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا النشاط؟")) {
      mark(activities.filter((act) => act.id !== id));
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-48 text-white">
        <Loader2 className="animate-spin mr-2" /> جاري تحميل البيانات...
      </div>
    );

  return (
    <div className="p-6 bg-[var(--theme-surface)] min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--theme-primary)]">
          إدارة الأنشطة السياحية
        </h1>
        <div className="flex items-center gap-4">
          {hasChanges && (
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle size={16} />
              <span>تغييرات غير محفوظة</span>
            </div>
          )}
          <Button
            onClick={() => saveToDb(activities)}
            disabled={saving || !hasChanges}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
          >
            {saving ? (
              <Loader2 className="animate-spin ml-2" />
            ) : (
              <Save className="ml-2" size={16} />
            )}{" "}
            حفظ التغييرات
          </Button>
          <Button
            onClick={() => openDialog()}
            className="bg-transparent border border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-black"
          >
            <PlusCircle size={16} className="ml-2" /> إضافة نشاط جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-[#161b22] border border-white/10 rounded-lg p-4 transition-all hover:border-[var(--theme-primary)]/50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-20 h-20 rounded-md overflow-hidden mr-4 flex-shrink-0">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-white">{activity.nameAr}</h3>
                <p className="text-sm text-white/70">{activity.name}</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => openDialog(activity)}
                  className="p-1.5 text-white/30 hover:text-[var(--theme-primary)]"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteItem(activity.id)}
                  className="p-1.5 text-white/30 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-white/50 mb-3 line-clamp-2">
              {activity.description}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-[var(--theme-primary)]">
                <DollarSign size={10} />${activity.price}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Clock size={10} />
                {activity.duration}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/40">
                <MapPin size={10} />
                {activity.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Star
                  size={10}
                  className="text-[var(--theme-primary)] fill-[var(--theme-primary)]"
                />
                {activity.rating}
              </span>
              <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                {activity.category}
              </span>
            </div>
          </div>
        ))}
      </div>
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? "تعديل النشاط" : "إضافة نشاط جديد"}
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
                  <label className="block text-sm text-white mb-1">
                    الاسم بالعربية
                  </label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">
                    الاسم بالإنجليزية
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الوصف</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-white mb-1">
                    السعر ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: +e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">المدة</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    placeholder="3 ساعات"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">الفئة</label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    placeholder="مغامرات"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الموقع</label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  رابط الصورة
                </label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
              >
                <Save size={16} className="ml-2" />
                {editingItem ? "حفظ التعديلات" : "إضافة النشاط"}
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
