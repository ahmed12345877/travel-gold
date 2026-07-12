import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  BarChart3, TrendingUp, Users, Eye, Globe, DollarSign,
  ArrowUpRight, ArrowDownRight, Calendar, Activity, MapPin, Image
} from "lucide-react";

export default function AnalyticsAdmin() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const { data: usersData } = trpc.users.list.useQuery({ limit: 100, offset: 0 });
  const users = usersData?.users || [];
  const totalUsers = users.length;
  const totalCredits = users.reduce((sum: number, u: any) => sum + (u.credits || 0), 0);

  const stats = [
    { label: "إجمالي المستخدمين", value: totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", change: "+12%", up: true },
    { label: "إجمالي الرصيد", value: totalCredits.toLocaleString(), icon: DollarSign, color: "text-[var(--theme-primary)]", bg: "bg-[var(--theme-primary)]/10", change: "+8%", up: true },
    { label: "الصور المولدة", value: "—", icon: Image, color: "text-purple-400", bg: "bg-purple-500/10", change: "+24%", up: true },
    { label: "الحجوزات", value: "—", icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-500/10", change: "+5%", up: true },
  ];

  const topDestinations = [
    { name: "الأهرامات وأبو الهول", visits: 1250, percentage: 85 },
    { name: "معبد الكرنك", visits: 980, percentage: 67 },
    { name: "وادي الملوك", visits: 870, percentage: 59 },
    { name: "رحلة نيلية أسوان", visits: 750, percentage: 51 },
    { name: "الغردقة", visits: 620, percentage: 42 },
  ];

  const recentActivity = [
    { type: "user", text: "مستخدم جديد سجل في الموقع", time: "منذ 5 دقائق" },
    { type: "booking", text: "حجز جديد - رحلة نيلية فاخرة", time: "منذ 15 دقيقة" },
    { type: "image", text: "تم توليد 3 صور بالذكاء الاصطناعي", time: "منذ 30 دقيقة" },
    { type: "review", text: "تقييم جديد 5 نجوم من Benjamin Carter", time: "منذ ساعة" },
    { type: "contact", text: "رسالة اتصال جديدة", time: "منذ ساعتين" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-[var(--theme-primary)]" size={24} />
            التحليلات والإحصائيات
          </h1>
          <p className="text-white/50 text-sm mt-1">نظرة شاملة على أداء الموقع</p>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                period === p ? "bg-[var(--theme-primary)] text-black" : "bg-white/5 text-white/50"
              }`}
            >
              {p === "7d" ? "7 أيام" : p === "30d" ? "30 يوم" : "90 يوم"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <span className={`text-xs flex items-center gap-0.5 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Destinations */}
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin size={14} className="text-[var(--theme-primary)]" />
              أكثر الوجهات زيارة
            </h3>
          </div>
          <div className="space-y-3">
            {topDestinations.map((dest, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">{dest.name}</span>
                  <span className="text-xs text-white/40">{dest.visits.toLocaleString()} زيارة</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] rounded-full transition-all duration-1000"
                    style={{ width: `${dest.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity size={14} className="text-[var(--theme-primary)]" />
              النشاط الأخير
            </h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.02]">
                <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {activity.type === "user" && <Users size={12} className="text-blue-400" />}
                  {activity.type === "booking" && <Calendar size={12} className="text-emerald-400" />}
                  {activity.type === "image" && <Image size={12} className="text-purple-400" />}
                  {activity.type === "review" && <TrendingUp size={12} className="text-[var(--theme-primary)]" />}
                  {activity.type === "contact" && <Globe size={12} className="text-cyan-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">{activity.text}</p>
                  <p className="text-xs text-white/30 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Chart Placeholder */}
      <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp size={14} className="text-[var(--theme-primary)]" />
            حركة الزيارات
          </h3>
        </div>
        <div className="h-48 flex items-end gap-1 px-4">
          {Array.from({ length: 30 }, (_, i) => {
            const height = 20 + Math.random() * 80;
            return (
              <div key={i} className="flex-1 group relative">
                <div
                  className="w-full bg-gradient-to-t from-[var(--theme-primary)]/40 to-[var(--theme-primary)] rounded-t transition-all hover:from-[var(--theme-primary)]/60"
                  style={{ height: `${height}%` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1a1a1a] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                  {Math.round(height * 10)} زيارة
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 px-4">
          <span className="text-[10px] text-white/20">1</span>
          <span className="text-[10px] text-white/20">15</span>
          <span className="text-[10px] text-white/20">30</span>
        </div>
      </div>
    </div>
  );
}
