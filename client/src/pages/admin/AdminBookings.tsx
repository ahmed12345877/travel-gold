import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  X,
  MapPin,
  Users,
  CreditCard,
  Mail,
  Phone,
  User,
  DollarSign,
} from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-[var(--font-body)] font-medium border ${statusColors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: bookings, isLoading } = trpc.bookings.listAll.useQuery({
    limit: 100,
    offset: 0,
  });

  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      utils.bookings.listAll.invalidate();
      toast.success("Booking status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const updatePaymentMutation = trpc.bookings.updatePaymentStatus.useMutation({
    onSuccess: () => {
      utils.bookings.listAll.invalidate();
      toast.success("Payment status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredBookings = bookings?.filter((b: any) => {
    const matchesSearch =
      !searchTerm ||
      b.confirmationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.packageName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--theme-primary)]/10 rounded" />
        <div className="h-12 bg-[var(--theme-surface)] rounded-lg border border-white/5" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[var(--theme-surface)] rounded-lg border border-white/5" />
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
          Bookings Management
        </h1>
        <p className="text-white/50 text-sm font-[var(--font-body)] mt-1">
          Manage and track all customer bookings
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]/50" />
          <input
            type="text"
            placeholder="Search by code, name, email, or package..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 pl-10 pr-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 text-xs font-[var(--font-body)] font-medium rounded-lg border transition-all ${
                filterStatus === status
                  ? "bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/40 text-[var(--theme-primary)]"
                  : "bg-[var(--theme-surface)] border-white/5 text-white/50 hover:border-[var(--theme-primary)]/30"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg overflow-hidden">
        {filteredBookings && filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-[var(--theme-surface)]/50">
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-3 px-4">Code</th>
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-3 px-4">Package</th>
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-3 px-4">Guest</th>
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-3 px-4">Date</th>
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-3 px-4">Status</th>
                  <th className="text-left text-white/50 font-[var(--font-body)] font-medium py-3 px-4">Payment</th>
                  <th className="text-right text-white/50 font-[var(--font-body)] font-medium py-3 px-4">Price</th>
                  <th className="text-center text-white/50 font-[var(--font-body)] font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking: any) => (
                  <tr
                    key={booking.id}
                    className="border-b border-[var(--theme-primary)]/5 hover:bg-[var(--theme-primary)]/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-[var(--theme-primary)] font-mono text-xs">
                      {booking.confirmationCode}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white/80 font-[var(--font-body)] text-sm">{booking.packageName}</p>
                        {booking.destination && (
                          <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {booking.destination}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white/80 font-[var(--font-body)] text-sm">{booking.guestName || "N/A"}</p>
                        {booking.guestEmail && (
                          <p className="text-white/40 text-xs mt-0.5">{booking.guestEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white/60 text-xs font-[var(--font-body)]">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={booking.paymentStatus || "pending"} />
                    </td>
                    <td className="py-3 px-4 text-right text-white font-[var(--font-body)] font-medium">
                      {booking.totalPrice ? `$${parseFloat(booking.totalPrice).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-1.5 rounded-lg hover:bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]/60 hover:text-[var(--theme-primary)] transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarCheck size={40} className="text-[var(--theme-primary)]/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-[var(--font-body)]">
              {searchTerm || filterStatus !== "all" ? "No bookings match your filters" : "No bookings yet"}
            </p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBooking(null);
          }}
        >
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[var(--theme-surface)] z-10">
              <div>
                <h3 className="text-white font-[var(--font-display)] text-lg font-semibold">
                  Booking Details
                </h3>
                <p className="text-[var(--theme-primary)] font-mono text-xs mt-0.5">
                  {selectedBooking.confirmationCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Package Info */}
              <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
                <h4 className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
                  Package Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs">Package</p>
                    <p className="text-white font-[var(--font-body)]">{selectedBooking.packageName}</p>
                  </div>
                  {selectedBooking.destination && (
                    <div>
                      <p className="text-white/40 text-xs">Destination</p>
                      <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                        <MapPin size={12} className="text-[var(--theme-primary)]" />
                        {selectedBooking.destination}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-white/40 text-xs">Guests</p>
                    <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                      <Users size={12} className="text-[var(--theme-primary)]" />
                      {selectedBooking.adults} Adults
                      {selectedBooking.children > 0 && `, ${selectedBooking.children} Children`}
                    </p>
                  </div>
                  {selectedBooking.roomType && (
                    <div>
                      <p className="text-white/40 text-xs">Room Type</p>
                      <p className="text-white font-[var(--font-body)] capitalize">{selectedBooking.roomType}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Info */}
              <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
                <h4 className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
                  Guest Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs">Name</p>
                    <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                      <User size={12} className="text-[var(--theme-primary)]" />
                      {selectedBooking.guestName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Email</p>
                    <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                      <Mail size={12} className="text-[var(--theme-primary)]" />
                      {selectedBooking.guestEmail || "N/A"}
                    </p>
                  </div>
                  {selectedBooking.guestPhone && (
                    <div>
                      <p className="text-white/40 text-xs">Phone</p>
                      <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                        <Phone size={12} className="text-[var(--theme-primary)]" />
                        {selectedBooking.guestPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Status */}
              <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
                <h4 className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
                  Payment & Status
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs">Total Price</p>
                    <p className="text-white font-[var(--font-body)] font-bold flex items-center gap-1">
                      <DollarSign size={12} className="text-[var(--theme-primary)]" />
                      {selectedBooking.totalPrice
                        ? `${parseFloat(selectedBooking.totalPrice).toLocaleString()} ${selectedBooking.currency || "USD"}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Payment Method</p>
                    <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                      <CreditCard size={12} className="text-[var(--theme-primary)]" />
                      {selectedBooking.paymentMethod?.replace("_", " ") || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
                  <h4 className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-2">
                    Special Requests
                  </h4>
                  <p className="text-white/70 text-sm font-[var(--font-body)] leading-relaxed">
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div>
                  <p className="text-white/40 text-xs font-[var(--font-body)] mb-2">Update Booking Status</p>
                  <div className="flex gap-2">
                    {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            updateStatusMutation.mutate({ id: selectedBooking.id, status });
                            setSelectedBooking({ ...selectedBooking, status });
                          }}
                          disabled={selectedBooking.status === status}
                          className={`px-3 py-1.5 text-xs font-[var(--font-body)] font-medium rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                            selectedBooking.status === status
                              ? "bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/40 text-[var(--theme-primary)]"
                              : "bg-[var(--theme-surface)] border-white/5 text-white/60 hover:border-[var(--theme-primary)]/30 hover:text-white"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white/40 text-xs font-[var(--font-body)] mb-2">Update Payment Status</p>
                  <div className="flex gap-2">
                    {(["pending", "paid", "failed", "refunded"] as PaymentStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            updatePaymentMutation.mutate({
                              id: selectedBooking.id,
                              paymentStatus: status,
                            });
                            setSelectedBooking({ ...selectedBooking, paymentStatus: status });
                          }}
                          disabled={selectedBooking.paymentStatus === status}
                          className={`px-3 py-1.5 text-xs font-[var(--font-body)] font-medium rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                            selectedBooking.paymentStatus === status
                              ? "bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/40 text-[var(--theme-primary)]"
                              : "bg-[var(--theme-surface)] border-white/5 text-white/60 hover:border-[var(--theme-primary)]/30 hover:text-white"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
