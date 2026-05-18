import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import {
  Tag,
  Search,
  Plus,
  Edit3,
  Power,
  PowerOff,
  Calendar,
  DollarSign,
  Percent,
  X,
  Copy,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";

/* ─── Status Helpers ─── */
const statusConfig: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  active: {
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle,
    label: "Active",
  },
  inactive: {
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    icon: PowerOff,
    label: "Inactive",
  },
  expired: {
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: Clock,
    label: "Expired",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-[var(--font-body)] font-medium border ${config.color}`}
    >
      <Icon size={10} />
      {config.label}
    </span>
  );
}

/* ─── Create/Edit Modal ─── */
function OfferModal({
  offer,
  onClose,
  onSave,
  isSaving,
}: {
  offer: any | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isSaving: boolean;
}) {
  const isEdit = !!offer;
  const [form, setForm] = useState({
    title: offer?.title || "",
    description: offer?.description || "",
    discountType: offer?.discountType || "percentage",
    discountValue: offer?.discountValue || "",
    promoCode: offer?.promoCode || "",
    startDate: offer?.startDate
      ? new Date(offer.startDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    endDate: offer?.endDate
      ? new Date(offer.endDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    category: offer?.category || "",
    destination: offer?.destination || "",
    imageUrl: offer?.imageUrl || "",
    totalSpots: offer?.totalSpots?.toString() || "",
    badgeText: offer?.badgeText || "",
    badgeColor: offer?.badgeColor || "#D4A853",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!form.discountValue.trim()) {
      toast.error("Please enter a discount value");
      return;
    }

    const payload: any = {
      title: form.title,
      description: form.description || undefined,
      discountType: form.discountType as "percentage" | "fixed",
      discountValue: form.discountValue,
      startDate: new Date(form.startDate).getTime(),
      endDate: new Date(form.endDate).getTime(),
      category: form.category || undefined,
      destination: form.destination || undefined,
      imageUrl: form.imageUrl || undefined,
      totalSpots: form.totalSpots ? parseInt(form.totalSpots) : undefined,
      badgeText: form.badgeText || undefined,
      badgeColor: form.badgeColor || undefined,
    };

    if (isEdit) {
      payload.id = offer.id;
    } else {
      payload.promoCode = form.promoCode || undefined;
    }

    onSave(payload);
  };

  const inputClass =
    "w-full bg-[var(--theme-surface)] border border-white/10 text-white px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors placeholder:text-white/20 font-[var(--font-body)]";
  const labelClass =
    "text-white/60 text-xs font-[var(--font-body)] uppercase tracking-wider mb-1.5 block";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[var(--theme-surface)] z-10">
          <div>
            <h3 className="text-white font-[var(--font-display)] text-lg font-semibold">
              {isEdit ? "Edit Offer" : "Create New Offer"}
            </h3>
            <p className="text-white/40 text-xs font-[var(--font-body)] mt-0.5">
              {isEdit
                ? "Update the offer details below"
                : "Fill in the details to create a new promotional offer"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title & Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Summer Flash Sale"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Discount Type *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, discountType: "percentage" }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-[var(--font-body)] rounded-lg border transition-all ${
                    form.discountType === "percentage"
                      ? "bg-[var(--theme-primary)]/15 border-[var(--theme-primary)]/40 text-[var(--theme-primary)]"
                      : "bg-[var(--theme-surface)] border-white/5 text-white/50 hover:border-[var(--theme-primary)]/30"
                  }`}
                >
                  <Percent size={14} /> Percentage
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, discountType: "fixed" }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-[var(--font-body)] rounded-lg border transition-all ${
                    form.discountType === "fixed"
                      ? "bg-[var(--theme-primary)]/15 border-[var(--theme-primary)]/40 text-[var(--theme-primary)]"
                      : "bg-[var(--theme-surface)] border-white/5 text-white/50 hover:border-[var(--theme-primary)]/30"
                  }`}
                >
                  <DollarSign size={14} /> Fixed Amount
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Discount Value *{" "}
                {form.discountType === "percentage" ? "(%)" : "($)"}
              </label>
              <input
                type="text"
                value={form.discountValue}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discountValue: e.target.value.replace(/[^0-9.]/g, ""),
                  }))
                }
                placeholder={
                  form.discountType === "percentage" ? "e.g. 30" : "e.g. 150"
                }
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description of the offer..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Promo Code & Spots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Promo Code {isEdit && "(read-only)"}
              </label>
              <input
                type="text"
                value={form.promoCode}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    promoCode: e.target.value.toUpperCase().replace(/\s/g, ""),
                  }))
                }
                placeholder="e.g. SUMMER30"
                className={inputClass}
                disabled={isEdit}
              />
            </div>
            <div>
              <label className={labelClass}>Total Spots</label>
              <input
                type="text"
                value={form.totalSpots}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    totalSpots: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Leave empty for unlimited"
                className={inputClass}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Category & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="e.g. Beach, Adventure, Cultural"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Destination</label>
              <input
                type="text"
                value={form.destination}
                onChange={(e) =>
                  setForm((f) => ({ ...f, destination: e.target.value }))
                }
                placeholder="e.g. Cairo, Sharm El Sheikh"
                className={inputClass}
              />
            </div>
          </div>

          {/* Badge & Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Badge Text</label>
              <input
                type="text"
                value={form.badgeText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, badgeText: e.target.value }))
                }
                placeholder="e.g. HOT DEAL"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Badge Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.badgeColor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, badgeColor: e.target.value }))
                  }
                  className="h-[42px] w-12 rounded-lg border border-white/10 bg-[var(--theme-surface)] cursor-pointer"
                />
                <input
                  type="text"
                  value={form.badgeColor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, badgeColor: e.target.value }))
                  }
                  className={`${inputClass} flex-1`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-white/5">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-semibold text-sm rounded-lg hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--theme-surface)]/30 border-t-[var(--theme-surface)] rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {isEdit ? <Edit3 size={14} /> : <Plus size={14} />}
                  {isEdit ? "Update Offer" : "Create Offer"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-white/10 text-white/60 font-[var(--font-body)] text-sm rounded-lg hover:border-[var(--theme-primary)]/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminOffers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: offers, isLoading } = trpc.offers.listAll.useQuery({
    limit: 100,
    offset: 0,
  });

  const createMutation = trpc.offers.create.useMutation({
    onSuccess: () => {
      utils.offers.listAll.invalidate();
      setShowModal(false);
      setEditingOffer(null);
      toast.success("Offer created successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.offers.update.useMutation({
    onSuccess: () => {
      utils.offers.listAll.invalidate();
      setShowModal(false);
      setEditingOffer(null);
      toast.success("Offer updated successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = (data: any) => {
    if (data.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggleStatus = (offer: any) => {
    const newStatus = offer.isActive === "active" ? "inactive" : "active";
    updateMutation.mutate({ id: offer.id, isActive: newStatus });
  };

  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Promo code "${code}" copied`);
  };

  const filteredOffers = offers?.filter((o: any) => {
    const matchesSearch =
      !searchTerm ||
      o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.promoCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || o.isActive === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const isExpired = (offer: any) => offer.endDate && Date.now() > offer.endDate;
  const daysLeft = (offer: any) => {
    if (!offer.endDate) return null;
    const diff = offer.endDate - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / 86400000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--theme-primary)]/10 rounded" />
        <div className="h-12 bg-[var(--theme-surface)] rounded-lg border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-[var(--font-display)] font-bold text-white">
            Offers
          </h1>
          <p className="text-white/50 text-sm font-[var(--font-body)] mt-1">
            Create and manage promotional offers and discount codes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOffer(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-semibold text-sm rounded-lg hover:bg-[var(--theme-primary-light)] transition-colors shrink-0"
        >
          <Plus size={16} />
          New Offer
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]/50"
          />
          <input
            type="text"
            placeholder="Search by title, promo code, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 pl-10 pr-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "inactive", "expired"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 text-xs font-[var(--font-body)] font-medium rounded-lg border transition-all ${
                filterStatus === status
                  ? "bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/40 text-[var(--theme-primary)]"
                  : "bg-[var(--theme-surface)] border-white/5 text-white/50 hover:border-[var(--theme-primary)]/30"
              }`}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Grid */}
      {filteredOffers && filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOffers.map((offer: any) => {
            const expired = isExpired(offer);
            const remaining = daysLeft(offer);
            return (
              <div
                key={offer.id}
                className={`bg-[var(--theme-surface)] border rounded-xl overflow-hidden transition-all hover:border-[var(--theme-primary)]/30 ${
                  offer.isActive === "active" && !expired
                    ? "border-white/10"
                    : "border-white/5 opacity-75"
                }`}
              >
                {/* Card Header with badge */}
                <div className="relative h-20 bg-gradient-to-br from-[var(--theme-primary)]/10 via-[var(--theme-surface)] to-[var(--theme-primary)]/5 flex items-center justify-center">
                  {offer.imageUrl ? (
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  ) : null}
                  <div className="relative z-10 text-center">
                    <div className="text-3xl font-[var(--font-display)] font-bold text-[var(--theme-primary)]">
                      {offer.discountType === "percentage"
                        ? `${offer.discountValue}%`
                        : `$${offer.discountValue}`}
                    </div>
                    <div className="text-white/40 text-[10px] font-[var(--font-body)] uppercase tracking-wider">
                      {offer.discountType === "percentage" ? "Discount" : "Off"}
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <StatusBadge
                      status={expired ? "expired" : offer.isActive}
                    />
                  </div>
                  {/* Badge */}
                  {offer.badgeText && (
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-[var(--font-body)] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: offer.badgeColor || "#D4A853" }}
                    >
                      {offer.badgeText}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <h3 className="text-white font-[var(--font-display)] font-semibold text-sm line-clamp-1">
                    {offer.title}
                  </h3>
                  {offer.description && (
                    <p className="text-white/40 text-xs font-[var(--font-body)] line-clamp-2">
                      {offer.description}
                    </p>
                  )}

                  {/* Promo Code */}
                  {offer.promoCode && (
                    <button
                      onClick={() => handleCopyPromo(offer.promoCode)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-[var(--theme-surface)] border border-dashed border-[var(--theme-primary)]/30 rounded-lg hover:border-[var(--theme-primary)]/50 transition-colors group"
                    >
                      <span className="text-[var(--theme-primary)] font-mono text-sm font-bold tracking-wider">
                        {offer.promoCode}
                      </span>
                      <Copy
                        size={12}
                        className="text-white/30 group-hover:text-[var(--theme-primary)] transition-colors"
                      />
                    </button>
                  )}

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-[var(--font-body)]">
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Calendar
                        size={10}
                        className="text-[var(--theme-primary)]/50"
                      />
                      <span>
                        {offer.startDate
                          ? new Date(offer.startDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Calendar
                        size={10}
                        className="text-[var(--theme-primary)]/50"
                      />
                      <span>
                        {offer.endDate
                          ? new Date(offer.endDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                    {offer.totalSpots != null && (
                      <div className="flex items-center gap-1.5 text-white/40">
                        <Users
                          size={10}
                          className="text-[var(--theme-primary)]/50"
                        />
                        <span>
                          {offer.bookedSpots || 0}/{offer.totalSpots} spots
                        </span>
                      </div>
                    )}
                    {remaining !== null && remaining > 0 && (
                      <div className="flex items-center gap-1.5 text-[var(--theme-primary)]/70">
                        <Clock size={10} />
                        <span>{remaining} days left</span>
                      </div>
                    )}
                    {expired && (
                      <div className="flex items-center gap-1.5 text-red-400/70">
                        <AlertCircle size={10} />
                        <span>Expired</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {offer.category && (
                      <span className="px-2 py-0.5 bg-[var(--theme-primary)]/5 border border-white/5 rounded text-[10px] text-white/40 font-[var(--font-body)]">
                        {offer.category}
                      </span>
                    )}
                    {offer.destination && (
                      <span className="px-2 py-0.5 bg-[var(--theme-primary)]/5 border border-white/5 rounded text-[10px] text-white/40 font-[var(--font-body)]">
                        {offer.destination}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingOffer(offer);
                      setShowModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-[var(--font-body)] font-medium border border-white/8 text-white/60 rounded-lg hover:border-[var(--theme-primary)]/30 hover:text-white transition-colors"
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(offer)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-[var(--font-body)] font-medium rounded-lg border transition-colors ${
                      offer.isActive === "active"
                        ? "border-red-500/20 text-red-400/70 hover:border-red-500/40 hover:text-red-400"
                        : "border-emerald-500/20 text-emerald-400/70 hover:border-emerald-500/40 hover:text-emerald-400"
                    }`}
                  >
                    {offer.isActive === "active" ? (
                      <>
                        <PowerOff size={12} /> Deactivate
                      </>
                    ) : (
                      <>
                        <Power size={12} /> Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-12 text-center">
          <Sparkles
            size={40}
            className="text-[var(--theme-primary)]/20 mx-auto mb-3"
          />
          <p className="text-white/40 text-sm font-[var(--font-body)] mb-4">
            {searchTerm || filterStatus !== "all"
              ? "No offers match your filters"
              : "No offers created yet"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              onClick={() => {
                setEditingOffer(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-semibold text-sm rounded-lg hover:bg-[var(--theme-primary-light)] transition-colors"
            >
              <Plus size={14} />
              Create Your First Offer
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <OfferModal
          offer={editingOffer}
          onClose={() => {
            setShowModal(false);
            setEditingOffer(null);
          }}
          onSave={handleSave}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
