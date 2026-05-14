import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Coins, Search, TrendingUp, TrendingDown, DollarSign, Users,
  ArrowUpRight, ArrowDownRight, BarChart3, Calendar
} from "lucide-react";

export default function CreditsAdmin() {
  const [search, setSearch] = useState("");

  const { data: usersData } = trpc.users.list.useQuery({ limit: 100, offset: 0 });
  const users = usersData?.users || [];

  const totalCredits = users.reduce((sum: number, u: any) => sum + (u.credits || 0), 0);
  const activeUsers = users.filter((u: any) => (u.credits || 0) > 0).length;

  const filtered = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Coins className="text-[var(--theme-primary)]" size={24} />
            إدارة الرصيد والفواتير
          </h1>
          <p className="text-white/50 text-sm mt-1">إدارة رصيد المستخدمين وسجل المعاملات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={18} className="text-[var(--theme-primary)]" />
            <span className="text-xs text-emerald-400 flex items-center gap-0.5"><ArrowUpRight size={10} /> +12%</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCredits.toLocaleString()}</p>
          <p className="text-xs text-white/50">إجمالي الرصيد</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users size={18} className="text-blue-400" />
            <span className="text-xs text-emerald-400 flex items-center gap-0.5"><ArrowUpRight size={10} /> +5</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeUsers}</p>
          <p className="text-xs text-white/50">مستخدمين نشطين</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{users.length > 0 ? Math.round(totalCredits / users.length) : 0}</p>
          <p className="text-xs text-white/50">متوسط الرصيد</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{users.length}</p>
          <p className="text-xs text-white/50">إجمالي الحسابات</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white pr-10" placeholder="البحث عن مستخدم..." />
      </div>

      {/* Users Credits Table */}
      <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-sm font-medium text-white">أرصدة المستخدمين</p>
        </div>
        {filtered.length === 0 ? (
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
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${user.role === "admin" ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]" : "bg-blue-500/10 text-blue-400"}`}>
                      {user.role === "admin" ? "مسؤول" : "مستخدم"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-bold text-[var(--theme-primary)]">{user.credits ?? 0}</span>
                    <span className="text-xs text-white/30 mr-1">credits</span>
                  </td>
                  <td className="p-3 text-xs text-white/40">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
