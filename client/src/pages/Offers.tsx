/*
 * Design: Art Deco Luxe – Black & Gold
 * Offers & Deals: Special promotions with countdown timers,
 * flash sales, seasonal offers, and exclusive packages
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import OptimizedImage from "@/components/OptimizedImage";
import { toast } from "sonner";
import PageMeta from "@/components/PageMeta";
import {
  Clock,
  MapPin,
  Star,
  Users,
  ArrowRight,
  Tag,
  Percent,
  Flame,
  Zap,
  Gift,
  Calendar,
  Shield,
  Award,
  ChevronDown,
  ChevronUp,
  Timer,
  Sparkles,
  TrendingDown,
  BadgePercent,
  Crown,
  Heart,
  Share2,
  Bell,
  Check,
  X,
  Copy,
  Ticket,
} from "lucide-react";

/* ─── Countdown Hook ─── */
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

/* ─── Offer Data ─── */
interface Offer {
  id: number;
  image: string;
  title: string;
  destination: string;
  description: string;
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  reviews: number;
  includes: string[];
  category:
    | "flash"
    | "seasonal"
    | "exclusive"
    | "earlybird"
    | "lastminute"
    | "group";
  badge: string;
  badgeColor: string;
  expiresAt: string;
  spotsLeft: number;
  totalSpots: number;
  promoCode?: string;
  featured?: boolean;
}

const offers: Offer[] = [
  {
    id: 1,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-egypt-YcosuhKLMYbaJ475QVrVxy.webp",
    title: "Pyramids & Nile Cruise — Summer Special",
    destination: "Cairo & Luxor, Egypt",
    description:
      "Experience the magic of ancient Egypt at an unbeatable price. Private guided tours, luxury Nile cruise, and 5-star accommodation included.",
    price: 899,
    originalPrice: 1599,
    duration: "8 Days / 7 Nights",
    rating: 4.9,
    reviews: 234,
    includes: [
      "5-Star Hotels",
      "Private Guide",
      "Nile Cruise",
      "All Meals",
      "Airport Transfer",
      "Entry Tickets",
    ],
    category: "flash",
    badge: "Flash Sale",
    badgeColor: "bg-red-600",
    expiresAt: "2026-04-07T23:59:59",
    spotsLeft: 4,
    totalSpots: 20,
    promoCode: "PYRAMID40",
    featured: true,
  },
  {
    id: 2,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-sharm-Fh2PhqqrRQGfdg6EtwXedu.webp",
    title: "Sharm El Sheikh — Beach Paradise Deal",
    destination: "Sharm El Sheikh, Egypt",
    description:
      "Dive into crystal-clear waters and relax on pristine beaches. All-inclusive beachfront resort with world-class diving included.",
    price: 599,
    originalPrice: 1199,
    duration: "6 Days / 5 Nights",
    rating: 4.8,
    reviews: 189,
    includes: [
      "Beachfront Resort",
      "Snorkeling Gear",
      "2 Dive Sessions",
      "All Meals",
      "Airport Transfer",
      "Spa Access",
    ],
    category: "seasonal",
    badge: "Summer Sale",
    badgeColor: "bg-amber-600",
    expiresAt: "2026-04-15T23:59:59",
    spotsLeft: 12,
    totalSpots: 30,
    promoCode: "BEACH50",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    title: "Mount Sinai Sunrise Trek — Early Bird",
    destination: "Sinai Peninsula, Egypt",
    description:
      "Book early and save big on this unforgettable desert adventure. Trek Mount Sinai, camp under the stars, and explore ancient monasteries.",
    price: 449,
    originalPrice: 899,
    duration: "5 Days / 4 Nights",
    rating: 4.7,
    reviews: 156,
    includes: [
      "Desert Camp",
      "Bedouin Guide",
      "Camel Ride",
      "All Meals",
      "Camping Equipment",
      "Transport",
    ],
    category: "earlybird",
    badge: "Early Bird",
    badgeColor: "bg-emerald-600",
    expiresAt: "2026-04-20T23:59:59",
    spotsLeft: 8,
    totalSpots: 15,
    promoCode: "EARLY50",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop",
    title: "Luxury Hurghada — VIP Experience",
    destination: "Hurghada, Egypt",
    description:
      "The ultimate luxury escape with private villa, personal butler, exclusive excursions, and premium all-inclusive dining.",
    price: 1499,
    originalPrice: 2499,
    duration: "7 Days / 6 Nights",
    rating: 4.9,
    reviews: 312,
    includes: [
      "Private Villa",
      "Personal Butler",
      "Premium All-Inclusive",
      "Private Beach",
      "Yacht Tour",
      "Spa Package",
    ],
    category: "exclusive",
    badge: "VIP Exclusive",
    badgeColor: "bg-purple-600",
    expiresAt: "2026-04-25T23:59:59",
    spotsLeft: 2,
    totalSpots: 8,
    featured: true,
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    title: "Alexandria Weekend Getaway — Last Minute",
    destination: "Alexandria, Egypt",
    description:
      "Grab this last-minute deal for a quick Mediterranean escape. Explore ancient history and enjoy fresh seafood by the sea.",
    price: 299,
    originalPrice: 749,
    duration: "3 Days / 2 Nights",
    rating: 4.6,
    reviews: 128,
    includes: [
      "Sea View Hotel",
      "City Guide",
      "Museum Tickets",
      "Breakfast",
      "Airport Transfer",
      "Boat Tour",
    ],
    category: "lastminute",
    badge: "Last Minute",
    badgeColor: "bg-orange-600",
    expiresAt: "2026-04-06T23:59:59",
    spotsLeft: 3,
    totalSpots: 10,
    promoCode: "LAST60",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&h=400&fit=crop",
    title: "Siwa Oasis — Group Adventure Deal",
    destination: "Siwa Oasis, Egypt",
    description:
      "Bring your friends and save! Group discount on our most unique desert retreat. Hot springs, sandboarding, and stargazing included.",
    price: 549,
    originalPrice: 999,
    duration: "5 Days / 4 Nights",
    rating: 4.8,
    reviews: 97,
    includes: [
      "Eco Lodge",
      "Desert Guide",
      "4x4 Safari",
      "All Meals",
      "Hot Springs Access",
      "Sandboarding",
    ],
    category: "group",
    badge: "Group Deal",
    badgeColor: "bg-blue-600",
    expiresAt: "2026-04-18T23:59:59",
    spotsLeft: 16,
    totalSpots: 24,
    promoCode: "GROUP45",
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop",
    title: "Full Egypt Explorer — Mega Flash Sale",
    destination: "Cairo, Luxor, Aswan & Hurghada",
    description:
      "The ultimate Egypt experience covering all major destinations. From pyramids to beaches, experience everything Egypt has to offer at 50% off.",
    price: 1999,
    originalPrice: 3999,
    duration: "14 Days / 13 Nights",
    rating: 5.0,
    reviews: 89,
    includes: [
      "5-Star Hotels",
      "Domestic Flights",
      "Private Guide",
      "Nile Cruise",
      "All Meals",
      "Desert Safari",
    ],
    category: "flash",
    badge: "Mega Deal",
    badgeColor: "bg-red-600",
    expiresAt: "2026-04-08T23:59:59",
    spotsLeft: 5,
    totalSpots: 15,
    promoCode: "MEGA50",
    featured: true,
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
    title: "Honeymoon in Hurghada — Couples Special",
    destination: "Hurghada, Egypt",
    description:
      "Celebrate your love with a romantic all-inclusive honeymoon package. Private sunset dinner, couples spa, and exclusive beach cabana.",
    price: 1299,
    originalPrice: 1999,
    duration: "7 Days / 6 Nights",
    rating: 4.9,
    reviews: 145,
    includes: [
      "Honeymoon Suite",
      "Couples Spa",
      "Sunset Dinner",
      "Private Cabana",
      "Champagne Welcome",
      "Photo Session",
    ],
    category: "exclusive",
    badge: "Couples Special",
    badgeColor: "bg-pink-600",
    expiresAt: "2026-04-30T23:59:59",
    spotsLeft: 6,
    totalSpots: 12,
    promoCode: "LOVE35",
  },
];

const categoryFilters = [
  { key: "all", label: "All Offers", icon: Tag },
  { key: "flash", label: "Flash Sales", icon: Zap },
  { key: "seasonal", label: "Seasonal", icon: Calendar },
  { key: "exclusive", label: "VIP Exclusive", icon: Crown },
  { key: "earlybird", label: "Early Bird", icon: Sparkles },
  { key: "lastminute", label: "Last Minute", icon: Timer },
  { key: "group", label: "Group Deals", icon: Users },
];

/* ─── Section Title ─── */
function SectionTitle({
  sub,
  title,
  desc,
}: {
  sub: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="text-center mb-16">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[var(--theme-primary)] font-[var(--font-display)] italic tracking-[0.3em] uppercase text-sm mb-4"
      >
        {sub}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl font-[var(--font-display)] text-white font-bold mb-4"
      >
        {title}
      </motion.h2>
      {desc && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/50 max-w-2xl mx-auto font-[var(--font-body)]"
        >
          {desc}
        </motion.p>
      )}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--theme-primary)]" />
        <div className="w-2 h-2 rotate-45 border border-[var(--theme-primary)]" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--theme-primary)]" />
      </div>
    </div>
  );
}

/* ─── Countdown Timer Display ─── */
function CountdownTimer({
  targetDate,
  size = "md",
}: {
  targetDate: string;
  size?: "sm" | "md" | "lg";
}) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);
  const isUrgent = days === 0 && hours < 12;

  const sizeClasses = {
    sm: { box: "w-12 h-12", num: "text-lg", label: "text-[8px]" },
    md: { box: "w-16 h-16", num: "text-2xl", label: "text-[9px]" },
    lg: {
      box: "w-20 h-20 md:w-24 md:h-24",
      num: "text-2xl sm:text-3xl md:text-4xl",
      label: "text-[10px] md:text-xs",
    },
  };

  const s = sizeClasses[size];

  const units = [
    { value: days, label: "DAYS" },
    { value: hours, label: "HOURS" },
    { value: minutes, label: "MINS" },
    { value: seconds, label: "SECS" },
  ];

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2 md:gap-3">
          <div
            className={`${s.box} flex flex-col items-center justify-center border ${isUrgent ? "border-red-500/50 bg-red-950/30" : "border-[var(--theme-primary)]/30 bg-[var(--theme-surface)]"} relative`}
          >
            <span
              className={`${s.num} font-[var(--font-display)] font-bold ${isUrgent ? "text-red-400" : "text-white"}`}
            >
              {String(unit.value).padStart(2, "0")}
            </span>
            <span
              className={`${s.label} ${isUrgent ? "text-red-400/60" : "text-[var(--theme-primary)]/60"} font-[var(--font-body)] tracking-wider`}
            >
              {unit.label}
            </span>
            {/* Corner accents */}
            <div
              className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${isUrgent ? "border-red-500" : "border-[var(--theme-primary)]"}`}
            />
            <div
              className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${isUrgent ? "border-red-500" : "border-[var(--theme-primary)]"}`}
            />
            <div
              className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${isUrgent ? "border-red-500" : "border-[var(--theme-primary)]"}`}
            />
            <div
              className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${isUrgent ? "border-red-500" : "border-[var(--theme-primary)]"}`}
            />
          </div>
          {i < units.length - 1 && (
            <span
              className={`${s.num} font-[var(--font-display)] ${isUrgent ? "text-red-400/40" : "text-[var(--theme-primary)]/40"}`}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Promo Code Box ─── */
function PromoCodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success("Promo code copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="flex items-center gap-2 bg-[var(--theme-primary)]/10 border border-dashed border-[var(--theme-primary)]/40 px-3 py-2">
      <Ticket className="w-4 h-4 text-[var(--theme-primary)]" />
      <span className="font-mono text-[var(--theme-primary)] font-bold text-sm tracking-wider">
        {code}
      </span>
      <button
        onClick={handleCopy}
        className="ml-auto p-1 hover:bg-[var(--theme-primary)]/20 transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-[var(--theme-primary)]/60" />
        )}
      </button>
    </div>
  );
}

/* ─── Spots Progress Bar ─── */
function SpotsBar({ left, total }: { left: number; total: number }) {
  const pct = ((total - left) / total) * 100;
  const isLow = left <= 5;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-[var(--font-body)]">
        <span className={`${isLow ? "text-red-400" : "text-white/60"}`}>
          {isLow ? `Only ${left} spots left!` : `${left} spots remaining`}
        </span>
        <span className="text-[var(--theme-primary)]/40">
          {Math.round(pct)}% booked
        </span>
      </div>
      <div className="h-1.5 bg-[#1A1A1A] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${isLow ? "bg-gradient-to-r from-red-600 to-red-400" : "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)]"}`}
        />
      </div>
    </div>
  );
}

/* ─── Featured Offer Card (Hero) ─── */
function FeaturedOffer({ offer }: { offer: Offer }) {
  const discount = Math.round(
    ((offer.originalPrice - offer.price) / offer.originalPrice) * 100,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden border border-white/10 bg-[var(--theme-surface)] mb-16"
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary)]/5 via-transparent to-[var(--theme-primary)]/5 animate-pulse pointer-events-none" />

      <div className="grid md:grid-cols-2 gap-0">
        {/* Image */}
        <div className="relative h-64 md:h-auto overflow-hidden">
          <OptimizedImage
            src={offer.image}
            alt={offer.title}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--theme-surface)]/80" />

          {/* Discount badge */}
          <div className="absolute top-6 left-6">
            <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-2">
              <Flame className="w-5 h-5" />
              <span className="font-[var(--font-body)] font-bold text-lg">
                SAVE {discount}%
              </span>
            </div>
          </div>

          {/* Featured ribbon */}
          <div className="absolute top-6 right-0 bg-[var(--theme-primary)] text-[var(--theme-surface)] px-6 py-1.5 font-[var(--font-body)] font-bold text-xs tracking-wider">
            FEATURED DEAL
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`${offer.badgeColor} text-white text-xs px-3 py-1 font-[var(--font-body)] font-semibold uppercase tracking-wider`}
            >
              {offer.badge}
            </span>
            <div className="flex items-center gap-1 text-[var(--theme-primary)]">
              <Star className="w-4 h-4 fill-[var(--theme-primary)]" />
              <span className="text-sm font-semibold">{offer.rating}</span>
              <span className="text-white/40 text-xs">({offer.reviews})</span>
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-white font-bold mb-2">
            {offer.title}
          </h3>

          <div className="flex items-center gap-2 text-[var(--theme-primary)]/60 text-sm mb-4">
            <MapPin className="w-4 h-4" />
            <span className="font-[var(--font-body)]">{offer.destination}</span>
            <span className="mx-2">·</span>
            <Clock className="w-4 h-4" />
            <span className="font-[var(--font-body)]">{offer.duration}</span>
          </div>

          <p className="text-white/50 font-[var(--font-body)] text-sm leading-relaxed mb-6">
            {offer.description}
          </p>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-[var(--font-display)] font-bold text-[var(--theme-primary)]">
              ${offer.price}
            </span>
            <span className="text-xl text-white/30 line-through font-[var(--font-body)] mb-1">
              ${offer.originalPrice}
            </span>
            <span className="text-sm text-white/40 font-[var(--font-body)] mb-1">
              per person
            </span>
          </div>

          {/* Countdown */}
          <div className="mb-6">
            <p className="text-white/40 text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
              Offer Ends In
            </p>
            <CountdownTimer targetDate={offer.expiresAt} size="md" />
          </div>

          {/* Spots */}
          <div className="mb-6">
            <SpotsBar left={offer.spotsLeft} total={offer.totalSpots} />
          </div>

          {/* Promo Code */}
          {offer.promoCode && (
            <div className="mb-6">
              <p className="text-white/40 text-xs font-[var(--font-body)] uppercase tracking-wider mb-2">
                Use Promo Code
              </p>
              <PromoCodeBox code={offer.promoCode} />
            </div>
          )}

          {/* CTA */}
          <a
            href={`/booking?package=${offer.id}`}
            className="inline-flex items-center justify-center gap-2 bg-[var(--theme-primary)] text-[var(--theme-surface)] px-8 py-4 font-[var(--font-body)] font-bold uppercase tracking-wider hover:bg-[var(--theme-primary-light)] transition-all duration-300 group"
          >
            Book Now — Save ${offer.originalPrice - offer.price}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Includes strip */}
      <div className="border-t border-white/5 bg-[var(--theme-surface)] px-8 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[var(--theme-primary)]/40 text-xs font-[var(--font-body)] uppercase tracking-wider">
            Includes:
          </span>
          {offer.includes.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 text-white/50 text-xs font-[var(--font-body)]"
            >
              <Check className="w-3 h-3 text-[var(--theme-primary)]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Offer Card ─── */
function OfferCard({ offer, index }: { offer: Offer; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const discount = Math.round(
    ((offer.originalPrice - offer.price) / offer.originalPrice) * 100,
  );
  const { days, hours } = useCountdown(offer.expiresAt);
  const isUrgent = days === 0 && hours < 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group bg-[var(--theme-surface)] border border-white/5 hover:border-[var(--theme-primary)]/30 transition-all duration-500 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={offer.image}
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)] via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span
            className={`${offer.badgeColor} text-white text-xs px-3 py-1 font-[var(--font-body)] font-bold uppercase tracking-wider flex items-center gap-1.5`}
          >
            {offer.category === "flash" && <Zap className="w-3 h-3" />}
            {offer.category === "seasonal" && <Calendar className="w-3 h-3" />}
            {offer.category === "exclusive" && <Crown className="w-3 h-3" />}
            {offer.category === "earlybird" && <Sparkles className="w-3 h-3" />}
            {offer.category === "lastminute" && <Timer className="w-3 h-3" />}
            {offer.category === "group" && <Users className="w-3 h-3" />}
            {offer.badge}
          </span>
        </div>

        {/* Discount circle */}
        <div className="absolute top-4 right-4 w-14 h-14 rounded-full bg-[var(--theme-primary)] flex flex-col items-center justify-center">
          <span className="text-[var(--theme-surface)] font-[var(--font-display)] font-bold text-lg leading-none">
            {discount}%
          </span>
          <span className="text-[var(--theme-surface)] text-[8px] font-[var(--font-body)] font-bold uppercase">
            OFF
          </span>
        </div>

        {/* Wishlist & Share */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => toast.success("Added to wishlist!")}
            className="w-8 h-8 bg-[var(--theme-surface)]/80 border border-white/10 flex items-center justify-center hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all text-white"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.success("Link copied!")}
            className="w-8 h-8 bg-[var(--theme-surface)]/80 border border-white/10 flex items-center justify-center hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all text-white"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating & Location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[var(--theme-primary)]">
            <Star className="w-3.5 h-3.5 fill-[var(--theme-primary)]" />
            <span className="text-sm font-semibold">{offer.rating}</span>
            <span className="text-white/30 text-xs">({offer.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Clock className="w-3 h-3" />
            <span className="font-[var(--font-body)]">{offer.duration}</span>
          </div>
        </div>

        <h3 className="text-lg font-[var(--font-display)] text-white font-bold mb-1 line-clamp-2">
          {offer.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[var(--theme-primary)]/50 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          <span className="font-[var(--font-body)]">{offer.destination}</span>
        </div>

        <p className="text-white/40 font-[var(--font-body)] text-sm leading-relaxed mb-4 line-clamp-2">
          {offer.description}
        </p>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-2xl font-[var(--font-display)] font-bold text-[var(--theme-primary)]">
            ${offer.price}
          </span>
          <span className="text-sm text-white/30 line-through font-[var(--font-body)] mb-0.5">
            ${offer.originalPrice}
          </span>
          <span className="ml-auto text-xs bg-emerald-900/40 text-emerald-400 px-2 py-0.5 font-[var(--font-body)] font-semibold">
            Save ${offer.originalPrice - offer.price}
          </span>
        </div>

        {/* Mini Countdown */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer
              className={`w-3.5 h-3.5 ${isUrgent ? "text-red-400" : "text-[var(--theme-primary)]/60"}`}
            />
            <span
              className={`text-xs font-[var(--font-body)] ${isUrgent ? "text-red-400" : "text-white/40"}`}
            >
              {isUrgent ? "Ending soon!" : "Ends in"}
            </span>
          </div>
          <CountdownTimer targetDate={offer.expiresAt} size="sm" />
        </div>

        {/* Spots */}
        <div className="mb-4">
          <SpotsBar left={offer.spotsLeft} total={offer.totalSpots} />
        </div>

        {/* Expandable details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[var(--theme-primary)]/60 text-xs font-[var(--font-body)] hover:text-[var(--theme-primary)] transition-colors mb-4"
        >
          {expanded ? "Hide Details" : "Show Details"}
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-4"
            >
              <div className="space-y-2 pb-2">
                {offer.includes.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-white/50 text-xs font-[var(--font-body)]"
                  >
                    <Check className="w-3 h-3 text-[var(--theme-primary)]" />
                    {item}
                  </div>
                ))}
              </div>
              {offer.promoCode && (
                <div className="mt-3">
                  <p className="text-white/30 text-[10px] font-[var(--font-body)] uppercase tracking-wider mb-1.5">
                    Promo Code
                  </p>
                  <PromoCodeBox code={offer.promoCode} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <a
          href={`/booking?package=${offer.id}`}
          className="w-full flex items-center justify-center gap-2 bg-[var(--theme-primary)] text-[var(--theme-surface)] py-3 font-[var(--font-body)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--theme-primary-light)] transition-all duration-300 group"
        >
          Book Now
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}

/* ─── Newsletter Signup ─── */
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Subscribed! You'll receive exclusive offers.");
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[var(--theme-surface)] to-[var(--theme-surface)] relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-px h-full bg-[var(--theme-primary)]" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-[var(--theme-primary)]" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-[var(--theme-primary)]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 mx-auto mb-6 border border-[var(--theme-primary)]/30 flex items-center justify-center">
            <Bell className="w-7 h-7 text-[var(--theme-primary)]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-white font-bold mb-3">
            Never Miss a Deal
          </h3>
          <p className="text-white/40 font-[var(--font-body)] text-sm mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive
            offers, flash sales, and special travel packages.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 text-emerald-400"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-[var(--font-body)] font-semibold">
                You're subscribed! Check your inbox.
              </span>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex gap-0 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-[#1A1A1A] border border-white/10 border-r-0 px-4 py-3 text-white font-[var(--font-body)] text-sm placeholder:text-white/20 focus:outline-none focus:border-[var(--theme-primary)]/50"
                required
              />
              <button
                type="submit"
                className="bg-[var(--theme-primary)] text-[var(--theme-surface)] px-6 py-3 font-[var(--font-body)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--theme-primary-light)] transition-all"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-white/20 text-xs font-[var(--font-body)] mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Stats Bar ─── */
function OffersStats() {
  const stats = [
    { icon: BadgePercent, value: "Up to 60%", label: "Savings" },
    { icon: Gift, value: "8+", label: "Active Offers" },
    { icon: Users, value: "5,000+", label: "Happy Travelers" },
    { icon: Shield, value: "100%", label: "Money-Back Guarantee" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="bg-[var(--theme-surface)] border border-white/5 p-6 text-center"
        >
          <stat.icon className="w-6 h-6 text-[var(--theme-primary)] mx-auto mb-3" />
          <p className="text-xl font-[var(--font-display)] text-white font-bold">
            {stat.value}
          </p>
          <p className="text-white/40 text-xs font-[var(--font-body)] mt-1">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Offers() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("discount");

  const featuredOffers = useMemo(() => offers.filter((o) => o.featured), []);

  const filteredOffers = useMemo(() => {
    let filtered =
      activeCategory === "all"
        ? offers
        : offers.filter((o) => o.category === activeCategory);
    // Remove featured from grid if showing all
    if (activeCategory === "all") {
      filtered = filtered.filter((o) => !o.featured);
    }

    switch (sortBy) {
      case "discount":
        return [...filtered].sort((a, b) => {
          const dA = (a.originalPrice - a.price) / a.originalPrice;
          const dB = (b.originalPrice - b.price) / b.originalPrice;
          return dB - dA;
        });
      case "price-low":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "ending":
        return [...filtered].sort(
          (a, b) =>
            new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
        );
      case "rating":
        return [...filtered].sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="Special Offers & Deals - Exclusive Travel Promotions"
        description="Discover exclusive travel deals and special offers from VANIR GROUP. Flash sales, seasonal promotions, and limited-time luxury Egypt travel packages at unbeatable prices."
        keywords="Egypt travel deals, luxury travel offers, discount Egypt tours, flash sale travel, seasonal travel promotions, cheap luxury Egypt"
        canonicalPath="/offers"
      />
      <SEO
        title="Special Offers & Deals"
        description="Exclusive travel deals from VANIR GROUP. Save up to 60% on luxury Egypt tours, Nile cruises, and Red Sea resort packages."
        keywords="Egypt travel deals, luxury tour offers, VANIR GROUP discounts, Nile cruise deals"
      />
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/manus-storage/hero-offers_d7a75299.webp"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-surface)]/85 via-[var(--theme-surface)]/75 to-[var(--theme-surface)]" />
        </div>
        {/* Decorative gold lines */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-[var(--theme-primary)]"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                right: 0,
                transform: `rotate(${-2 + i}deg)`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--theme-primary)] font-[var(--font-display)] italic tracking-[0.3em] uppercase text-sm mb-4"
          >
            Exclusive Deals
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-[var(--font-display)] text-white font-bold mb-4"
          >
            Offers & Discounts
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-white/40 text-sm font-[var(--font-body)]"
          >
            <a
              href="/"
              className="hover:text-[var(--theme-primary)] transition-colors"
            >
              Home
            </a>
            <span>&gt;</span>
            <span className="text-[var(--theme-primary)]">Offers</span>
          </motion.div>

          {/* Watermark */}
          <div className="absolute bottom-4 right-8 opacity-10">
            <OptimizedImage
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png"
              alt="VANIR GROUP Logo"
              animation="fade"
              containerClassName="w-32"
              className="w-32 h-auto object-contain"
              lazy={true}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Stats */}
          <OffersStats />

          {/* Flash Sale Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-red-950/40 via-[var(--theme-surface)] to-red-950/40 border border-red-500/20 p-6 md:p-8 mb-16 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-600/20 border border-red-500/30 flex items-center justify-center animate-pulse">
                  <Flame className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-[var(--font-display)] text-white font-bold">
                    Flash Sale Live Now!
                  </h3>
                  <p className="text-white/40 text-sm font-[var(--font-body)]">
                    Limited time offers — up to 60% off selected trips
                  </p>
                </div>
              </div>
              <CountdownTimer targetDate="2026-04-08T23:59:59" size="sm" />
            </div>
          </motion.div>

          {/* Featured Offers */}
          <SectionTitle
            sub="Don't Miss Out"
            title="Featured Deals"
            desc="Hand-picked offers with the biggest savings. These exclusive deals won't last long."
          />

          {featuredOffers.map((offer) => (
            <FeaturedOffer key={offer.id} offer={offer} />
          ))}

          {/* All Offers */}
          <SectionTitle
            sub="Browse All"
            title="All Offers & Deals"
            desc="Explore our complete collection of travel deals and find your perfect getaway."
          />

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-[var(--font-body)] font-semibold uppercase tracking-wider transition-all duration-300 border ${
                    activeCategory === cat.key
                      ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] border-[var(--theme-primary)]"
                      : "bg-transparent text-white/50 border-white/8 hover:border-[var(--theme-primary)]/40 hover:text-[var(--theme-primary)]"
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--theme-surface)] border border-white/10 text-white px-4 py-2 text-xs font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/50"
            >
              <option value="discount">Biggest Discount</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="ending">Ending Soon</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Offers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <AnimatePresence mode="wait">
              {filteredOffers.map((offer, i) => (
                <OfferCard key={offer.id} offer={offer} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {filteredOffers.length === 0 && (
            <div className="text-center py-20">
              <Tag className="w-12 h-12 text-[var(--theme-primary)]/20 mx-auto mb-4" />
              <p className="text-white/40 font-[var(--font-body)]">
                No offers in this category right now. Check back soon!
              </p>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Shield, text: "Secure Booking" },
              { icon: Award, text: "Best Price Guarantee" },
              { icon: TrendingDown, text: "Price Match Promise" },
              { icon: Gift, text: "Free Cancellation" },
            ].map((badge, i) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 bg-[var(--theme-surface)] border border-white/5 p-4"
              >
                <badge.icon className="w-5 h-5 text-[var(--theme-primary)]" />
                <span className="text-white/60 text-xs font-[var(--font-body)] font-semibold">
                  {badge.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      <Footer />
      <BackToTop />
    </div>
  );
}
