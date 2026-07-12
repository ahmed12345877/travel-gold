import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Star, Search, Trash2, Eye, CheckCircle, XCircle, MessageSquare
} from "lucide-react";

export default function ReviewsAdmin() {
  const [search, setSearch] = useState("");

  const { data: reviewsData, refetch } = trpc.reviews.listAll.useQuery({ limit: 50, offset: 0 });
  const reviews = reviewsData || [];
  const moderateMut = trpc.reviews.moderate.useMutation({ onSuccess: () => refetch() });

  const filtered = reviews.filter((r: any) =>
    r.userName?.toLowerCase().includes(search.toLowerCase()) || r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="text-[var(--theme-primary)]" size={24} />
            إدارة التقييمات
          </h1>
          <p className="text-white/50 text-sm mt-1">مراجعة وإدارة تقييمات العملاء</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{reviews.length}</p>
          <p className="text-xs text-white/50">إجمالي التقييمات</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star size={16} className="text-[var(--theme-primary)] fill-[var(--theme-primary)]" />
            <p className="text-2xl font-bold text-[var(--theme-primary)]">{avgRating}</p>
          </div>
          <p className="text-xs text-white/50">متوسط التقييم</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{reviews.filter((r: any) => r.rating >= 4).length}</p>
          <p className="text-xs text-white/50">تقييمات إيجابية</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[var(--theme-surface)] border-white/10 text-white pr-10" placeholder="البحث في التقييمات..." />
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-12 text-center">
          <MessageSquare size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/40">لا توجد تقييمات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review: any) => (
            <div key={review.id} className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-[var(--theme-primary)] font-bold">{(review.userName || "U")[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{review.userName || "مجهول"}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} size={10} className={i < (review.rating || 0) ? "text-[var(--theme-primary)] fill-[var(--theme-primary)]" : "text-white/10"} />
                        ))}
                      </div>
                      <span className="text-xs text-white/20">{review.createdAt ? new Date(review.createdAt).toLocaleDateString("ar-EG") : ""}</span>
                    </div>
                    <p className="text-sm text-white/60">{review.comment}</p>
                    {review.destination && (
                      <span className="text-xs text-[var(--theme-primary)]/60 mt-1 inline-block">الوجهة: {review.destination}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { if (confirm("هل أنت متأكد من إخفاء هذا التقييم؟")) moderateMut.mutate({ id: review.id, isApproved: "rejected" }); }}
                  className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
