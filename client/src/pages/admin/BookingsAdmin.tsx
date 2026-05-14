import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  CalendarCheck, Search, Edit2, Trash2, Eye, X, Save,
  DollarSign, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

export default function BookingsAdmin() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data: bookingsData, isLoading } = trpc.bookings.listAll.useQuery({ limit: 50, offset: 0 });
  const bookings = bookingsData || [];

  const filtered = (Array.isArray(bookings) ? bookings : []).filter((b: any) => {
    const matchSearch = b.destination?.toLowerCase().includes(search.toLowerCase()) ||
      b.fullName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
      completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
    const icons: Record<string, any> = {
      pending: <AlertCircle size={10} />,
      confirmed: <CheckCircle size={10} />,
      cancelled: <XCircle size={10} />,
      completed: <CheckCircle size={10} />,
    };
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      cancelled: "ملغي",
      completed: "مكتمل",
    };
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${styles[status] || styles.pending}`}>
        {icons[status]} {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="text-[var(--theme-primary)]" size={24} />
            إدارة الحجوزات
          </h1>
          <p className="text-white/50 text-sm mt-1">تتبع وإدارة جميع الحجوزات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
          <p className="text-xs text-white/50">إجمالي الحجوزات</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{(Array.isArray(bookings) ? bookings : []).filter((b: any) => b.status === "pending").length}</p>
          <p className="text-xs text-white/50">قيد الانتظار</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{(Array.isArray(bookings) ? bookings : []).filter((b: any) => b.status === "confirmed").length}</p>
          <p className="text-xs text-white/50">مؤكدة</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{(Array.isArray(bookings) ? bookings : []).filter((b: any) => b.status === "completed").length}</p>
          <p className="text-xs text-white/50">مكتملة</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white pr-10" placeholder="البحث عن حجز..." />
        </div>
        <div className="flex gap-1">
          {["all", "pending", "confirmed", "cancelled", "completed"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                statusFilter === s ? "bg-[var(--theme-primary)] text-black" : "bg-white/5 text-white/50"
              }`}
            >
              {s === "all" ? "الكل" : s === "pending" ? "انتظار" : s === "confirmed" ? "مؤكد" : s === "cancelled" ? "ملغي" : "مكتمل"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-white/40">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/40">لا توجد حجوزات</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right text-xs text-white/50 p-3">العميل</th>
                <th className="text-right text-xs text-white/50 p-3">الوجهة</th>
                <th className="text-right text-xs text-white/50 p-3">التاريخ</th>
                <th className="text-right text-xs text-white/50 p-3">الأشخاص</th>
                <th className="text-right text-xs text-white/50 p-3">الحالة</th>
                <th className="text-right text-xs text-white/50 p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking: any) => (
                <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <p className="text-sm text-white font-medium">{booking.fullName || "—"}</p>
                    <p className="text-xs text-white/40" dir="ltr">{booking.email || ""}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-[var(--theme-primary)]" />
                      <span className="text-sm text-white/70">{booking.destination || "—"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-white/40">
                    {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString("ar-EG") : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-white/30" />
                      <span className="text-sm text-white/60">{booking.travelers || 1}</span>
                    </div>
                  </td>
                  <td className="p-3">{statusBadge(booking.status || "pending")}</td>
                  <td className="p-3">
                    <button onClick={() => setSelectedBooking(booking)} className="p-1.5 text-white/30 hover:text-[var(--theme-primary)]">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">تفاصيل الحجز #{selectedBooking.id}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-xs text-white/40">العميل</p>
                  <p className="text-sm text-white font-medium">{selectedBooking.fullName}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-xs text-white/40">البريد</p>
                  <p className="text-sm text-white/70" dir="ltr">{selectedBooking.email}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-xs text-white/40">الوجهة</p>
                  <p className="text-sm text-white/70">{selectedBooking.destination}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-xs text-white/40">تاريخ السفر</p>
                  <p className="text-sm text-white/70">{selectedBooking.travelDate ? new Date(selectedBooking.travelDate).toLocaleDateString("ar-EG") : "—"}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-xs text-white/40">عدد المسافرين</p>
                  <p className="text-sm text-white/70">{selectedBooking.travelers || 1}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-xs text-white/40">الحالة</p>
                  {statusBadge(selectedBooking.status || "pending")}
                </div>
              </div>
              {selectedBooking.specialRequests && (
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-xs text-white/40 mb-1">طلبات خاصة</p>
                  <p className="text-sm text-white/60">{selectedBooking.specialRequests}</p>
                </div>
              )}
            </div>
            <Button onClick={() => setSelectedBooking(null)} className="w-full bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold">إغلاق</Button>
          </div>
        </div>
      )}
    </div>
  );
}
