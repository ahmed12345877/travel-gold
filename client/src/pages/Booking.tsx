/*
 * Design: Art Deco Luxe – Black & Gold
 * Booking System: Full trip booking page with package selection,
 * booking form, payment step, and email confirmation simulation
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import OptimizedImage from "@/components/OptimizedImage";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  Calendar, MapPin, Clock, Star, Users, ArrowRight, ArrowLeft,
  Check, Mail, Phone, User, CreditCard, Plane, Shield, Award,
  ChevronDown, ChevronUp, Minus, Plus, X, Heart, Share2, Briefcase,
  Lock, Eye, EyeOff, Wallet, BadgeCheck, CircleDollarSign
} from "lucide-react";

/* ─── Trip Packages Data ─── */
interface TripPackage {
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
  highlights: string[];
  category: string;
  maxGuests: number;
  departureDates: string[];
}

const tripPackages: TripPackage[] = [
  {
    id: 1,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-egypt-YcosuhKLMYbaJ475QVrVxy.webp",
    title: "Pyramids & Nile Cruise Adventure",
    destination: "Cairo & Luxor, Egypt",
    description: "Experience the magic of ancient Egypt with a guided tour of the Pyramids of Giza, the Sphinx, and a luxurious Nile cruise from Luxor to Aswan visiting iconic temples.",
    price: 1299,
    originalPrice: 1599,
    duration: "8 Days / 7 Nights",
    rating: 4.9,
    reviews: 234,
    includes: ["5-Star Hotels", "Private Guide", "Nile Cruise", "All Meals", "Airport Transfer", "Entry Tickets"],
    highlights: ["Pyramids of Giza", "Valley of the Kings", "Karnak Temple", "Nile Sunset Cruise", "Egyptian Museum"],
    category: "Cultural",
    maxGuests: 12,
    departureDates: ["2026-05-15", "2026-06-01", "2026-06-15", "2026-07-01", "2026-07-15"],
  },
  {
    id: 2,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-sharm-Fh2PhqqrRQGfdg6EtwXedu.webp",
    title: "Sharm El Sheikh Beach Escape",
    destination: "Sharm El Sheikh, Egypt",
    description: "Relax on pristine beaches, explore vibrant coral reefs, and enjoy world-class diving in the crystal-clear waters of the Red Sea at a luxury beachfront resort.",
    price: 899,
    originalPrice: 1199,
    duration: "6 Days / 5 Nights",
    rating: 4.8,
    reviews: 189,
    includes: ["Beachfront Resort", "Snorkeling Gear", "2 Dive Sessions", "Breakfast & Dinner", "Airport Transfer", "Spa Access"],
    highlights: ["Ras Mohammed Park", "Tiran Island", "Naama Bay", "Glass Bottom Boat", "Desert Safari"],
    category: "Beach",
    maxGuests: 8,
    departureDates: ["2026-05-10", "2026-05-25", "2026-06-10", "2026-06-25", "2026-07-10"],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    title: "Mount Sinai & Desert Trek",
    destination: "Sinai Peninsula, Egypt",
    description: "Trek through the stunning Sinai desert landscape, climb Mount Sinai for a breathtaking sunrise, and discover the ancient St. Catherine's Monastery.",
    price: 699,
    originalPrice: 899,
    duration: "5 Days / 4 Nights",
    rating: 4.7,
    reviews: 156,
    includes: ["Desert Camp", "Bedouin Guide", "Camel Ride", "All Meals", "Camping Equipment", "Transport"],
    highlights: ["Mount Sinai Sunrise", "St. Catherine's Monastery", "Blue Hole", "Colored Canyon", "Bedouin Dinner"],
    category: "Adventure",
    maxGuests: 10,
    departureDates: ["2026-05-20", "2026-06-05", "2026-06-20", "2026-07-05", "2026-07-20"],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    title: "Alexandria & Mediterranean Coast",
    destination: "Alexandria, Egypt",
    description: "Discover the pearl of the Mediterranean with visits to the ancient Library of Alexandria, Qaitbay Citadel, and enjoy fresh seafood along the stunning corniche.",
    price: 549,
    originalPrice: 749,
    duration: "4 Days / 3 Nights",
    rating: 4.6,
    reviews: 128,
    includes: ["Sea View Hotel", "City Guide", "Museum Tickets", "Breakfast", "Airport Transfer", "Boat Tour"],
    highlights: ["Library of Alexandria", "Qaitbay Citadel", "Montazah Palace", "Corniche Walk", "Fish Market"],
    category: "Cultural",
    maxGuests: 15,
    departureDates: ["2026-05-12", "2026-05-28", "2026-06-12", "2026-06-28", "2026-07-12"],
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop",
    title: "Luxury Hurghada All-Inclusive",
    destination: "Hurghada, Egypt",
    description: "Indulge in the ultimate luxury beach vacation with an all-inclusive stay at a premium resort, private beach access, and exclusive water sports activities.",
    price: 1099,
    originalPrice: 1399,
    duration: "7 Days / 6 Nights",
    rating: 4.9,
    reviews: 312,
    includes: ["5-Star All-Inclusive", "Private Beach", "Water Sports", "All Meals & Drinks", "Airport Transfer", "Kids Club"],
    highlights: ["Giftun Island", "Dolphin House", "Desert Quad Biking", "Submarine Tour", "Sunset Sailing"],
    category: "Luxury",
    maxGuests: 6,
    departureDates: ["2026-05-08", "2026-05-22", "2026-06-08", "2026-06-22", "2026-07-08"],
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&h=400&fit=crop",
    title: "Siwa Oasis Desert Retreat",
    destination: "Siwa Oasis, Egypt",
    description: "Escape to the remote Siwa Oasis for a unique desert wellness retreat. Enjoy natural hot springs, ancient ruins, and the serenity of the Great Sand Sea.",
    price: 799,
    originalPrice: 999,
    duration: "5 Days / 4 Nights",
    rating: 4.8,
    reviews: 97,
    includes: ["Eco Lodge", "Desert Guide", "4x4 Safari", "All Meals", "Hot Springs Access", "Sandboarding"],
    highlights: ["Cleopatra's Spring", "Temple of the Oracle", "Great Sand Sea", "Salt Lakes", "Stargazing"],
    category: "Adventure",
    maxGuests: 8,
    departureDates: ["2026-05-18", "2026-06-03", "2026-06-18", "2026-07-03", "2026-07-18"],
  },
];

const categories = ["All", "Cultural", "Beach", "Adventure", "Luxury"];

/* ─── Booking Steps (now includes payment) ─── */
type BookingStep = "packages" | "details" | "form" | "payment" | "confirmation";

/* ─── Section Title ─── */
function SectionTitle({ sub, title, desc }: { sub: string; title: string; desc?: string }) {
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
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[var(--font-display)] text-white mb-4 sm:mb-6"
      >
        {title}
      </motion.h2>
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="w-12 h-[1px] bg-[var(--theme-primary)]" />
        <span className="w-2 h-2 rotate-45 bg-[var(--theme-primary)]" />
        <span className="w-12 h-[1px] bg-[var(--theme-primary)]" />
      </div>
      {desc && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/60 max-w-2xl mx-auto font-[var(--font-body)] leading-relaxed"
        >
          {desc}
        </motion.p>
      )}
    </div>
  );
}

/* ─── Step Indicator (5 steps now) ─── */
function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  const steps = [
    { key: "packages", label: "Package", icon: Briefcase },
    { key: "details", label: "Details", icon: Calendar },
    { key: "form", label: "Your Info", icon: User },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "confirmation", label: "Confirmed", icon: Check },
  ];
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-1 md:gap-3 mb-12">
      {steps.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;
        const StepIcon = step.icon;
        return (
          <div key={step.key} className="flex items-center gap-1 md:gap-3">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isActive
                    ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-surface)]"
                    : isCompleted
                    ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]"
                    : "border-white/10 text-white/30"
                }`}
              >
                {isCompleted ? <Check size={16} /> : <StepIcon size={16} />}
              </div>
              <span
                className={`text-[9px] md:text-xs font-[var(--font-body)] uppercase tracking-wider hidden sm:block ${
                  isActive ? "text-[var(--theme-primary)]" : isCompleted ? "text-[var(--theme-primary)]/60" : "text-white/30"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 md:w-12 h-[1px] mb-6 sm:mb-0 ${
                  isCompleted ? "bg-[var(--theme-primary)]" : "bg-[var(--theme-primary)]/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Package Card ─── */
function PackageCard({
  pkg,
  onSelect,
}: {
  pkg: TripPackage;
  onSelect: (pkg: TripPackage) => void;
}) {
  const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-[var(--theme-surface)] border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/40 transition-all duration-500 rounded-lg"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/80 via-transparent to-transparent" />
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-[var(--theme-primary)] text-[var(--theme-surface)] text-[10px] font-bold px-2.5 py-1 rounded-full font-[var(--font-body)] uppercase tracking-wider">
            Save {discount}%
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); toast.success("Added to wishlist"); }}
            className="w-8 h-8 rounded-full bg-[var(--theme-surface)]/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-[var(--theme-primary)] transition-colors"
          >
            <Heart size={14} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="bg-[var(--theme-surface)]/60 backdrop-blur-sm text-[var(--theme-primary)] text-[10px] px-2.5 py-1 rounded-full font-[var(--font-body)] uppercase tracking-wider border border-[var(--theme-primary)]/30">
            {pkg.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-[var(--font-display)] text-lg text-white mb-1 group-hover:text-[var(--theme-primary)] transition-colors">
            {pkg.title}
          </h3>
          <p className="text-white/40 text-xs flex items-center gap-1 font-[var(--font-body)]">
            <MapPin size={12} className="text-[var(--theme-primary)]" /> {pkg.destination}
          </p>
        </div>

        <p className="text-white/50 text-sm font-[var(--font-body)] leading-relaxed line-clamp-2">
          {pkg.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-white/50 font-[var(--font-body)]">
          <span className="flex items-center gap-1"><Clock size={12} className="text-[var(--theme-primary)]" />{pkg.duration}</span>
          <span className="flex items-center gap-1"><Star size={12} className="text-[var(--theme-primary)]" />{pkg.rating} ({pkg.reviews})</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <span className="text-white/30 text-xs line-through font-[var(--font-body)]">${pkg.originalPrice}</span>
            <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-2xl font-bold ml-2">${pkg.price}</span>
            <span className="text-white/30 text-xs font-[var(--font-body)]"> /person</span>
          </div>
          <button
            onClick={() => onSelect(pkg)}
            className="flex items-center gap-1 px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-surface)] text-xs font-bold rounded font-[var(--font-body)] uppercase tracking-wider hover:bg-[var(--theme-primary-light)] transition-colors"
          >
            Book Now <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Trip Details Step ─── */
function TripDetailsStep({
  pkg,
  bookingData,
  setBookingData,
  onNext,
  onBack,
}: {
  pkg: TripPackage;
  bookingData: BookingData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const totalPrice = pkg.price * bookingData.guests + (bookingData.roomType === "deluxe" ? 100 : bookingData.roomType === "suite" ? 250 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-5xl mx-auto"
    >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">

        {/* Left: Trip Info */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg overflow-hidden">
            <div className="relative h-64">
              <OptimizedImage src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" containerClassName="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-2xl font-[var(--font-display)] text-white">{pkg.title}</h3>
                <p className="text-white/60 text-sm flex items-center gap-1 mt-1 font-[var(--font-body)]">
                  <MapPin size={14} className="text-[var(--theme-primary)]" /> {pkg.destination}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-white/60 font-[var(--font-body)] leading-relaxed">{pkg.description}</p>

              {/* Highlights */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-[var(--theme-primary)] font-[var(--font-body)] mb-3">Trip Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {pkg.highlights.map((h) => (
                    <span key={h} className="text-xs bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] px-3 py-1.5 rounded-full font-[var(--font-body)] border border-white/10">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Includes */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-[var(--theme-primary)] font-[var(--font-body)] mb-3">What's Included</h4>
                <div className="grid grid-cols-2 gap-2">
                  {pkg.includes.map((inc) => (
                    <div key={inc} className="flex items-center gap-2 text-sm text-white/60 font-[var(--font-body)]">
                      <Check size={14} className="text-[var(--theme-primary)] shrink-0" /> {inc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Options */}
        <div className="lg:col-span-2">
          <div className="sticky top-28 bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6 space-y-5">
            <h4 className="text-lg font-[var(--font-display)] text-white">Trip Configuration</h4>

            {/* Departure Date */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                <Calendar size={12} className="text-[var(--theme-primary)]" /> Departure Date *
              </label>
              <select
                value={bookingData.departureDate}
                onChange={(e) => setBookingData((p) => ({ ...p, departureDate: e.target.value }))}
                className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
              >
                <option value="">Select a date</option>
                {pkg.departureDates.map((d) => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                  </option>
                ))}
              </select>
            </div>

            {/* Guests */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                <Users size={12} className="text-[var(--theme-primary)]" /> Number of Guests
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBookingData((p) => ({ ...p, guests: Math.max(1, p.guests - 1) }))}
                  className="w-10 h-10 rounded bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white font-[var(--font-display)] text-xl w-8 text-center">{bookingData.guests}</span>
                <button
                  onClick={() => setBookingData((p) => ({ ...p, guests: Math.min(pkg.maxGuests, p.guests + 1) }))}
                  className="w-10 h-10 rounded bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 transition-colors"
                >
                  <Plus size={14} />
                </button>
                <span className="text-white/30 text-xs font-[var(--font-body)]">Max {pkg.maxGuests}</span>
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                <Briefcase size={12} className="text-[var(--theme-primary)]" /> Room Type
              </label>
              <select
                value={bookingData.roomType}
                onChange={(e) => setBookingData((p) => ({ ...p, roomType: e.target.value }))}
                className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
              >
                <option value="standard">Standard Room</option>
                <option value="deluxe">Deluxe Room (+$100)</option>
                <option value="suite">Suite (+$250)</option>
              </select>
            </div>

            {/* Price Summary */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50 font-[var(--font-body)]">Package ({bookingData.guests} guests)</span>
                <span className="text-white">${pkg.price * bookingData.guests}</span>
              </div>
              {bookingData.roomType === "deluxe" && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 font-[var(--font-body)]">Deluxe Upgrade</span>
                  <span className="text-white">+$100</span>
                </div>
              )}
              {bookingData.roomType === "suite" && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 font-[var(--font-body)]">Suite Upgrade</span>
                  <span className="text-white">+$250</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/5">
                <span className="text-white font-[var(--font-body)] font-semibold">Total</span>
                <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-xl font-bold">
                  ${totalPrice}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (!bookingData.departureDate) {
                    toast.error("Please select a departure date");
                    return;
                  }
                  onNext();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-bold text-sm uppercase tracking-wider rounded hover:bg-[var(--theme-primary-light)] transition-colors duration-300"
              >
                Continue to Booking
                <ArrowRight size={16} />
              </button>
              <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] text-sm rounded hover:bg-[var(--theme-primary)]/10 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Packages
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/5">
              {[
                { icon: Shield, label: "Secure" },
                { icon: Award, label: "Best Price" },
                { icon: Plane, label: "Free Cancel" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1 text-white/30 text-[10px]">
                  <badge.icon size={12} className="text-[var(--theme-primary)]/50" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Booking Data Interface ─── */
interface BookingData {
  departureDate: string;
  guests: number;
  roomType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  specialRequests: string;
  agreeTerms: boolean;
}

/* ─── Payment Data Interface ─── */
interface PaymentData {
  method: "card" | "paypal" | "bank";
  cardNumber: string;
  cardName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  saveCard: boolean;
  billingAddress: string;
  billingCity: string;
  billingCountry: string;
  billingZip: string;
}

/* ─── Booking Form Step ─── */
function BookingFormStep({
  pkg,
  bookingData,
  setBookingData,
  onSubmit,
  onBack,
}: {
  pkg: TripPackage;
  bookingData: BookingData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const totalPrice = pkg.price * bookingData.guests + (bookingData.roomType === "deluxe" ? 100 : bookingData.roomType === "suite" ? 250 : 0);

  const handleContinue = () => {
    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!bookingData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!bookingData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-5xl mx-auto"
    >
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6 md:p-8 space-y-6">
            <h3 className="text-2xl font-[var(--font-display)] text-white mb-2">Personal Information</h3>
            <p className="text-white/40 text-sm font-[var(--font-body)] mb-6">Please fill in your details to proceed to payment.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                  <User size={12} className="text-[var(--theme-primary)]" /> First Name *
                </label>
                <input
                  type="text"
                  value={bookingData.firstName}
                  onChange={(e) => setBookingData((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="John"
                  className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                  <User size={12} className="text-[var(--theme-primary)]" /> Last Name *
                </label>
                <input
                  type="text"
                  value={bookingData.lastName}
                  onChange={(e) => setBookingData((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                  <Mail size={12} className="text-[var(--theme-primary)]" /> Email Address *
                </label>
                <input
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                  <Phone size={12} className="text-[var(--theme-primary)]" /> Phone Number *
                </label>
                <input
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+20 123 456 7890"
                  className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                  <Plane size={12} className="text-[var(--theme-primary)]" /> Nationality
                </label>
                <input
                  type="text"
                  value={bookingData.nationality}
                  onChange={(e) => setBookingData((p) => ({ ...p, nationality: e.target.value }))}
                  placeholder="Egyptian"
                  className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 block">
                  Special Requests
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData((p) => ({ ...p, specialRequests: e.target.value }))}
                  placeholder="Any dietary requirements, accessibility needs, or special celebrations..."
                  rows={3}
                  className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20 resize-none"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={bookingData.agreeTerms}
                onChange={(e) => setBookingData((p) => ({ ...p, agreeTerms: e.target.checked }))}
                className="mt-1 accent-[var(--theme-primary)]"
              />
              <span className="text-white/50 text-xs font-[var(--font-body)] leading-relaxed group-hover:text-white/70 transition-colors">
                I agree to the <span className="text-[var(--theme-primary)]">Terms & Conditions</span> and <span className="text-[var(--theme-primary)]">Privacy Policy</span>. I understand that my booking is subject to availability and confirmation by VANIR GROUP.
              </span>
            </label>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleContinue}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-bold text-sm uppercase tracking-wider rounded hover:bg-[var(--theme-primary-light)] transition-colors duration-300"
              >
                <CreditCard size={16} />
                Continue to Payment — ${totalPrice}
              </button>
              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] text-sm rounded hover:bg-[var(--theme-primary)]/10 transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-28 bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6 space-y-5">
            <h4 className="text-lg font-[var(--font-display)] text-white">Booking Summary</h4>
            <div className="relative rounded-lg overflow-hidden">
              <OptimizedImage src={pkg.image} alt={pkg.title} className="w-full h-40 object-cover" containerClassName="w-full h-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/80 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white text-sm font-[var(--font-display)] font-semibold">{pkg.title}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50 flex items-center gap-2"><MapPin size={12} className="text-[var(--theme-primary)]" />Destination</span>
                <span className="text-white">{pkg.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 flex items-center gap-2"><Calendar size={12} className="text-[var(--theme-primary)]" />Departure</span>
                <span className="text-white">
                  {bookingData.departureDate
                    ? new Date(bookingData.departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 flex items-center gap-2"><Clock size={12} className="text-[var(--theme-primary)]" />Duration</span>
                <span className="text-white">{pkg.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 flex items-center gap-2"><Users size={12} className="text-[var(--theme-primary)]" />Guests</span>
                <span className="text-white">{bookingData.guests}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">${pkg.price * bookingData.guests}</span>
              </div>
              {bookingData.roomType !== "standard" && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Room Upgrade</span>
                  <span className="text-white">+${bookingData.roomType === "deluxe" ? 100 : 250}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/5">
                <span className="text-white font-semibold">Total</span>
                <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-xl font-bold">${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Card Number Formatting ─── */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function getCardBrand(number: string): { brand: string; color: string } {
  const d = number.replace(/\s/g, "");
  if (d.startsWith("4")) return { brand: "VISA", color: "#1A1F71" };
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return { brand: "Mastercard", color: "#EB001B" };
  if (/^3[47]/.test(d)) return { brand: "AMEX", color: "#006FCF" };
  if (/^6(?:011|5)/.test(d)) return { brand: "Discover", color: "#FF6000" };
  return { brand: "", color: "" };
}

/* ─── Payment Step ─── */
function PaymentStep({
  pkg,
  bookingData,
  paymentData,
  setPaymentData,
  onSubmit,
  onBack,
  setBookingConfirmationCode,
}: {
  pkg: TripPackage;
  bookingData: BookingData;
  paymentData: PaymentData;
  setPaymentData: React.Dispatch<React.SetStateAction<PaymentData>>;
  onSubmit: () => void;
  onBack: () => void;
  setBookingConfirmationCode: (code: string) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const createBookingMutation = trpc.bookings.create.useMutation();

  const totalPrice = pkg.price * bookingData.guests + (bookingData.roomType === "deluxe" ? 100 : bookingData.roomType === "suite" ? 250 : 0);
  const cardBrand = getCardBrand(paymentData.cardNumber);

  const handlePayment = async () => {
    if (paymentData.method === "card") {
      const digits = paymentData.cardNumber.replace(/\s/g, "");
      if (digits.length < 13) {
        toast.error("Please enter a valid card number");
        return;
      }
      if (!paymentData.cardName.trim()) {
        toast.error("Please enter the cardholder name");
        return;
      }
      if (!paymentData.expiryMonth || !paymentData.expiryYear) {
        toast.error("Please select the expiry date");
        return;
      }
      if (paymentData.cvv.length < 3) {
        toast.error("Please enter a valid CVV");
        return;
      }
    }

    setProcessing(true);
    try {
      const paymentMethodMap = { card: "credit_card" as const, paypal: "paypal" as const, bank: "bank_transfer" as const };
      const totalPrice = pkg.price * bookingData.guests + (bookingData.roomType === "deluxe" ? 100 : bookingData.roomType === "suite" ? 250 : 0);
      const result = await createBookingMutation.mutateAsync({
        packageName: pkg.title,
        packageCategory: pkg.category,
        destination: pkg.destination,
        checkInDate: bookingData.departureDate ? new Date(bookingData.departureDate).getTime() : undefined,
        adults: bookingData.guests,
        children: 0,
        roomType: bookingData.roomType,
        totalPrice: totalPrice.toString(),
        currency: "USD",
        paymentMethod: paymentMethodMap[paymentData.method],
        specialRequests: bookingData.specialRequests || undefined,
        guestName: `${bookingData.firstName} ${bookingData.lastName}`,
        guestEmail: bookingData.email,
        guestPhone: bookingData.phone || undefined,
        billingAddress: paymentData.method === "card" ? {
          address: paymentData.billingAddress,
          city: paymentData.billingCity,
          country: paymentData.billingCountry,
          zip: paymentData.billingZip,
        } : undefined,
      });
      if (result?.confirmationCode) {
        setBookingConfirmationCode(result.confirmationCode);
      }
      setProcessing(false);
      onSubmit();
    } catch (error: any) {
      setProcessing(false);
      toast.error(error.message || "Booking failed. Please try again.");
    }
  };

  const paymentMethods = [
    { id: "card" as const, label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, AMEX" },
    { id: "paypal" as const, label: "PayPal", icon: Wallet, desc: "Pay with your PayPal account" },
    { id: "bank" as const, label: "Bank Transfer", icon: CircleDollarSign, desc: "Direct bank transfer" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-5xl mx-auto"
    >
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Payment Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Payment Method Selection */}
          <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6 md:p-8">
            <h3 className="text-2xl font-[var(--font-display)] text-white mb-2">Payment Method</h3>
            <p className="text-white/40 text-sm font-[var(--font-body)] mb-6">Choose your preferred payment method to complete the booking.</p>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentData((p) => ({ ...p, method: method.id }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 text-left ${
                    paymentData.method === method.id
                      ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                      : "border-white/8 hover:border-[var(--theme-primary)]/30 bg-[var(--theme-surface)]/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    paymentData.method === method.id ? "bg-[var(--theme-primary)] text-[var(--theme-surface)]" : "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]"
                  }`}>
                    <method.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-[var(--font-body)] font-semibold text-sm ${
                      paymentData.method === method.id ? "text-[var(--theme-primary)]" : "text-white"
                    }`}>{method.label}</p>
                    <p className="text-white/40 text-xs font-[var(--font-body)]">{method.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentData.method === method.id ? "border-[var(--theme-primary)]" : "border-[var(--theme-primary)]/30"
                  }`}>
                    {paymentData.method === method.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Details (shown only for card payment) */}
          <AnimatePresence mode="wait">
            {paymentData.method === "card" && (
              <motion.div
                key="card-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6 md:p-8 space-y-6"
              >
                {/* Interactive Card Preview */}
                <div className="flex justify-center mb-4">
                  <div
                    className="relative w-full max-w-[380px] aspect-[1.586/1] cursor-pointer perspective-1000"
                    onClick={() => setCardFlipped(!cardFlipped)}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-2xl overflow-hidden"
                      animate={{ rotateY: cardFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Front */}
                      <div
                        className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
                        style={{
                          backfaceVisibility: "hidden",
                          background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)",
                          border: "1px solid rgba(212,168,83,0.3)",
                          boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,168,83,0.1)",
                        }}
                      >
                        {/* Top row */}
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-9 rounded bg-gradient-to-br from-[var(--theme-primary)] to-[#B8902E] opacity-80" />
                          {cardBrand.brand && (
                            <span className="text-[var(--theme-primary)] font-[var(--font-body)] font-bold text-lg tracking-wider">
                              {cardBrand.brand}
                            </span>
                          )}
                        </div>
                        {/* Card number */}
                        <div className="mt-4">
                          <p className="text-white font-mono text-xl tracking-[0.2em]">
                            {paymentData.cardNumber || "•••• •••• •••• ••••"}
                          </p>
                        </div>
                        {/* Bottom row */}
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white/30 text-[9px] uppercase tracking-wider font-[var(--font-body)]">Card Holder</p>
                            <p className="text-white font-[var(--font-body)] text-sm tracking-wider uppercase">
                              {paymentData.cardName || "YOUR NAME"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/30 text-[9px] uppercase tracking-wider font-[var(--font-body)]">Expires</p>
                            <p className="text-white font-[var(--font-body)] text-sm">
                              {paymentData.expiryMonth || "MM"}/{paymentData.expiryYear ? paymentData.expiryYear.slice(-2) : "YY"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Back */}
                      <div
                        className="absolute inset-0 rounded-2xl flex flex-col justify-center"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)",
                          border: "1px solid rgba(212,168,83,0.3)",
                          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                        }}
                      >
                        <div className="w-full h-12 bg-[#2a2a2a] mt-6" />
                        <div className="px-6 mt-6">
                          <div className="flex items-center justify-end gap-3">
                            <div className="flex-1 h-10 bg-[var(--theme-primary-light)]/10 rounded flex items-center justify-end px-4">
                              <span className="text-white font-mono tracking-wider">
                                {paymentData.cvv || "•••"}
                              </span>
                            </div>
                            <p className="text-white/30 text-xs font-[var(--font-body)]">CVV</p>
                          </div>
                        </div>
                        <div className="px-6 mt-6">
                          <p className="text-white/20 text-[8px] font-[var(--font-body)] leading-relaxed">
                            This card is property of VANIR GROUP Banking Services. Unauthorized use is prohibited. If found, please return to the nearest branch.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                <p className="text-center text-white/30 text-xs font-[var(--font-body)]">Click the card to flip</p>

                <h4 className="text-lg font-[var(--font-display)] text-white">Card Details</h4>

                {/* Card Number */}
                <div>
                  <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                    <CreditCard size={12} className="text-[var(--theme-primary)]" /> Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        setPaymentData((p) => ({ ...p, cardNumber: formatted }));
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 pr-20 rounded text-sm font-mono tracking-wider focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {cardBrand.brand && (
                        <span className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] font-bold">{cardBrand.brand}</span>
                      )}
                      <Lock size={14} className="text-[var(--theme-primary)]/50" />
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-2">
                    <User size={12} className="text-[var(--theme-primary)]" /> Cardholder Name *
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData((p) => ({ ...p, cardName: e.target.value.toUpperCase() }))}
                    placeholder="JOHN DOE"
                    className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] uppercase tracking-wider focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 block">
                      Month *
                    </label>
                    <select
                      value={paymentData.expiryMonth}
                      onChange={(e) => setPaymentData((p) => ({ ...p, expiryMonth: e.target.value }))}
                      className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-3 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i + 1).padStart(2, "0");
                        return <option key={m} value={m}>{m}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 block">
                      Year *
                    </label>
                    <select
                      value={paymentData.expiryYear}
                      onChange={(e) => setPaymentData((p) => ({ ...p, expiryYear: e.target.value }))}
                      className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-3 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const y = String(2026 + i);
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs uppercase tracking-wider font-[var(--font-body)] mb-2 flex items-center gap-1">
                      CVV *
                    </label>
                    <div className="relative">
                      <input
                        type={showCvv ? "text" : "password"}
                        value={paymentData.cvv}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setPaymentData((p) => ({ ...p, cvv: val }));
                        }}
                        onFocus={() => setCardFlipped(true)}
                        onBlur={() => setCardFlipped(false)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 pr-10 rounded text-sm font-mono tracking-wider focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]/50 hover:text-[var(--theme-primary)] transition-colors"
                      >
                        {showCvv ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="pt-4 border-t border-white/5">
                  <h5 className="text-sm font-[var(--font-body)] uppercase tracking-wider text-white/70 mb-4">Billing Address</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={paymentData.billingAddress}
                        onChange={(e) => setPaymentData((p) => ({ ...p, billingAddress: e.target.value }))}
                        placeholder="Street Address"
                        className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                      />
                    </div>
                    <input
                      type="text"
                      value={paymentData.billingCity}
                      onChange={(e) => setPaymentData((p) => ({ ...p, billingCity: e.target.value }))}
                      placeholder="City"
                      className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                    />
                    <input
                      type="text"
                      value={paymentData.billingZip}
                      onChange={(e) => setPaymentData((p) => ({ ...p, billingZip: e.target.value }))}
                      placeholder="Postal Code"
                      className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors placeholder:text-white/20"
                    />
                    <div className="md:col-span-2">
                      <select
                        value={paymentData.billingCountry}
                        onChange={(e) => setPaymentData((p) => ({ ...p, billingCountry: e.target.value }))}
                        className="w-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 text-white px-4 py-3 rounded text-sm font-[var(--font-body)] focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
                      >
                        <option value="">Select Country</option>
                        <option value="EG">Egypt</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="KW">Kuwait</option>
                        <option value="QA">Qatar</option>
                        <option value="BH">Bahrain</option>
                        <option value="OM">Oman</option>
                        <option value="JO">Jordan</option>
                        <option value="LB">Lebanon</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Save Card */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={paymentData.saveCard}
                    onChange={(e) => setPaymentData((p) => ({ ...p, saveCard: e.target.checked }))}
                    className="accent-[var(--theme-primary)]"
                  />
                  <span className="text-white/50 text-xs font-[var(--font-body)] group-hover:text-white/70 transition-colors">
                    Save this card for future bookings
                  </span>
                </label>
              </motion.div>
            )}

            {/* PayPal */}
            {paymentData.method === "paypal" && (
              <motion.div
                key="paypal-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6 md:p-8"
              >
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center mx-auto mb-6">
                    <Wallet size={36} className="text-[var(--theme-primary)]" />
                  </div>
                  <h4 className="text-xl font-[var(--font-display)] text-white mb-3">Pay with PayPal</h4>
                  <p className="text-white/50 text-sm font-[var(--font-body)] max-w-md mx-auto mb-6">
                    You will be redirected to PayPal to complete your payment securely. After payment, you'll be returned to this page for confirmation.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-[var(--theme-primary)]/10 border border-white/10 rounded-lg px-4 py-2">
                    <Lock size={14} className="text-[var(--theme-primary)]" />
                    <span className="text-[var(--theme-primary)] text-xs font-[var(--font-body)]">Secured by PayPal Buyer Protection</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bank Transfer */}
            {paymentData.method === "bank" && (
              <motion.div
                key="bank-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6 md:p-8"
              >
                <h4 className="text-lg font-[var(--font-display)] text-white mb-4">Bank Transfer Details</h4>
                <p className="text-white/50 text-sm font-[var(--font-body)] mb-6">
                  Please transfer the total amount to the following bank account. Your booking will be confirmed once we receive the payment.
                </p>
                <div className="bg-[var(--theme-surface)] border border-white/10 rounded-lg p-5 space-y-4">
                  {[
                    { label: "Bank Name", value: "National Bank of Egypt" },
                    { label: "Account Name", value: "VANIR GROUP Travel LLC" },
                    { label: "Account Number", value: "1234-5678-9012-3456" },
                    { label: "IBAN", value: "EG12 0003 0004 0000 1234 5678 901" },
                    { label: "SWIFT Code", value: "NBEGEGCX" },
                    { label: "Reference", value: `VG-${Date.now().toString(36).toUpperCase().slice(0, 6)}` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-white/50 text-xs uppercase tracking-wider font-[var(--font-body)]">{item.label}</span>
                      <span className="text-white text-sm font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-[var(--theme-primary)]/5 border border-white/10 rounded-lg p-4 flex items-start gap-3">
                  <Clock size={16} className="text-[var(--theme-primary)] mt-0.5 shrink-0" />
                  <p className="text-white/50 text-xs font-[var(--font-body)] leading-relaxed">
                    Please complete the transfer within <span className="text-[var(--theme-primary)] font-semibold">48 hours</span>. Include the reference number in your transfer details. Your booking will be held until payment is confirmed.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Notice */}
          <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-5">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {[Shield, Lock, BadgeCheck].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg bg-[var(--theme-primary)]/10 flex items-center justify-center">
                    <Icon size={18} className="text-[var(--theme-primary)]" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-sm font-[var(--font-body)] font-semibold">Secure Payment</p>
                <p className="text-white/40 text-xs font-[var(--font-body)]">256-bit SSL encryption. PCI DSS compliant. Your data is safe.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-bold text-sm uppercase tracking-wider rounded hover:bg-[var(--theme-primary-light)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--theme-surface)]/30 border-t-[var(--theme-surface)] rounded-full animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  {paymentData.method === "bank" ? "Confirm & Get Bank Details" : `Pay $${totalPrice} Securely`}
                </>
              )}
            </button>
            <button
              onClick={onBack}
              disabled={processing}
              className="flex items-center justify-center gap-2 px-6 py-4 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] text-sm rounded hover:bg-[var(--theme-primary)]/10 transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-28 space-y-6">
            <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6 space-y-5">
              <h4 className="text-lg font-[var(--font-display)] text-white">Order Summary</h4>
              <div className="relative rounded-lg overflow-hidden">
                <OptimizedImage src={pkg.image} alt={pkg.title} className="w-full h-36 object-cover" containerClassName="w-full h-36" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/80 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white text-sm font-[var(--font-display)] font-semibold">{pkg.title}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50 flex items-center gap-2"><MapPin size={12} className="text-[var(--theme-primary)]" />Destination</span>
                  <span className="text-white text-right text-xs">{pkg.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 flex items-center gap-2"><Calendar size={12} className="text-[var(--theme-primary)]" />Departure</span>
                  <span className="text-white text-xs">
                    {bookingData.departureDate
                      ? new Date(bookingData.departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 flex items-center gap-2"><Users size={12} className="text-[var(--theme-primary)]" />Guests</span>
                  <span className="text-white">{bookingData.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 flex items-center gap-2"><User size={12} className="text-[var(--theme-primary)]" />Guest</span>
                  <span className="text-white text-xs">{bookingData.firstName} {bookingData.lastName}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Package</span>
                  <span className="text-white">${pkg.price * bookingData.guests}</span>
                </div>
                {bookingData.roomType !== "standard" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Room Upgrade</span>
                    <span className="text-white">+${bookingData.roomType === "deluxe" ? 100 : 250}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Processing Fee</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/5">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-2xl font-bold">${totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Accepted Cards */}
            <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-4">
              <p className="text-white/40 text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">We Accept</p>
              <div className="flex items-center gap-3">
                {["VISA", "MC", "AMEX", "PayPal"].map((card) => (
                  <div key={card} className="flex-1 bg-[var(--theme-surface)] border border-white/5 rounded py-2 text-center">
                    <span className="text-[var(--theme-primary)]/60 text-[10px] font-[var(--font-body)] font-bold">{card}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="bg-[var(--theme-primary)]/5 border border-white/10 rounded-lg p-4 flex items-start gap-3">
              <Shield size={20} className="text-[var(--theme-primary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-xs font-[var(--font-body)] font-semibold mb-1">Money-Back Guarantee</p>
                <p className="text-white/40 text-[10px] font-[var(--font-body)] leading-relaxed">
                  Full refund if cancelled 48+ hours before departure. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Confirmation Step ─── */
function ConfirmationStep({
  pkg,
  bookingData,
  paymentData,
  confirmationCode,
}: {
  pkg: TripPackage;
  bookingData: BookingData;
  paymentData: PaymentData;
  confirmationCode?: string;
}) {
  const bookingRef = confirmationCode || `VG-${Date.now().toString(36).toUpperCase()}`;
  const totalPrice = pkg.price * bookingData.guests + (bookingData.roomType === "deluxe" ? 100 : bookingData.roomType === "suite" ? 250 : 0);

  const paymentMethodLabel = paymentData.method === "card"
    ? `Card ending in ${paymentData.cardNumber.replace(/\s/g, "").slice(-4)}`
    : paymentData.method === "paypal"
    ? "PayPal"
    : "Bank Transfer";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto"
    >
      {/* Success Animation */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-[var(--theme-primary)]/10 border-2 border-[var(--theme-primary)] flex items-center justify-center mx-auto mb-6"
        >
          <Check size={40} className="text-[var(--theme-primary)]" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl md:text-4xl font-[var(--font-display)] text-white mb-3 sm:mb-4"
        >
          Payment Successful!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/60 font-[var(--font-body)] max-w-lg mx-auto"
        >
          Your booking has been confirmed and payment processed. A confirmation email has been sent to{" "}
          <span className="text-[var(--theme-primary)]">{bookingData.email}</span>.
        </motion.p>
      </div>

      {/* Booking Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[var(--theme-surface)] border border-white/8 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[var(--theme-primary)]/10 border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <p className="text-[var(--theme-primary)] text-xs uppercase tracking-wider font-[var(--font-body)]">Booking Reference</p>
            <p className="text-white font-[var(--font-display)] text-2xl font-bold">{bookingRef}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center">
            <Plane size={24} className="text-[var(--theme-primary)]" />
          </div>
        </div>

        {/* Trip info */}
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <OptimizedImage src={pkg.image} alt={pkg.title} className="w-24 h-24 rounded-lg object-cover" containerClassName="w-24 h-24 rounded-lg shrink-0" />
            <div>
              <h4 className="font-[var(--font-display)] text-lg text-white">{pkg.title}</h4>
              <p className="text-white/50 text-sm flex items-center gap-1 mt-1"><MapPin size={12} className="text-[var(--theme-primary)]" />{pkg.destination}</p>
              <p className="text-white/50 text-sm flex items-center gap-1 mt-1"><Clock size={12} className="text-[var(--theme-primary)]" />{pkg.duration}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Departure", value: bookingData.departureDate ? new Date(bookingData.departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
              { label: "Guests", value: `${bookingData.guests} person${bookingData.guests > 1 ? "s" : ""}` },
              { label: "Room", value: bookingData.roomType.charAt(0).toUpperCase() + bookingData.roomType.slice(1) },
              { label: "Total Paid", value: `$${totalPrice}` },
            ].map((item) => (
              <div key={item.label} className="bg-[var(--theme-surface)] rounded-lg p-4 text-center">
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-[var(--font-body)] mb-1">{item.label}</p>
                <p className="text-[var(--theme-primary)] font-[var(--font-display)] font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Guest & Payment info */}
          <div className="border-t border-white/5 pt-6">
            <h5 className="text-sm font-[var(--font-body)] uppercase tracking-wider text-white/70 mb-4">Guest & Payment Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User size={14} className="text-[var(--theme-primary)]" />
                <span className="text-white/50">Name:</span>
                <span className="text-white">{bookingData.firstName} {bookingData.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[var(--theme-primary)]" />
                <span className="text-white/50">Email:</span>
                <span className="text-white">{bookingData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[var(--theme-primary)]" />
                <span className="text-white/50">Phone:</span>
                <span className="text-white">{bookingData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-[var(--theme-primary)]" />
                <span className="text-white/50">Payment:</span>
                <span className="text-white">{paymentMethodLabel}</span>
              </div>
            </div>
          </div>

          {/* Payment confirmation */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <BadgeCheck size={20} className="text-green-400" />
            </div>
            <div>
              <h5 className="text-green-400 font-[var(--font-body)] font-semibold text-sm mb-1">Payment Confirmed</h5>
              <p className="text-white/50 text-xs font-[var(--font-body)] leading-relaxed">
                Your payment of <span className="text-[var(--theme-primary)] font-semibold">${totalPrice}</span> has been successfully processed via {paymentMethodLabel}. 
                A receipt and detailed itinerary have been sent to <span className="text-[var(--theme-primary)]">{bookingData.email}</span>.
              </p>
            </div>
          </div>

          {/* Email confirmation notice */}
          <div className="bg-[var(--theme-primary)]/5 border border-white/10 rounded-lg p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-[var(--theme-primary)]" />
            </div>
            <div>
              <h5 className="text-white font-[var(--font-body)] font-semibold text-sm mb-1">What's Next?</h5>
              <p className="text-white/50 text-xs font-[var(--font-body)] leading-relaxed">
                Our travel team will contact you within 24 hours with your detailed itinerary, visa requirements (if applicable), 
                and pre-departure checklist. Check your inbox for the confirmation email.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-white/5 p-6 flex flex-col sm:flex-row gap-3">
          <a
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-semibold text-sm rounded hover:bg-[var(--theme-primary-light)] transition-colors"
          >
            Back to Home
          </a>
          <a
            href="/booking"
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] text-sm rounded hover:bg-[var(--theme-primary)]/10 transition-colors"
          >
            Book Another Trip
          </a>
          <button
            onClick={() => toast.success("Booking receipt downloaded")}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] text-sm rounded hover:bg-[var(--theme-primary)]/10 transition-colors"
          >
            Download Receipt
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Booking Page ─── */
export default function Booking() {
  const [step, setStep] = useState<BookingStep>("packages");
  const [selectedPackage, setSelectedPackage] = useState<TripPackage | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [bookingConfirmationCode, setBookingConfirmationCode] = useState("");
  const [bookingData, setBookingData] = useState<BookingData>({
    departureDate: "",
    guests: 1,
    roomType: "standard",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    specialRequests: "",
    agreeTerms: false,
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: "card",
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    saveCard: false,
    billingAddress: "",
    billingCity: "",
    billingCountry: "",
    billingZip: "",
  });

  // Check URL params for pre-selected package
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkgId = params.get("package");
    if (pkgId) {
      const pkg = tripPackages.find((p) => p.id === parseInt(pkgId));
      if (pkg) {
        setSelectedPackage(pkg);
        setStep("details");
      }
    }
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const filteredPackages = activeCategory === "All"
    ? tripPackages
    : tripPackages.filter((p) => p.category === activeCategory);

  const handleSelectPackage = (pkg: TripPackage) => {
    setSelectedPackage(pkg);
    setStep("details");
  };

  const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png";

  return (
    <div className="min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="Book Your Trip - Luxury Egypt Travel Booking"
        description="Book your dream Egypt vacation with VANIR GROUP. Choose from luxury packages, customize your itinerary, and secure your spot for an unforgettable Egyptian adventure."
        keywords="book Egypt trip, luxury vacation booking, Egypt tour reservation, Nile cruise booking, pyramids tour booking"
        canonicalPath="/booking"
      />
      <SEO
        title="Book Your Trip"
        description="Book your luxury Egypt tour with VANIR GROUP. Choose from curated packages including pyramids, Nile cruises, and Red Sea resorts."
        keywords="book Egypt tour, luxury travel booking, VANIR GROUP packages, Nile cruise booking"
      />
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[35vh] sm:h-[40vh] min-h-[250px] sm:min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/manus-storage/hero-booking_ea711a1f.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-surface)]/70 via-[var(--theme-surface)]/50 to-[var(--theme-surface)]" />
        <div className="relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--theme-primary)] font-[var(--font-display)] italic tracking-[0.3em] uppercase text-sm mb-4"
          >
            Plan Your Journey
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[var(--font-display)] text-white"
          >
            Book Your Trip
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-6 text-white/50 text-sm font-[var(--font-body)]"
          >
            <a href="/" className="hover:text-[var(--theme-primary)] transition-colors">Home</a>
            <span>&gt;</span>
            <span className="text-[var(--theme-primary)]">Booking</span>
          </motion.div>
        </div>
        {/* Watermark logo */}
        <OptimizedImage
          src={LOGO_URL}
          alt="VANIR GROUP Logo"
          animation="fade"
          containerClassName="absolute bottom-6 right-6 h-16 pointer-events-none"
          className="h-16 opacity-15"
          lazy={true}
        />
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          <AnimatePresence mode="wait">
            {/* Step 1: Package Selection */}
            {step === "packages" && (
              <motion.div
                key="packages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SectionTitle
                  sub="Choose Your Adventure"
                  title="Available Trip Packages"
                  desc="Select from our curated collection of luxury travel packages, each designed to provide an unforgettable experience."
                />

                {/* Category Filter */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 text-xs uppercase tracking-wider rounded-full border transition-all duration-300 font-[var(--font-body)] ${
                        activeCategory === cat
                          ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] border-[var(--theme-primary)] font-semibold"
                          : "border-[var(--theme-primary)]/30 text-white/60 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {filteredPackages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} onSelect={handleSelectPackage} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Trip Details */}
            {step === "details" && selectedPackage && (
              <TripDetailsStep
                key="details"
                pkg={selectedPackage}
                bookingData={bookingData}
                setBookingData={setBookingData}
                onNext={() => setStep("form")}
                onBack={() => setStep("packages")}
              />
            )}

            {/* Step 3: Booking Form */}
            {step === "form" && selectedPackage && (
              <BookingFormStep
                key="form"
                pkg={selectedPackage}
                bookingData={bookingData}
                setBookingData={setBookingData}
                onSubmit={() => setStep("payment")}
                onBack={() => setStep("details")}
              />
            )}

            {/* Step 4: Payment */}
            {step === "payment" && selectedPackage && (
              <PaymentStep
                key="payment"
                pkg={selectedPackage}
                bookingData={bookingData}
                paymentData={paymentData}
                setPaymentData={setPaymentData}
                onSubmit={() => setStep("confirmation")}
                onBack={() => setStep("form")}
                setBookingConfirmationCode={setBookingConfirmationCode}
              />
            )}

            {/* Step 5: Confirmation */}
            {step === "confirmation" && selectedPackage && (
              <ConfirmationStep
                key="confirmation"
                pkg={selectedPackage}
                bookingData={bookingData}
                paymentData={paymentData}
                confirmationCode={bookingConfirmationCode}
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Trust Section */}
      {step === "packages" && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
              {[
                { icon: Shield, title: "Secure Booking", desc: "256-bit SSL encryption" },
                { icon: Award, title: "Best Price Guarantee", desc: "We match any lower price" },
                { icon: Plane, title: "Free Cancellation", desc: "Up to 48 hours before" },
                { icon: Users, title: "24/7 Support", desc: "Expert travel assistance" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <item.icon size={28} className="text-[var(--theme-primary)] mx-auto mb-3" />
                  <h4 className="text-white font-[var(--font-body)] font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-white/40 text-xs font-[var(--font-body)]">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <BackToTop />
    </div>
  );
}
