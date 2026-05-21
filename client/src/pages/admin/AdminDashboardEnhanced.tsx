import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  CalendarCheck,
  MessageSquare,
  Star,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  FileText,
  Send,
  Settings,
  Download,
} from "lucide-react";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { BookingsTrendChart, RevenueChart, BookingStatusPieChart, ReviewsRatingChart } from "@/components/admin/DashboardCharts";
import { QuickActions } from "@/components/admin/QuickActions";

export default function AdminDashboardEnhanced() {
  const { data: bookings } = trpc.bookings.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: reviews } = trpc.reviews.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: messages } = trpc.contact.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: users } = trpc.users.list.useQuery();

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const bookingList = bookings || [];
    const reviewList = reviews || [];
    const messageList = messages || [];
    const userList = users || [];

    const totalRevenue = bookingList.reduce((sum: number, b: any) => {
      if (b.status !== "cancelled" && b.totalPrice) {
        return sum + parseFloat(b.totalPrice);
      }
      return sum;
    }, 0);

    return [
      {
        title: "إجمالي الحجوزات",
        value: bookingList.length,
        icon: CalendarCheck,
        change: 12,
        changeType: "increase" as const,
        color: "primary" as const,
      },
      {
        title: "الإيرادات",
        value: `$${totalRevenue.toFixed(2)}`,
        icon: DollarSign,
        change: 8,
        changeType: "increase" as const,
        color: "success" as const,
      },
      {
        title: "التقييمات",
        value: reviewList.length,
        icon: Star,
        change: 5,
        changeType: "increase" as const,
        color: "warning" as const,
      },
      {
        title: "الرسائل",
        value: messageList.filter((m: any) => m.status === "new").length,
        icon: MessageSquare,
        change: 0,
        changeType: "decrease" as const,
        color: "info" as const,
      },
    ];
  }, [bookings, reviews, messages, users]);

  // بيانات الرسوم البيانية
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        name: date.toLocaleDateString("ar-SA"),
        bookings: Math.floor(Math.random() * 50) + 10,
      });
    }
    return data;
  }, []);

  const revenueData = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        name: date.toLocaleDateString("ar-SA", { month: "short", year: "numeric" }),
        revenue: Math.floor(Math.random() * 5000) + 2000,
        bookings: Math.floor(Math.random() * 50) + 15,
      });
    }
    return data;
  }, []);

  const statusData = useMemo(() => {
    if (!bookings) return [];
    const stats = bookings.reduce(
      (acc: any, b: any) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      },
      {}
    );
    return Object.entries(stats).map(([key, value]) => ({
      name: key,
      value: value,
    }));
  }, [bookings]);

  const ratingData = useMemo(() => {
    if (!reviews) return [];
    const ratings: Record<number, number> = {};
    reviews.forEach((r: any) => {
      ratings[r.rating] = (ratings[r.rating] || 0) + 1;
    });
    return [1, 2, 3, 4, 5].map((rating) => ({
      name: `${rating} ⭐`,
      value: ratings[rating] || 0,
    }));
  }, [reviews]);

  const quickActions = [
    {
      icon: Plus,
      label: "حجز جديد",
      onClick: () => window.location.href = "/admin/bookings",
      variant: "primary" as const,
    },
    {
      icon: FileText,
      label: "منشور جديد",
      onClick: () => window.location.href = "/admin/blog",
    },
    {
      icon: Send,
      label: "رسالة",
      onClick: () => window.location.href = "/admin/messages",
    },
    {
      icon: Users,
      label: "المستخدمين",
      onClick: () => window.location.href = "/admin/users",
    },
    {
      icon: Download,
      label: "تحميل",
      onClick: () => window.location.href = "/admin/backup",
    },
    {
      icon: Settings,
      label: "الإعدادات",
      onClick: () => window.location.href = "/admin/settings",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-[var(--font-display)] font-bold text-white mb-1">لوحة التحكم</h1>
        <p className="text-white/50">مرحباً بك في لوحة إدارة VANIR GROUP</p>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingsTrendChart data={trendData} />
        <RevenueChart data={revenueData} />
        <BookingStatusPieChart data={statusData} />
        <ReviewsRatingChart data={ratingData} />
      </div>
    </div>
  );
}
