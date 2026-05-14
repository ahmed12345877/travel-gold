/**
 * Design: Misty Dark Theme
 * Promo Notifications System:
 * 1. Welcome popup modal on first visit with featured offer
 * 2. Slide-in toast notifications for deals (bottom-right corner)
 * 3. Top announcement bar with scrolling offers
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Flame,
  Tag,
  Clock,
  ArrowRight,
  Zap,
  Sparkles,
  Crown,
  ChevronRight,
} from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";

/* ─── Promo Data ─── */
interface PromoItem {
  id: number;
  title: string;
  description: string;
  discount: string;
  code?: string;
  image: string;
  link: string;
  badge: string;
  badgeIcon: typeof Flame;
  urgency?: string;
  expiresLabel: string;
}

const promos: PromoItem[] = [
  {
    id: 1,
    title: "Summer Flash Sale!",
    description:
      "Save up to 60% on Egypt's most popular destinations. Limited spots available.",
    discount: "60% OFF",
    code: "PYRAMID40",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-egypt-YcosuhKLMYbaJ475QVrVxy.webp",
    link: "/offers",
    badge: "Flash Sale",
    badgeIcon: Zap,
    urgency: "Only 4 spots left!",
    expiresLabel: "Ends in 3 days",
  },
  {
    id: 2,
    title: "VIP Luxury Escape",
    description:
      "Exclusive private villa experience in Hurghada with personal butler service.",
    discount: "40% OFF",
    code: undefined,
    image:
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop",
    link: "/offers",
    badge: "VIP Exclusive",
    badgeIcon: Crown,
    urgency: "Only 2 spots left!",
    expiresLabel: "Ends in 21 days",
  },
  {
    id: 3,
    title: "Early Bird Special",
    description:
      "Book your Sinai adventure early and save 50% on the full package.",
    discount: "50% OFF",
    code: "EARLY50",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    link: "/offers",
    badge: "Early Bird",
    badgeIcon: Sparkles,
    expiresLabel: "Ends in 16 days",
  },
];

const toastNotifications = [
  {
    id: 1,
    name: "Ahmed M.",
    action: "just booked",
    trip: "Pyramids & Nile Cruise",
    time: "2 minutes ago",
    icon: "🇪🇬",
  },
  {
    id: 2,
    name: "Sarah L.",
    action: "just booked",
    trip: "Sharm El Sheikh Beach",
    time: "5 minutes ago",
    icon: "🏖️",
  },
  {
    id: 3,
    name: "James K.",
    action: "just saved $700 on",
    trip: "Full Egypt Explorer",
    time: "8 minutes ago",
    icon: "✈️",
  },
  {
    id: 4,
    name: "Maria G.",
    action: "just booked",
    trip: "Luxury Hurghada",
    time: "12 minutes ago",
    icon: "🌴",
  },
  {
    id: 5,
    name: "Omar H.",
    action: "just used code MEGA50 for",
    trip: "Egypt Explorer",
    time: "15 minutes ago",
    icon: "🎫",
  },
];

const announcementMessages = [
  "Flash Sale: Up to 60% OFF on Summer Trips — Limited Time!",
  "New: VIP Luxury Escape in Hurghada — Only 2 Spots Left!",
  "Use Code PYRAMID40 for 40% OFF Pyramids & Nile Cruise",
  "Early Bird: Book Sinai Trek Now & Save 50%",
  "Free Cancellation on All Bookings — Book with Confidence",
];

/* ─── 1. Welcome Popup Modal ─── */
function WelcomePopup({ onClose }: { onClose: () => void }) {
  const promo = promos[0];
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (promo.code) {
      navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [promo.code]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg glass-card rounded-xl overflow-hidden shadow-2xl shadow-black/40"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm border border-white/10 rounded-full text-white/60 hover:text-white hover:border-white/30 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image header */}
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={promo.image}
            alt={promo.title}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)] via-[var(--theme-surface)]/40 to-transparent" />

          {/* Discount badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Flame className="w-5 h-5 animate-pulse" />
              <span className="font-[var(--font-body)] font-bold text-lg">
                {promo.discount}
              </span>
            </div>
          </div>

          {/* Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="bg-[var(--theme-primary)] text-[var(--theme-surface)] text-xs px-3 py-1 rounded-md font-[var(--font-body)] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <promo.badgeIcon className="w-3.5 h-3.5" />
              {promo.badge}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-[var(--font-display)] text-white font-bold mb-2">
            {promo.title}
          </h3>
          <p className="text-white/50 font-[var(--font-body)] text-sm leading-relaxed mb-4">
            {promo.description}
          </p>

          {/* Urgency */}
          {promo.urgency && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-[var(--font-body)] font-semibold">
                {promo.urgency}
              </span>
              <span className="text-white/15 mx-1">|</span>
              <Clock className="w-3 h-3 text-white/40" />
              <span className="text-white/40 text-xs font-[var(--font-body)]">
                {promo.expiresLabel}
              </span>
            </div>
          )}

          {/* Promo code */}
          {promo.code && (
            <div className="mb-5">
              <p className="text-white/25 text-[10px] font-[var(--font-body)] uppercase tracking-wider mb-2">
                Your Exclusive Code
              </p>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-between bg-white/5 border border-dashed border-white/20 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="font-mono text-[var(--theme-primary)] font-bold tracking-widest text-lg">
                    {promo.code}
                  </span>
                </div>
                <span className="text-white/40 text-xs font-[var(--font-body)] group-hover:text-white/70 transition-colors">
                  {copied ? "Copied!" : "Click to copy"}
                </span>
              </button>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3">
            <a
              href={promo.link}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[var(--theme-surface)] py-3.5 rounded-lg font-[var(--font-body)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--theme-primary)] transition-all group"
            >
              View All Offers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <button
              onClick={onClose}
              className="px-5 py-3.5 border border-white/15 rounded-lg text-white/60 font-[var(--font-body)] text-sm hover:border-white/30 hover:text-white transition-all"
            >
              Later
            </button>
          </div>

          <p className="text-white/10 text-[10px] font-[var(--font-body)] text-center mt-4">
            Limited time offer. Terms & conditions apply.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── 2. Social Proof Toast ─── */
function SocialProofToast({
  notification,
  onClose,
}: {
  notification: (typeof toastNotifications)[0];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-6 right-6 z-[90] w-80 glass-card rounded-xl shadow-xl shadow-black/40 overflow-hidden"
    >
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent" />

      <div className="p-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/20 hover:text-white/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-lg shrink-0">
            {notification.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-[var(--font-body)] leading-snug">
              <span className="font-semibold">{notification.name}</span>{" "}
              <span className="text-white/50">{notification.action}</span>{" "}
              <span className="text-[var(--theme-primary)] font-semibold">
                {notification.trip}
              </span>
            </p>
            <p className="text-white/20 text-xs font-[var(--font-body)] mt-1">
              {notification.time}
            </p>
          </div>
        </div>

        <a
          href="/offers"
          className="mt-3 flex items-center gap-1.5 text-[var(--theme-primary)] text-xs font-[var(--font-body)] font-semibold hover:text-white transition-colors"
        >
          View Similar Deals
          <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}

/* ─── 3. Announcement Bar ─── */
export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed");
    if (dismissed) setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcementMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("announcement-dismissed", "true");
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-[var(--theme-surface)]/90 backdrop-blur-sm border-b border-white/5 text-white relative z-[60] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.a
              key={currentIndex}
              href="/offers"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="block text-center text-sm font-[var(--font-body)] font-medium text-white/70 hover:text-white transition-colors"
            >
              <span className="text-[var(--theme-primary)] mr-2">&#9733;</span>
              {announcementMessages[currentIndex]}
            </motion.a>
          </AnimatePresence>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 w-5 h-5 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm text-white/30 hover:text-white/60"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Notification System ─── */
export default function PromoNotifications() {
  const [showPopup, setShowPopup] = useState(false);
  const [currentToast, setCurrentToast] = useState<
    (typeof toastNotifications)[0] | null
  >(null);
  const [toastIndex, setToastIndex] = useState(0);

  // Show welcome popup after 2.5 seconds on first visit
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("promo-popup-seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    sessionStorage.setItem("promo-popup-seen", "true");
  }, []);

  // Show social proof toasts periodically
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("promo-popup-seen");
    const startDelay = hasSeenPopup ? 8000 : 12000;

    const startTimer = setTimeout(() => {
      setCurrentToast(toastNotifications[0]);
      setToastIndex(1);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, []);

  // Cycle through toasts
  useEffect(() => {
    if (toastIndex === 0) return;

    const dismissTimer = setTimeout(() => {
      setCurrentToast(null);

      if (toastIndex < toastNotifications.length) {
        const nextTimer = setTimeout(() => {
          setCurrentToast(toastNotifications[toastIndex]);
          setToastIndex((prev) => prev + 1);
        }, 20000);
        return () => clearTimeout(nextTimer);
      }
    }, 5000);

    return () => clearTimeout(dismissTimer);
  }, [toastIndex]);

  return (
    <>
      {/* Welcome Popup */}
      <AnimatePresence>
        {showPopup && <WelcomePopup onClose={handleClosePopup} />}
      </AnimatePresence>

      {/* Social Proof Toasts */}
      <AnimatePresence>
        {currentToast && (
          <SocialProofToast
            notification={currentToast}
            onClose={() => setCurrentToast(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
