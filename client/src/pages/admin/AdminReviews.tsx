import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import {
  Star,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  MessageSquare,
  ThumbsUp,
  Send,
  User,
  MapPin,
  Calendar,
} from "lucide-react";

const approvalColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

function ApprovalBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-[var(--font-body)] font-medium border ${approvalColors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
    >
      {status === "pending" && <Clock size={10} className="mr-1" />}
      {status === "approved" && <CheckCircle size={10} className="mr-1" />}
      {status === "rejected" && <XCircle size={10} className="mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={
            s <= rating
              ? "text-[var(--theme-primary)] fill-[var(--theme-primary)]"
              : "text-[var(--theme-primary)]/20"
          }
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const utils = trpc.useUtils();
  const { data: reviews, isLoading } = trpc.reviews.listAll.useQuery({
    limit: 100,
    offset: 0,
  });

  const moderateMutation = trpc.reviews.moderate.useMutation({
    onSuccess: () => {
      utils.reviews.listAll.invalidate();
      toast.success("Review moderation updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const replyMutation = trpc.reviews.reply.useMutation({
    onSuccess: () => {
      utils.reviews.listAll.invalidate();
      setReplyText("");
      setShowReplyForm(false);
      toast.success("Reply sent successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredReviews = reviews?.filter((r: any) => {
    const matchesSearch =
      !searchTerm ||
      r.tripName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || r.isApproved === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--theme-primary)]/10 rounded" />
        <div className="h-12 bg-[var(--theme-surface)] rounded-lg border border-white/5" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-[var(--theme-surface)] rounded-lg border border-white/5"
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
          Reviews Management
        </h1>
        <p className="text-white/50 text-sm font-[var(--font-body)] mt-1">
          Moderate customer reviews and respond to feedback
        </p>
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
            placeholder="Search by trip, guest, title, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 pl-10 pr-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
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

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews && filteredReviews.length > 0 ? (
          filteredReviews.map((review: any) => (
            <div
              key={review.id}
              className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-5 hover:border-[var(--theme-primary)]/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Review Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/10 border border-white/10 flex items-center justify-center">
                      <User size={14} className="text-[var(--theme-primary)]" />
                    </div>
                    <div>
                      <p className="text-white font-[var(--font-body)] font-medium text-sm">
                        {review.guestName || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        {review.tripName && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} /> {review.tripName}
                          </span>
                        )}
                        {review.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />{" "}
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-white/40 text-xs">
                      ({review.rating}/5)
                    </span>
                  </div>
                  <h4 className="text-white font-[var(--font-display)] font-semibold mb-1">
                    {review.title || "No title"}
                  </h4>

                  {/* Content Preview */}
                  <p className="text-white/60 text-sm font-[var(--font-body)] leading-relaxed line-clamp-2">
                    {review.content}
                  </p>

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="mt-3 bg-[var(--theme-primary)]/5 border border-white/5 rounded-lg p-3">
                      <p className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] font-medium mb-1">
                        Admin Reply:
                      </p>
                      <p className="text-white/60 text-xs font-[var(--font-body)]">
                        {review.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={10} /> {review.helpfulCount || 0} helpful
                    </span>
                  </div>
                </div>

                {/* Right Side - Status & Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <ApprovalBadge status={review.isApproved} />
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setReplyText(review.adminReply || "");
                      setShowReplyForm(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]/60 hover:text-[var(--theme-primary)] transition-colors"
                    title="View & manage"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-12 text-center">
            <Star
              size={40}
              className="text-[var(--theme-primary)]/20 mx-auto mb-3"
            />
            <p className="text-white/40 text-sm font-[var(--font-body)]">
              {searchTerm || filterStatus !== "all"
                ? "No reviews match your filters"
                : "No reviews yet"}
            </p>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReview(null);
          }}
        >
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[var(--theme-surface)] z-10">
              <div>
                <h3 className="text-white font-[var(--font-display)] text-lg font-semibold">
                  Review Details
                </h3>
                <p className="text-white/40 text-xs font-[var(--font-body)] mt-0.5">
                  By {selectedReview.guestName || "Anonymous"} -{" "}
                  {selectedReview.tripName}
                </p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Rating */}
              <div className="flex items-center gap-3">
                <StarRating rating={selectedReview.rating} />
                <span className="text-white font-[var(--font-display)] font-bold text-lg">
                  {selectedReview.rating}/5
                </span>
                <ApprovalBadge status={selectedReview.isApproved} />
              </div>

              {/* Content */}
              <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
                <h4 className="text-white font-[var(--font-display)] font-semibold mb-2">
                  {selectedReview.title || "No title"}
                </h4>
                <p className="text-white/70 text-sm font-[var(--font-body)] leading-relaxed whitespace-pre-wrap">
                  {selectedReview.content}
                </p>
              </div>

              {/* Moderation Actions */}
              <div>
                <p className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
                  Moderation
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      moderateMutation.mutate({
                        id: selectedReview.id,
                        isApproved: "approved",
                      });
                      setSelectedReview({
                        ...selectedReview,
                        isApproved: "approved",
                      });
                    }}
                    disabled={selectedReview.isApproved === "approved"}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-[var(--font-body)] font-medium rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => {
                      moderateMutation.mutate({
                        id: selectedReview.id,
                        isApproved: "rejected",
                      });
                      setSelectedReview({
                        ...selectedReview,
                        isApproved: "rejected",
                      });
                    }}
                    disabled={selectedReview.isApproved === "rejected"}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-[var(--font-body)] font-medium rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => {
                      moderateMutation.mutate({
                        id: selectedReview.id,
                        isApproved: "pending",
                      });
                      setSelectedReview({
                        ...selectedReview,
                        isApproved: "pending",
                      });
                    }}
                    disabled={selectedReview.isApproved === "pending"}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-[var(--font-body)] font-medium rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                  >
                    <Clock size={14} /> Set Pending
                  </button>
                </div>
              </div>

              {/* Admin Reply */}
              <div>
                <p className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
                  Admin Reply
                </p>
                {selectedReview.adminReply && !showReplyForm ? (
                  <div className="bg-[var(--theme-primary)]/5 border border-white/5 rounded-lg p-4 mb-3">
                    <p className="text-white/70 text-sm font-[var(--font-body)] leading-relaxed">
                      {selectedReview.adminReply}
                    </p>
                    <button
                      onClick={() => {
                        setShowReplyForm(true);
                        setReplyText(selectedReview.adminReply);
                      }}
                      className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] mt-2 hover:underline"
                    >
                      Edit reply
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply to this review..."
                      rows={4}
                      className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!replyText.trim()) {
                            toast.error("Please write a reply");
                            return;
                          }
                          replyMutation.mutate({
                            id: selectedReview.id,
                            adminReply: replyText.trim(),
                          });
                          setSelectedReview({
                            ...selectedReview,
                            adminReply: replyText.trim(),
                          });
                        }}
                        disabled={replyMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-[var(--font-body)] font-medium rounded-lg bg-[var(--theme-primary)] text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
                      >
                        <Send size={14} />
                        {replyMutation.isPending ? "Sending..." : "Send Reply"}
                      </button>
                      {showReplyForm && (
                        <button
                          onClick={() => setShowReplyForm(false)}
                          className="px-4 py-2 text-sm font-[var(--font-body)] text-white/50 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
