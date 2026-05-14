import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Plus, Edit2, Trash2, Save, X, Check, Users, Eye, Pencil, Loader2, AlertTriangle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Role {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  color: string;
  usersCount: number;
  permissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>;
}

const MODULES = [
  { key: "destinations", label: "الوجهات" },
  { key: "offers", label: "العروض" },
  { key: "blog", label: "المدونة" },
  { key: "gallery", label: "المعرض" },
  { key: "bookings", label: "الحجوزات" },
  { key: "users", label: "المستخدمين" },
  { key: "messages", label: "الرسائل" },
  { key: "testimonials", label: "الشهادات" },
  { key: "settings", label: "الإعدادات" },
  { key: "analytics", label: "التحليلات" },
  { key: "hero", label: "الهيرو" },
  { key: "navbar", label: "القوائم" },
  { key: "pages", label: "الصفحات" },
];

export default function PermissionsAdmin() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: saved, isLoading } = trpc.siteSettings.get.useQuery({ category: "permissions", key: "roles" }, { staleTime: 30000 });
  const setMut = trpc.siteSettings.set.useMutation();

  useEffect(() => {
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) {
          setRoles(p);
          setSelectedRole(p[0]);
        }
      } catch {}
    }
  }, [saved]);

  const saveToDb = useCallback(async (items: Role[]) => {
    setSaving(true);
    try {
      await setMut.mutateAsync({ category: "permissions", key: "roles", value: JSON.stringify(items) });
      setHasChanges(false);
      toast.success("تم حفظ الصلاحيات في قاعدة البيانات");
    } catch {
      toast.error("فشل في حفظ الصلاحيات");
    }
    finally {
      setSaving(false);
    }
  }, [setMut]);

  const mark = (items: Role[]) => {
    setRoles(items);
    setHasChanges(true);
  };

  const togglePermission = (module: string, perm: "view" | "create" | "edit" | "delete") => {
    if (!selectedRole) return;
    const updatedRoles = roles.map(r => {
      if (r.id === selectedRole.id) {
        const newPermissions = { ...r.permissions };
        newPermissions[module] = {
          ...newPermissions[module],
          [perm]: !newPermissions[module]?.[perm],
        };
        return { ...r, permissions: newPermissions };
      }
      return r;
    });
    mark(updatedRoles);
    // Update selectedRole view in real-time
    setSelectedRole(updatedRoles.find(r => r.id === selectedRole.id) || null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="flex items-center gap-2 text-white/50">
          <Loader2 className="animate-spin" size={20} />
          <span>جاري تحميل إعدادات الصلاحيات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-[var(--theme-primary)]" size={24} />
            إدارة الأدوار والصلاحيات
          </h1>
          <p className="text-white/50 text-sm mt-1">تحديد من يمكنه فعل ماذا في النظام</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <div className="flex items-center gap-1 text-sm text-yellow-400/80">
              <AlertTriangle size={14} />
              <span>تغييرات غير محفوظة</span>
            </div>
          )}
          <Button onClick={() => saveToDb(roles)} size="sm" className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] text-xs h-8" disabled={!hasChanges || saving}>
            {saving ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Save size={14} className="ml-1" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <p className="text-sm font-medium text-white mb-3">الأدوار</p>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`w-full text-right p-3 rounded-lg border transition-colors ${
                selectedRole?.id === role.id
                  ? "bg-[var(--theme-primary)]/5 border-[var(--theme-primary)]/20"
                  : "bg-[var(--theme-surface)] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                <span className="text-sm font-medium text-white">{role.nameAr}</span>
              </div>
              <p className="text-xs text-white/40">{role.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Users size={10} className="text-white/20" />
                <span className="text-xs text-white/30">{role.usersCount} مستخدم</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
          {selectedRole ? (
            <>
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedRole.color }} />
                  <span className="text-sm font-semibold text-white">{selectedRole.nameAr}</span>
                  <span className="text-xs text-white/30">({selectedRole.name})</span>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-right text-xs text-white/50 p-3 w-40">القسم</th>
                    <th className="text-center text-xs text-white/50 p-3"><div className="flex items-center justify-center gap-1"><Eye size={10} /> عرض</div></th>
                    <th className="text-center text-xs text-white/50 p-3"><div className="flex items-center justify-center gap-1"><Plus size={10} /> إنشاء</div></th>
                    <th className="text-center text-xs text-white/50 p-3"><div className="flex items-center justify-center gap-1"><Pencil size={10} /> تعديل</div></th>
                    <th className="text-center text-xs text-white/50 p-3"><div className="flex items-center justify-center gap-1"><Trash2 size={10} /> حذف</div></th>
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(mod => {
                    const perms = selectedRole.permissions[mod.key] || { view: false, create: false, edit: false, delete: false };
                    return (
                      <tr key={mod.key} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-3 text-sm text-white/70">{mod.label}</td>
                        {(["view", "create", "edit", "delete"] as const).map(perm => (
                          <td key={perm} className="p-3 text-center">
                            <button
                              onClick={() => togglePermission(mod.key, perm)}
                              className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto transition-colors cursor-pointer hover:border-[var(--theme-primary)]/40 ${
                                perms[perm]
                                  ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20"
                                  : "bg-white/5 text-white/10 border border-white/5"
                              }`}
                            >
                              {perms[perm] ? <Check size={12} /> : <X size={12} />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          ) : (
            <div className="p-8 text-center text-white/30">الرجاء اختيار دور لعرض صلاحياته.</div>
          )}
        </div>
      </div>
    </div>
  );
}
