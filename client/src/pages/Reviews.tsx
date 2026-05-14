/*
 * Design: Art Deco Luxe – Black & Gold
 * Reviews Page: Full review system with ratings, review cards,
 * write-a-review modal, filtering, and statistics
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import OptimizedImage from "@/components/OptimizedImage";
import { toast } from "sonner";
import PageMeta from "@/components/PageMeta";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Camera,
  Filter,
  ChevronDown,
  X,
  User,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Check,
  Quote,
  Send,
  Image as ImageIcon,
  ArrowRight,
  Heart,
  Flag,
  Share2,
  SortAsc,
} from "lucide-react";

/* ─── Types ─── */
interface Review {
  id: number;
  author: string;
  avatar: string;
  location: string;
  trip: string;
  tripImage: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  photos: string[];
  helpful: number;
  verified: boolean;
  response?: string;
  categories: {
    service: number;
    value: number;
    experience: number;
    guide: number;
  };
}

/* ─── Sample Reviews Data ─── */
const reviewsData: Review[] = [
  {
    id: 1,
    author: "Sarah Mitchell",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    location: "London, UK",
    trip: "Pyramids & Nile Cruise Adventure",
    tripImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-egypt-YcosuhKLMYbaJ475QVrVxy.webp",
    rating: 5,
    date: "2026-03-15",
    title: "An Absolutely Magical Experience!",
    content:
      "From the moment we arrived in Cairo, VANIR GROUP made everything seamless. Our private guide, Ahmed, was incredibly knowledgeable about Egyptian history and made every temple visit come alive with stories. The Nile cruise was the highlight — watching the sunset from the deck while sailing past ancient temples was unforgettable. The 5-star accommodations exceeded our expectations, and every meal was a culinary journey through Egyptian cuisine. I cannot recommend this trip enough!",
    photos: [
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=300&h=200&fit=crop",
    ],
    helpful: 47,
    verified: true,
    response:
      "Thank you so much, Sarah! We're thrilled that Ahmed and the team made your Egyptian adventure truly special. We hope to welcome you back for another journey soon!",
    categories: { service: 5, value: 5, experience: 5, guide: 5 },
  },
  {
    id: 2,
    author: "James Anderson",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    location: "New York, USA",
    trip: "Sharm El Sheikh Beach Escape",
    tripImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-sharm-Fh2PhqqrRQGfdg6EtwXedu.webp",
    rating: 5,
    date: "2026-03-01",
    title: "Paradise Found in the Red Sea",
    content:
      "The diving experience in Sharm El Sheikh was world-class. The coral reefs were stunning, and we even spotted dolphins during our boat trip to Tiran Island. The resort was luxurious with an incredible private beach. The spa treatments were the perfect way to unwind after a day of exploring underwater wonders. VANIR GROUP's attention to detail made this the best vacation we've ever had.",
    photos: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop",
    ],
    helpful: 35,
    verified: true,
    categories: { service: 5, value: 4, experience: 5, guide: 5 },
  },
  {
    id: 3,
    author: "Fatima Al-Rashid",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    location: "Dubai, UAE",
    trip: "Luxury Hurghada All-Inclusive",
    tripImage:
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop",
    rating: 5,
    date: "2026-02-20",
    title: "Luxury Redefined — Worth Every Penny",
    content:
      "As someone who travels frequently, I can say that VANIR GROUP sets a new standard for luxury travel. The Hurghada resort was absolutely stunning — from the private beach to the gourmet restaurants. The submarine tour was a unique experience I'll never forget. The kids club kept our children entertained while we enjoyed the spa. Every detail was thoughtfully planned.",
    photos: [],
    helpful: 28,
    verified: true,
    response:
      "We're honored by your kind words, Fatima! Creating memorable family experiences is at the heart of what we do. We look forward to planning your next adventure!",
    categories: { service: 5, value: 5, experience: 5, guide: 4 },
  },
  {
    id: 4,
    author: "Marco Rossi",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    location: "Rome, Italy",
    trip: "Mount Sinai & Desert Trek",
    tripImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    rating: 4,
    date: "2026-02-10",
    title: "A Spiritual Journey Through the Desert",
    content:
      "Climbing Mount Sinai at 2 AM to watch the sunrise was one of the most profound experiences of my life. The Bedouin guides were warm and welcoming, sharing their culture and traditions around the campfire. The Colored Canyon hike was breathtaking. The only reason I'm giving 4 stars instead of 5 is that the desert camping could have been slightly more comfortable, but it was still an incredible adventure.",
    photos: [
      "https://images.unsplash.com/photo-1682686581580-d99b0230064e?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&h=200&fit=crop",
    ],
    helpful: 22,
    verified: true,
    categories: { service: 4, value: 4, experience: 5, guide: 5 },
  },
  {
    id: 5,
    author: "Emily Chen",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    location: "Sydney, Australia",
    trip: "Siwa Oasis Desert Retreat",
    tripImage:
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&h=400&fit=crop",
    rating: 5,
    date: "2026-01-25",
    title: "A Hidden Gem — Truly Off the Beaten Path",
    content:
      "Siwa Oasis was unlike anything I've ever experienced. The eco-lodge was charming, the natural hot springs were heavenly, and sandboarding in the Great Sand Sea was exhilarating. The stargazing experience was magical — I've never seen so many stars in my life. VANIR GROUP's local connections made this trip authentic and unforgettable. This is the kind of travel that changes you.",
    photos: [
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=300&h=200&fit=crop",
    ],
    helpful: 41,
    verified: true,
    categories: { service: 5, value: 5, experience: 5, guide: 5 },
  },
  {
    id: 6,
    author: "David Thompson",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    location: "Toronto, Canada",
    trip: "Alexandria & Mediterranean Coast",
    tripImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    rating: 4,
    date: "2026-01-15",
    title: "A Cultural Feast by the Mediterranean",
    content:
      "Alexandria surprised me with its rich history and vibrant culture. The Library of Alexandria was fascinating, and our guide brought the ancient stories to life. The seafood along the corniche was some of the best I've ever had. The Montazah Palace gardens were beautiful for an afternoon stroll. A wonderful short getaway that I'd recommend to anyone interested in history and good food.",
    photos: [],
    helpful: 18,
    verified: true,
    categories: { service: 4, value: 5, experience: 4, guide: 4 },
  },
  {
    id: 7,
    author: "Aisha Khalil",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    location: "Riyadh, Saudi Arabia",
    trip: "Pyramids & Nile Cruise Adventure",
    tripImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-egypt-YcosuhKLMYbaJ475QVrVxy.webp",
    rating: 5,
    date: "2026-01-05",
    title: "Exceeded All Expectations",
    content:
      "I've always dreamed of visiting the Pyramids, and VANIR GROUP made that dream come true in the most spectacular way. The private tour meant we could explore at our own pace without the crowds. The Nile cruise was pure luxury — the food, the service, the views. Everything was perfect. I'm already planning my next trip with them!",
    photos: [
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=300&h=200&fit=crop",
    ],
    helpful: 33,
    verified: true,
    response:
      "Thank you, Aisha! We're so glad we could help make your dream a reality. We can't wait to plan your next adventure!",
    categories: { service: 5, value: 5, experience: 5, guide: 5 },
  },
  {
    id: 8,
    author: "Robert Williams",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
    location: "Berlin, Germany",
    trip: "Luxury Hurghada All-Inclusive",
    tripImage:
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop",
    rating: 5,
    date: "2025-12-20",
    title: "The Perfect Family Vacation",
    content:
      "We brought our three kids and everyone had the time of their lives. The resort had activities for all ages, and the kids club was fantastic. The dolphin watching trip was a highlight for the whole family. The all-inclusive package meant we didn't have to worry about anything. VANIR GROUP thought of everything — even arranging a birthday cake for our daughter!",
    photos: [],
    helpful: 26,
    verified: true,
    categories: { service: 5, value: 5, experience: 5, guide: 4 },
  },
];

const tripOptions = [
  "All Trips",
  "Pyramids & Nile Cruise Adventure",
  "Sharm El Sheikh Beach Escape",
  "Mount Sinai & Desert Trek",
  "Alexandria & Mediterranean Coast",
  "Luxury Hurghada All-Inclusive",
  "Siwa Oasis Desert Retreat",
];

/* ─── Star Rating Component ─── */
function StarRating({
  rating,
  size = 16,
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || rating)
                ? "fill-[var(--theme-primary)] text-[var(--theme-primary)]"
                : "fill-transparent text-[var(--theme-primary)]/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Rating Bar ─── */
function RatingBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60 text-sm font-[var(--font-body)] w-16">
        {label}
      </span>
      <div className="flex-1 h-2 bg-[var(--theme-primary)]/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] rounded-full"
        />
      </div>
      <span className="text-white/40 text-xs font-[var(--font-body)] w-8 text-right">
        {count}
      </span>
    </div>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [showPhotos, setShowPhotos] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const isLong = review.content.length > 250;
  const displayContent =
    isLong && !expanded ? review.content.slice(0, 250) + "..." : review.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[var(--theme-surface)] border border-white/8 rounded-xl overflow-hidden hover:border-[var(--theme-primary)]/30 transition-all duration-500"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={review.avatar}
                alt={review.author}
                className="w-12 h-12 rounded-full object-cover border-2 border-[var(--theme-primary)]/30"
              />
              {review.verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--theme-primary)] rounded-full flex items-center justify-center">
                  <Check size={10} className="text-[var(--theme-surface)]" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-[var(--font-body)] font-semibold text-sm">
                  {review.author}
                </h4>
                {review.verified && (
                  <span className="text-[8px] uppercase tracking-wider bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] px-2 py-0.5 rounded-full font-[var(--font-body)] font-semibold">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs font-[var(--font-body)] flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {review.location}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <StarRating rating={review.rating} size={14} />
            <p className="text-white/30 text-[10px] font-[var(--font-body)] mt-1">
              {new Date(review.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Trip badge */}
        <div className="flex items-center gap-3 mt-4 p-3 bg-[var(--theme-primary)]/5 rounded-lg border border-white/5">
          <OptimizedImage
            src={review.tripImage}
            alt={review.trip}
            className="w-10 h-10 rounded object-cover"
            containerClassName="w-10 h-10 rounded"
          />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--theme-primary)]/60 font-[var(--font-body)]">
              Trip Reviewed
            </p>
            <p className="text-white text-xs font-[var(--font-body)] font-medium">
              {review.trip}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <h3 className="text-white font-[var(--font-display)] text-lg mb-3">
          <Quote
            size={14}
            className="inline text-[var(--theme-primary)] mr-1 -mt-1"
          />
          {review.title}
        </h3>
        <p className="text-white/60 text-sm font-[var(--font-body)] leading-relaxed">
          {displayContent}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] font-semibold mt-2 hover:text-white transition-colors"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}

        {/* Category ratings */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {Object.entries(review.categories).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-[var(--theme-surface)] rounded px-3 py-1.5"
            >
              <span className="text-white/40 text-[10px] uppercase tracking-wider font-[var(--font-body)] capitalize">
                {key}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={8}
                    className={
                      s <= val
                        ? "fill-[var(--theme-primary)] text-[var(--theme-primary)]"
                        : "text-[var(--theme-primary)]/20"
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Photos */}
        {review.photos.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowPhotos(!showPhotos)}
              className="flex items-center gap-2 text-[var(--theme-primary)] text-xs font-[var(--font-body)] font-semibold mb-2"
            >
              <Camera size={12} />
              {review.photos.length} Photo{review.photos.length > 1 ? "s" : ""}
              <ChevronDown
                size={12}
                className={`transition-transform ${showPhotos ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {showPhotos && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-2 overflow-hidden"
                >
                  {review.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Review photo ${i + 1}`}
                      onClick={() => setSelectedPhoto(photo)}
                      className="w-20 h-20 rounded-lg object-cover cursor-pointer border border-white/10 hover:border-[var(--theme-primary)] transition-colors"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* VANIR GROUP Response */}
      {review.response && (
        <div className="mx-6 mb-4 p-4 bg-[var(--theme-primary)]/5 border-l-2 border-[var(--theme-primary)] rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award size={12} className="text-[var(--theme-primary)]" />
            <span className="text-[var(--theme-primary)] text-[10px] uppercase tracking-wider font-[var(--font-body)] font-bold">
              VANIR GROUP Response
            </span>
          </div>
          <p className="text-white/50 text-xs font-[var(--font-body)] leading-relaxed italic">
            {review.response}
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (!liked) {
                setHelpfulCount((c) => c + 1);
                setLiked(true);
                toast.success("Thanks for your feedback!");
              }
            }}
            className={`flex items-center gap-1.5 text-xs font-[var(--font-body)] transition-colors ${
              liked
                ? "text-[var(--theme-primary)]"
                : "text-white/40 hover:text-[var(--theme-primary)]"
            }`}
          >
            <ThumbsUp size={12} /> Helpful ({helpfulCount})
          </button>
          <button
            onClick={() => toast("Feature coming soon")}
            className="flex items-center gap-1.5 text-xs font-[var(--font-body)] text-white/40 hover:text-[var(--theme-primary)] transition-colors"
          >
            <Share2 size={12} /> Share
          </button>
        </div>
        <button
          onClick={() => toast("Feature coming soon")}
          className="text-white/20 hover:text-white/40 transition-colors"
        >
          <Flag size={12} />
        </button>
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={28} />
            </button>
            <OptimizedImage
              src={selectedPhoto}
              alt="Review photo"
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
              containerClassName="max-w-full max-h-[80vh]"
              lazy={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Write Review Modal ─── */
function WriteReviewModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [trip, setTrip] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [categoryRatings, setCategoryRatings] = useState({
    service: 0,
    value: 0,
    experience: 0,
    guide: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      setSubmitting(false);
      setSubmitted(true);
    },
    onError: (error) => {
      setSubmitting(false);
      toast.error(
        error.message || "Failed to submit review. Please try again.",
      );
    },
  });

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select an overall rating");
      return;
    }
    if (!trip) {
      toast.error("Please select the trip you're reviewing");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a review title");
      return;
    }
    if (!content.trim() || content.length < 20) {
      toast.error("Please write at least 20 characters");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setSubmitting(true);
    createReviewMutation.mutate({
      tripName: trip,
      rating,
      title: title.trim(),
      content: content.trim(),
      guestName: name.trim(),
    });
  };

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setContent("");
    setTrip("");
    setName("");
    setEmail("");
    setCategoryRatings({ service: 0, value: 0, experience: 0, guide: 0 });
    setSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-2xl my-8 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-white font-[var(--font-display)] text-xl">
              Write a Review
            </h3>
            <p className="text-white/40 text-xs font-[var(--font-body)] mt-1">
              Share your travel experience with others
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-[var(--theme-primary)]/10 border-2 border-[var(--theme-primary)] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check size={36} className="text-[var(--theme-primary)]" />
            </motion.div>
            <h4 className="text-white font-[var(--font-display)] text-2xl mb-3">
              Thank You!
            </h4>
            <p className="text-white/50 font-[var(--font-body)] text-sm max-w-md mx-auto mb-8">
              Your review has been submitted successfully and will be published
              after verification. We appreciate your feedback!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="px-6 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-semibold text-sm rounded hover:bg-[var(--theme-primary-light)] transition-colors"
              >
                Done
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] text-sm rounded hover:bg-[var(--theme-primary)]/10 transition-colors"
              >
                Write Another
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Overall Rating */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-3 block">
                Overall Rating *
              </label>
              <div className="flex items-center gap-4">
                <StarRating
                  rating={rating}
                  size={28}
                  interactive
                  onChange={setRating}
                />
                {rating > 0 && (
                  <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-lg">
                    {rating === 5
                      ? "Excellent!"
                      : rating === 4
                        ? "Great!"
                        : rating === 3
                          ? "Good"
                          : rating === 2
                            ? "Fair"
                            : "Poor"}
                  </span>
                )}
              </div>
            </div>

            {/* Trip Selection */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-2 block">
                Trip Reviewed *
              </label>
              <select
                value={trip}
                onChange={(e) => setTrip(e.target.value)}
                className="w-full bg-[var(--theme-surface)] border border-white/10 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
              >
                <option value="">Select the trip you completed</option>
                {tripOptions.slice(1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Ratings */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-3 block">
                Rate by Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["service", "value", "experience", "guide"] as const).map(
                  (cat) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between bg-[var(--theme-surface)] rounded-lg px-4 py-3 border border-white/5"
                    >
                      <span className="text-white/50 text-xs font-[var(--font-body)] capitalize">
                        {cat}
                      </span>
                      <StarRating
                        rating={categoryRatings[cat]}
                        size={12}
                        interactive
                        onChange={(r) =>
                          setCategoryRatings((prev) => ({ ...prev, [cat]: r }))
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-2 block">
                Review Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience in a few words"
                className="w-full bg-[var(--theme-surface)] border border-white/10 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] placeholder:text-white/20 focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-2 block">
                Your Review *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us about your experience — what did you love? What made it special?"
                rows={5}
                className="w-full bg-[var(--theme-surface)] border border-white/10 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] placeholder:text-white/20 focus:border-[var(--theme-primary)] focus:outline-none transition-colors resize-none"
              />
              <p className="text-white/30 text-[10px] font-[var(--font-body)] mt-1 text-right">
                {content.length} characters (minimum 20)
              </p>
            </div>

            {/* Photo Upload Placeholder */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-2 block">
                Add Photos (Optional)
              </label>
              <button
                onClick={() => toast("Photo upload feature coming soon")}
                className="w-full border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-[var(--theme-primary)]/40 transition-colors"
              >
                <ImageIcon
                  size={24}
                  className="text-[var(--theme-primary)]/40"
                />
                <span className="text-white/30 text-xs font-[var(--font-body)]">
                  Click to upload photos from your trip
                </span>
              </button>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-2 block">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-[var(--theme-surface)] border border-white/10 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] placeholder:text-white/20 focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-2 block">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[var(--theme-surface)] border border-white/10 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] placeholder:text-white/20 focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!submitted && (
          <div className="p-6 border-t border-white/5 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-bold text-sm uppercase tracking-wider rounded hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--theme-surface)]/30 border-t-[var(--theme-surface)] rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={14} /> Submit Review
                </>
              )}
            </button>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-6 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] text-sm rounded hover:bg-[var(--theme-primary)]/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Reviews Page ─── */
export default function Reviews() {
  const [filterTrip, setFilterTrip] = useState("All Trips");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState<
    "recent" | "helpful" | "highest" | "lowest"
  >("recent");
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const LOGO_URL =
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png";

  /* Stats */
  const avgRating = useMemo(() => {
    const sum = reviewsData.reduce((a, r) => a + r.rating, 0);
    return (sum / reviewsData.length).toFixed(1);
  }, []);

  const ratingCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviewsData.forEach((r) => counts[r.rating - 1]++);
    return counts;
  }, []);

  /* Filtered & sorted */
  const filteredReviews = useMemo(() => {
    let result = [...reviewsData];
    if (filterTrip !== "All Trips")
      result = result.filter((r) => r.trip === filterTrip);
    if (filterRating > 0)
      result = result.filter((r) => r.rating === filterRating);
    switch (sortBy) {
      case "recent":
        result.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        break;
      case "helpful":
        result.sort((a, b) => b.helpful - a.helpful);
        break;
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
    }
    return result;
  }, [filterTrip, filterRating, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="Client Reviews & Testimonials"
        description="Read authentic reviews from VANIR GROUP travelers. See what our clients say about their luxury Egypt experiences, from pyramids tours to Nile cruises."
        keywords="VANIR GROUP reviews, Egypt travel reviews, luxury tour testimonials, Nile cruise reviews, pyramids tour feedback"
        canonicalPath="/reviews"
      />
      <SEO
        title="Client Reviews & Testimonials"
        description="Read reviews from VANIR GROUP clients. Discover why travelers choose us for luxury Egypt tours, Nile cruises, and cultural experiences."
        keywords="VANIR GROUP reviews, Egypt tour testimonials, luxury travel reviews"
      />
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[35vh] sm:h-[40vh] min-h-[250px] sm:min-h-[300px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/about-hero-vWWmVCPLvVuLQJvKAkBfYi.webp)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-surface)]/70 via-[var(--theme-surface)]/50 to-[var(--theme-surface)]" />
        <div className="relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--theme-primary)] font-[var(--font-display)] italic tracking-[0.3em] uppercase text-sm mb-4"
          >
            Traveler Stories
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-3xl sm:text-2xl sm:text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:text-6xl font-[var(--font-display)] text-white"
          >
            Reviews & Ratings
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-6 text-white/50 text-sm font-[var(--font-body)]"
          >
            <a
              href="/"
              className="hover:text-[var(--theme-primary)] transition-colors"
            >
              Home
            </a>
            <span>&gt;</span>
            <span className="text-[var(--theme-primary)]">Reviews</span>
          </motion.div>
        </div>
        <OptimizedImage
          src={LOGO_URL}
          alt="VANIR GROUP Logo"
          className="h-16 opacity-15"
          containerClassName="absolute bottom-6 right-6 h-16 pointer-events-none"
          lazy={true}
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Overall Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[var(--theme-surface)] border border-white/8 rounded-xl p-8 text-center"
            >
              <p className="text-6xl font-[var(--font-display)] text-[var(--theme-primary)] font-bold">
                {avgRating}
              </p>
              <StarRating rating={Math.round(Number(avgRating))} size={20} />
              <p className="text-white/40 text-sm font-[var(--font-body)] mt-2">
                Based on {reviewsData.length} verified reviews
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Award size={16} className="text-[var(--theme-primary)]" />
                <span className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] font-semibold uppercase tracking-wider">
                  Excellent
                </span>
              </div>
            </motion.div>

            {/* Rating Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--theme-surface)] border border-white/8 rounded-xl p-8"
            >
              <h3 className="text-white font-[var(--font-body)] font-semibold text-sm uppercase tracking-wider mb-6">
                Rating Breakdown
              </h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingBar
                    key={star}
                    label={`${star} Star${star > 1 ? "s" : ""}`}
                    count={ratingCounts[star - 1]}
                    total={reviewsData.length}
                  />
                ))}
              </div>
            </motion.div>

            {/* Write Review CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-surface)] border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare
                  size={28}
                  className="text-[var(--theme-primary)]"
                />
              </div>
              <h3 className="text-white font-[var(--font-display)] text-xl mb-2">
                Share Your Story
              </h3>
              <p className="text-white/40 text-sm font-[var(--font-body)] mb-6">
                Completed a trip with us? We'd love to hear about your
                experience!
              </p>
              <button
                onClick={() => setShowWriteReview(true)}
                className="flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-bold text-sm uppercase tracking-wider rounded hover:bg-[var(--theme-primary-light)] transition-colors"
              >
                <Send size={14} /> Write a Review
              </button>
            </motion.div>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/60 text-xs font-[var(--font-body)] uppercase tracking-wider rounded hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-colors"
              >
                <Filter size={12} /> Filters
                <ChevronDown
                  size={12}
                  className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
              <p className="text-white/30 text-sm font-[var(--font-body)]">
                Showing{" "}
                <span className="text-[var(--theme-primary)]">
                  {filteredReviews.length}
                </span>{" "}
                review{filteredReviews.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SortAsc size={12} className="text-white/40" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-[var(--theme-surface)] border border-white/10 text-white px-3 py-2 rounded text-xs font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-[var(--theme-surface)] border border-white/8 rounded-xl p-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-2 block">
                      Filter by Trip
                    </label>
                    <select
                      value={filterTrip}
                      onChange={(e) => setFilterTrip(e.target.value)}
                      className="w-full bg-[var(--theme-surface)] border border-white/10 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none"
                    >
                      {tripOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] font-semibold mb-2 block">
                      Filter by Rating
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilterRating(0)}
                        className={`px-4 py-2 rounded text-xs font-[var(--font-body)] border transition-colors ${
                          filterRating === 0
                            ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] border-[var(--theme-primary)]"
                            : "border-white/10 text-white/50 hover:border-[var(--theme-primary)]"
                        }`}
                      >
                        All
                      </button>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <button
                          key={r}
                          onClick={() => setFilterRating(r)}
                          className={`flex items-center gap-1 px-3 py-2 rounded text-xs font-[var(--font-body)] border transition-colors ${
                            filterRating === r
                              ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] border-[var(--theme-primary)]"
                              : "border-white/10 text-white/50 hover:border-[var(--theme-primary)]"
                          }`}
                        >
                          {r}{" "}
                          <Star
                            size={10}
                            className={
                              filterRating === r
                                ? "fill-[var(--theme-surface)]"
                                : "fill-[var(--theme-primary)]"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-20">
              <MessageSquare
                size={48}
                className="text-[var(--theme-primary)]/20 mx-auto mb-4"
              />
              <h3 className="text-white font-[var(--font-display)] text-xl mb-2">
                No Reviews Found
              </h3>
              <p className="text-white/40 text-sm font-[var(--font-body)]">
                Try adjusting your filters to see more reviews.
              </p>
            </div>
          )}

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-[var(--theme-primary)]/10 via-[var(--theme-surface)] to-[var(--theme-primary)]/10 border border-white/10 rounded-xl p-8 md:p-12 text-center"
          >
            <h3 className="text-white font-[var(--font-display)] text-2xl md:text-3xl mb-3">
              Ready to Create Your Own Story?
            </h3>
            <p className="text-white/50 font-[var(--font-body)] text-sm max-w-xl mx-auto mb-8">
              Join thousands of satisfied travelers who have experienced the
              VANIR GROUP difference. Book your dream trip today!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/booking"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-bold text-sm uppercase tracking-wider rounded hover:bg-[var(--theme-primary-light)] transition-colors"
              >
                Book a Trip <ArrowRight size={14} />
              </a>
              <button
                onClick={() => setShowWriteReview(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] font-semibold text-sm uppercase tracking-wider rounded hover:bg-[var(--theme-primary)]/10 transition-colors"
              >
                <Send size={14} /> Write a Review
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Write Review Modal */}
      <AnimatePresence>
        {showWriteReview && (
          <WriteReviewModal
            isOpen={showWriteReview}
            onClose={() => setShowWriteReview(false)}
          />
        )}
      </AnimatePresence>

      <Footer />
      <BackToTop />
    </div>
  );
}
