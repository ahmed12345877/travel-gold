import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  CalendarCheck,
  MessageSquare,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color = "gold",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  color?: "gold" | "green" | "red" | "blue";
}) {
  const colorMap = {
    gold: "border-[var(--theme-primary)]/30 text-[var(--theme-primary)]",
    green: "border-emerald-500/30 text-emerald-400",
    red: "border-red-500/30 text-red-400",
    blue: "border-blue-500/30 text-blue-400",
  };

  return (
    <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-5 hover:border-[var(--theme-primary)]/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorMap[color]} bg-black/30`}
        >
          <Icon size={20} />
        </div>
      </div>
      <p className="text-white/50 text-xs font-[var(--font-body)] uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-white text-2xl font-[var(--font-display)] font-bold">
        {value}
      </p>
      {subtitle && (
        <p className="text-white/40 text-xs font-[var(--font-body)] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status, count }: { status: string; count: number }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    new: "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-white/10",
    read: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    replied: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-[var(--font-body)] font-medium border ${colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
      <span className="bg-current/20 rounded-full px-1.5 py-0.5 text-[10px]">
        {count}
      </span>
    </span>
  );
}

export default function AdminDashboard() {
  const { data: bookings, isLoading: bookingsLoading } =
    trpc.bookings.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: reviews, isLoading: reviewsLoading } =
    trpc.reviews.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: messages, isLoading: messagesLoading } =
    trpc.contact.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: reviewStats } = trpc.reviews.stats.useQuery();

  const isLoading = bookingsLoading || reviewsLoading || messagesLoading;

  const bookingStats = useMemo(() => {
    if (!bookings)
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
        revenue: 0,
      };
    const stats = {
      total: bookings.length,
      pending: bookings.filter((b: any) => b.status === "pending").length,
      confirmed: bookings.filter((b: any) => b.status === "confirmed").length,
      cancelled: bookings.filter((b: any) => b.status === "cancelled").length,
      completed: bookings.filter((b: any) => b.status === "completed").length,
      revenue: bookings.reduce((sum: number, b: any) => {
        if (b.status !== "cancelled" && b.totalPrice) {
          return sum + parseFloat(b.totalPrice);
        }
        return sum;
      }, 0),
    };
    return stats;
  }, [bookings]);

  const messageStats = useMemo(() => {
    if (!messages)
      return { total: 0, new: 0, read: 0, replied: 0, archived: 0 };
    return {
      total: messages.length,
      new: messages.filter((m: any) => m.status === "new").length,
      read: messages.filter((m: any) => m.status === "read").length,
      replied: messages.filter((m: any) => m.status === "replied").length,
      archived: messages.filter((m: any) => m.status === "archived").length,
    };
  }, [messages]);

  const reviewModStats = useMemo(() => {
    if (!reviews) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      total: reviews.length,
      pending: reviews.filter((r: any) => r.isApproved === "pending").length,
      approved: reviews.filter((r: any) => r.isApproved === "approved").length,
      rejected: reviews.filter((r: any) => r.isApproved === "rejected").length,
    };
  }, [reviews]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--theme-primary)]/10 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-[var(--theme-surface)] rounded-lg border border-white/5"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-[var(--theme-surface)] rounded-lg border border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-white">
          Dashboard Overview
        </h1>
        <p className="text-white/50 text-sm font-[var(--font-body)] mt-1">
          Welcome back. Here's what's happening with your travel business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={bookingStats.total}
          icon={CalendarCheck}
          subtitle={`${bookingStats.pending} pending`}
          color="gold"
        />
        <StatCard
          title="Revenue"
          value={`$${bookingStats.revenue.toLocaleString()}`}
          icon={DollarSign}
          subtitle="From active bookings"
          color="green"
        />
        <StatCard
          title="Reviews"
          value={reviewModStats.total}
          icon={Star}
          subtitle={`Avg: ${reviewStats?.average?.toFixed(1) || "N/A"}`}
          color="blue"
        />
        <StatCard
          title="Messages"
          value={messageStats.total}
          icon={MessageSquare}
          subtitle={`${messageStats.new} unread`}
          color="gold"
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Status */}
        <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={18} className="text-[var(--theme-primary)]" />
            <h3 className="text-white font-[var(--font-display)] font-semibold">
              Booking Status
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-yellow-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Pending
                </span>
              </div>
              <span className="text-white font-semibold">
                {bookingStats.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Confirmed
                </span>
              </div>
              <span className="text-white font-semibold">
                {bookingStats.confirmed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Completed
                </span>
              </div>
              <span className="text-white font-semibold">
                {bookingStats.completed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-red-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Cancelled
                </span>
              </div>
              <span className="text-white font-semibold">
                {bookingStats.cancelled}
              </span>
            </div>
          </div>
        </div>

        {/* Reviews Status */}
        <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-[var(--theme-primary)]" />
            <h3 className="text-white font-[var(--font-display)] font-semibold">
              Review Moderation
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-yellow-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Pending
                </span>
              </div>
              <span className="text-white font-semibold">
                {reviewModStats.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Approved
                </span>
              </div>
              <span className="text-white font-semibold">
                {reviewModStats.approved}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-red-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Rejected
                </span>
              </div>
              <span className="text-white font-semibold">
                {reviewModStats.rejected}
              </span>
            </div>
          </div>
          {reviewStats && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Star
                  size={14}
                  className="text-[var(--theme-primary)] fill-[var(--theme-primary)]"
                />
                <span className="text-white font-[var(--font-display)] font-bold text-lg">
                  {reviewStats.average?.toFixed(1)}
                </span>
                <span className="text-white/40 text-xs font-[var(--font-body)]">
                  average rating
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Messages Status */}
        <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-[var(--theme-primary)]" />
            <h3 className="text-white font-[var(--font-display)] font-semibold">
              Messages
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle
                  size={14}
                  className="text-[var(--theme-primary)]"
                />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  New
                </span>
              </div>
              <span className="text-white font-semibold">
                {messageStats.new}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-blue-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Read
                </span>
              </div>
              <span className="text-white font-semibold">
                {messageStats.read}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Replied
                </span>
              </div>
              <span className="text-white font-semibold">
                {messageStats.replied}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-gray-400" />
                <span className="text-white/70 text-sm font-[var(--font-body)]">
                  Archived
                </span>
              </div>
              <span className="text-white font-semibold">
                {messageStats.archived}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-5">
        <h3 className="text-white font-[var(--font-display)] font-semibold mb-4">
          Recent Bookings
        </h3>
        {bookings && bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-2 px-3">
                    Code
                  </th>
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-2 px-3">
                    Package
                  </th>
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-2 px-3">
                    Guest
                  </th>
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-2 px-3">
                    Status
                  </th>
                  <th className="text-right text-white/50 font-[var(--font-body)] font-medium py-2 px-3">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking: any) => (
                  <tr
                    key={booking.id}
                    className="border-b border-[var(--theme-primary)]/5 hover:bg-[var(--theme-primary)]/5 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-[var(--theme-primary)] font-mono text-xs">
                      {booking.confirmationCode}
                    </td>
                    <td className="py-2.5 px-3 text-white/80 font-[var(--font-body)]">
                      {booking.packageName}
                    </td>
                    <td className="py-2.5 px-3 text-white/60 font-[var(--font-body)]">
                      {booking.guestName || "N/A"}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={booking.status} count={0} />
                    </td>
                    <td className="py-2.5 px-3 text-right text-white font-[var(--font-body)] font-medium">
                      {booking.totalPrice
                        ? `$${parseFloat(booking.totalPrice).toLocaleString()}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarCheck
              size={32}
              className="text-[var(--theme-primary)]/30 mx-auto mb-3"
            />
            <p className="text-white/40 text-sm font-[var(--font-body)]">
              No bookings yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
