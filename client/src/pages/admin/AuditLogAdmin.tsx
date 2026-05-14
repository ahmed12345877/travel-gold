import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  FileText, Search, Edit2, Trash2, Plus, Eye,
  User, Clock, Loader2, Eraser
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AuditEntry {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  details: string;
  timestamp: string;
  ip: string;
}

export default function AuditLogAdmin() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const [clearing, setClearing] = useState(false);
  const { data: saved, isLoading } = trpc.siteSettings.get.useQuery({ category: "audit", key: "log" }, { staleTime: 30000 });
  const setMut = trpc.siteSettings.set.useMutation();

  useEffect(() => {
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) {
          // Sort logs by timestamp descending
          p.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLogs(p);
        }
      } catch {}
    }
  }, [saved]);

  const clearLog = useCallback(async () => {
    if (!confirm("هل أنت متأكد أنك تريد مسح سجل التدقيق بالكامل؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setClearing(true);
    try {
      await setMut.mutateAsync({ category: "audit", key: "log", value: "[]" });
      setLogs([]);
      toast.success("تم مسح سجل التدقيق بنجاح");
    } catch {
      toast.error("فشل في مسح السجل");
    }
    finally {
      setClearing(false);
    }
  }, [setMut]);

  const filtered = logs.filter(log => {
    const matchSearch = log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const actionIcon = (action: string) => {
    switch (action) {
      case "create": return <Plus size={12} className="text-emerald-400" />;
      case "update": return <Edit2 size={12} className="text-blue-400" />;
      case "delete": return <Trash2 size={12} className="text-red-400" />;
      default: return <Eye size={12} className="text-white/40" />;
    }
  };

  const actionBadge = (action: string) => {
    const styles: Record<string, string> = {
      create: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      delete: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    const labels: Record<string, string> = {
      create: "إنشاء",
      update: "تعديل",
      delete: "حذف",
    };
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${styles[action] || "bg-white/5 text-white/40 border-white/10"}`}>
        {actionIcon(action)} {labels[action] || action}
      </span>
    );
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-96 text-white/50">
      <Loader2 className="animate-spin mr-2" />
      جاري تحميل السجلات...
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-[var(--theme-primary)]" size={24} />
            سجل التدقيق
          </h1>
          <p className="text-white/50 text-sm mt-1">تتبع جميع التغييرات والإجراءات التي تتم في النظام</p>
        </div>
        <button
          onClick={clearLog}
          disabled={clearing || logs.length === 0}
          className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {clearing ? <Loader2 size={16} className="animate-spin" /> : <Eraser size={16} />}
          {clearing ? "جاري المسح..." : "مسح السجل"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{logs.length}</p>
          <p className="text-xs text-white/50">إجمالي السجلات</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{logs.filter(l => l.action === "create").length}</p>
          <p className="text-xs text-white/50">إنشاء</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{logs.filter(l => l.action === "update").length}</p>
          <p className="text-xs text-white/50">تعديل</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{logs.filter(l => l.action === "delete").length}</p>
          <p className="text-xs text-white/50">حذف</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white pr-10" placeholder="البحث في السجلات..." />
        </div>
        <div className="flex gap-1">
          {['all', 'create', 'update', 'delete'].map(a => (
            <button
              key={a}
              onClick={() => setActionFilter(a)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                actionFilter === a ? "bg-[var(--theme-primary)] text-black" : "bg-white/5 text-white/50"
              }`}
            >
              {a === 'all' ? "الكل" : a === 'create' ? "إنشاء" : a === 'update' ? "تعديل" : "حذف"}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {filtered.length > 0 ? filtered.map((log, index) => (
          <div key={log.id || index} className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                {actionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {actionBadge(log.action)}
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded">{log.entity}</span>
                  <span className="text-xs text-white/20">#{log.entityId}</span>
                </div>
                <p className="text-sm text-white/70">{log.details}</p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="text-xs text-white/30 flex items-center gap-1">
                    <User size={10} /> {log.user}
                  </span>
                  <span className="text-xs text-white/20 flex items-center gap-1">
                    <Clock size={10} /> {new Date(log.timestamp).toLocaleString('ar-EG')}
                  </span>
                  <span className="text-xs text-white/15" dir="ltr">IP: {log.ip}</span>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 text-white/30">
            <FileText size={40} className="mx-auto mb-2" />
            <p>لا توجد سجلات لعرضها.</p>
          </div>
        )}
      </div>
    </div>
  );
}
