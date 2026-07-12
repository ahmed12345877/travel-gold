import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Users, Search, Edit2, Trash2, Shield, ShieldCheck, Ban, CheckCircle,
  X, Save, Mail, CreditCard, Calendar, MoreHorizontal
} from "lucide-react";

export default function UsersAdmin() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: usersData, isLoading } = trpc.users.list.useQuery({ limit: 50, offset: 0 });
  const users = usersData?.users || [];

  const filtered = users.filter((u: any) => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEdit = (user: any) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const roleBadge = (role: string) => {
    if (role === "admin") return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20">
        <ShieldCheck size={10} /> Admin
      </span>
    );
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Shield size={10} /> User
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-[var(--theme-primary)]" size={24} />
            إدارة المستخدمين
          </h1>
          <p className="text-white/50 text-sm mt-1">عرض وتعديل حسابات المستخدمين والأدوار</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-white/50">إجمالي المستخدمين</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[var(--theme-primary)]">{users.filter((u: any) => u.role === "admin").length}</p>
          <p className="text-xs text-white/50">مسؤولين</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{users.filter((u: any) => u.role === "user").length}</p>
          <p className="text-xs text-white/50">مستخدمين</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white pr-10" placeholder="البحث عن مستخدم..." />
        </div>
        <div className="flex gap-1">
          {(["all", "admin", "user"] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                roleFilter === role ? "bg-[var(--theme-primary)] text-black" : "bg-white/5 text-white/50 hover:text-white/80"
              }`}
            >
              {role === "all" ? "الكل" : role === "admin" ? "مسؤولين" : "مستخدمين"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-white/40">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/40">لا يوجد مستخدمين</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right text-xs text-white/50 p-3">المستخدم</th>
                <th className="text-right text-xs text-white/50 p-3">البريد</th>
                <th className="text-right text-xs text-white/50 p-3">الدور</th>
                <th className="text-right text-xs text-white/50 p-3">الرصيد</th>
                <th className="text-right text-xs text-white/50 p-3">تاريخ التسجيل</th>
                <th className="text-right text-xs text-white/50 p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user: any) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center">
                        <span className="text-xs text-[var(--theme-primary)] font-bold">{(user.name || "U")[0]}</span>
                      </div>
                      <span className="text-sm text-white font-medium">{user.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-white/50" dir="ltr">{user.email || "-"}</td>
                  <td className="p-3">{roleBadge(user.role)}</td>
                  <td className="p-3">
                    <span className="text-sm text-[var(--theme-primary)] font-medium">{user.credits ?? 0}</span>
                  </td>
                  <td className="p-3 text-xs text-white/40">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(user)} className="p-1.5 text-white/30 hover:text-[var(--theme-primary)]"><Edit2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">تعديل المستخدم</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center">
                  <span className="text-lg text-[var(--theme-primary)] font-bold">{(editingUser.name || "U")[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{editingUser.name}</p>
                  <p className="text-xs text-white/40">{editingUser.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الدور</label>
                <select className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm" defaultValue={editingUser.role}>
                  <option value="user">مستخدم</option>
                  <option value="admin">مسؤول</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الرصيد</label>
                <Input type="number" defaultValue={editingUser.credits ?? 0} className="bg-[#1a1a1a] border-white/10 text-white" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold">
                <Save size={16} className="ml-2" />
                حفظ التعديلات
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="border-white/10 text-white/60">إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
