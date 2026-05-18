/*
 * Design: Art Deco Luxe - Black & Gold
 * Testimonials: Premium client reviews with professional avatars,
 * elegant glassmorphism cards, subtle glow effects, and refined animations
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const testimonials = [
  {
    text: "Incredible customer service and attention to detail. VANIR GROUP truly goes above and beyond to ensure their clients have a memorable experience. The private Nile cruise was the highlight of our trip — absolutely world-class.",
    name: "Benjamin Carter",
    role: "CEO, Carter Enterprises",
    location: "New York, USA",
    avatar:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/avatar-benjamin-gpYWFYEDFEziuuNCsPo66v.webp",
    rating: 5,
    trip: "Pyramids & Nile Cruise",
  },
  {
    text: "The trip was absolutely phenomenal. Every detail was carefully planned, from the luxury accommodations to the breathtaking excursions. The team's knowledge of Egypt's hidden gems made this journey truly unforgettable.",
    name: "Lucas Thompson",
    role: "Travel Blogger & Photographer",
    location: "London, UK",
    avatar:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/avatar-lucas-SB2YyXpuVDW6oUtM3i9jSs.webp",
    rating: 5,
    trip: "Desert Safari Adventure",
  },
  {
    text: "From start to finish, the team delivered exceptional service. The personalized itinerary was perfect, and every destination exceeded our expectations. A truly premium experience that I recommend to everyone.",
    name: "Ahmed Roshdi",
    role: "CEO & Founder, VANIR GROUP",
    location: "Cairo, Egypt",
    avatar:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/avatar-ahmed-W3AJmXi7maBfaB8mVbScYN.webp",
    rating: 5,
    trip: "Luxury Egypt Tour",
  },
  {
    text: "VANIR GROUP transformed our family vacation into an extraordinary adventure. The kids loved the interactive tours, and the adults enjoyed the luxurious accommodations. We're already planning our next trip!",
    name: "Sarah Mitchell",
    role: "Marketing Director",
    location: "Dubai, UAE",
    avatar:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/avatar-sarah-LALDT5LcigZqneZ3gWF9Mj.webp",
    rating: 5,
    trip: "Family Heritage Tour",
  },
  {
    text: "As a seasoned traveler, I've experienced many luxury tour operators. VANIR GROUP stands out with their unparalleled attention to detail, exclusive access to historical sites, and genuinely warm hospitality.",
    name: "James Williams",
    role: "Senior VP, Global Finance",
    location: "Chicago, USA",
    avatar:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/avatar-james-dFzv738pnLCwBifYqKxBht.webp",
    rating: 5,
    trip: "Exclusive VIP Experience",
  },
];

export default function TestimonialsSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > activeIndex ? 1 : -1);
      setActiveIndex(idx);
    },
    [activeIndex],
  );

  const next = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, []);

  /* Auto-advance every 6s */
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[activeIndex];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section
      className="relative py-14 sm:py-20 md:py-28 overflow-hidden"
      ref={ref}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[var(--theme-background)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #D4A853 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Gold glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-[var(--theme-primary)]/5 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
            What Our Clients Say
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Client Testimonials
          </h2>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Featured Testimonial - Large Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8 sm:mb-12"
        >
          <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-sm p-5 sm:p-8 md:p-12 overflow-hidden">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-12 sm:w-20 h-12 sm:h-20 border-t-2 border-l-2 border-[var(--theme-primary)]/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-12 sm:w-20 h-12 sm:h-20 border-b-2 border-r-2 border-[var(--theme-primary)]/20 rounded-br-2xl" />

            {/* Large quote icon */}
            <Quote
              size={32}
              className="text-[var(--theme-primary)]/15 absolute top-4 right-4 sm:top-6 sm:right-8 sm:w-12 sm:h-12"
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4 sm:mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-[var(--theme-primary)] fill-[var(--theme-primary)] sm:w-[18px] sm:h-[18px]"
                    />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-white/70 text-sm sm:text-lg md:text-xl leading-relaxed mb-5 sm:mb-8 italic font-[var(--font-body)]">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author info */}
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[var(--theme-primary)]/40 shadow-lg shadow-[var(--theme-primary)]/10">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[var(--theme-background)]" />
                  </div>
                  <div>
                    <h4 className="font-[var(--font-display)] text-white font-semibold text-sm sm:text-lg">
                      {t.name}
                    </h4>
                    <p className="text-[var(--theme-primary)] text-xs sm:text-sm font-medium">
                      {t.role}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-1.5 mt-1 flex-wrap">
                      <MapPin size={12} className="text-white/30" />
                      <span className="text-white/40 text-[10px] sm:text-xs">
                        {t.location}
                      </span>
                      <span className="text-white/20 mx-1">|</span>
                      <span className="text-[var(--theme-primary)]/60 text-[10px] sm:text-xs">
                        {t.trip}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-[var(--theme-primary)]/40 hover:text-[var(--theme-primary)] transition-all duration-300"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === activeIndex
                    ? "w-8 bg-[var(--theme-primary)]"
                    : "w-2 bg-white/15 hover:bg-white/30"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-[var(--theme-primary)]/40 hover:text-[var(--theme-primary)] transition-all duration-300"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Small avatar row - shows all clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap"
        >
          {testimonials.map((person, i) => (
            <button
              key={person.name}
              onClick={() => goTo(i)}
              className={`relative rounded-full overflow-hidden transition-all duration-500 ${
                i === activeIndex
                  ? "w-10 h-10 sm:w-14 sm:h-14 ring-2 ring-[var(--theme-primary)] ring-offset-2 ring-offset-[var(--theme-background)] scale-110"
                  : "w-8 h-8 sm:w-10 sm:h-10 opacity-50 hover:opacity-80 grayscale hover:grayscale-0"
              }`}
            >
              <img
                src={person.avatar}
                alt={person.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </motion.div>

        {/* View All Reviews Link */}
        <div className="text-center mt-8 sm:mt-12">
          <a
            href="/reviews"
            className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-[var(--font-body)] font-semibold text-sm uppercase tracking-wider hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all duration-300 rounded-sm"
          >
            View All Reviews
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
