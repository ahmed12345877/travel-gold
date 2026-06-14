/*
 * Design: Misty Dark Theme - Cinematic Hero
 * Layout: Full-width hero images at top with cinematic reveal effect,
 * elegant text below with animated "Discover" shimmer.
 * Mobile-optimized: 2x2 grid on small screens, 4-column on desktop.
 */
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Facebook, Instagram } from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import OptimizedImage from "./OptimizedImage";
import { ASSETS } from "@/config/assets";

const CARD_IMAGES = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cruise-Generic-EqH5djLblFD3QfzRSnq56AE3g7hAIu.png",
    alt: "Luxury Cruise Experience - Relax and Enjoy",
    label: "Cruise Escapes",
    sub: "Floating Luxury",
    link: "/destinations",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vanir_food_3-Rdyjh36pekachbCFRk73ART9Imjeqb.png",
    alt: "Culinary Experience - Local Food Tours",
    label: "Culinary Tours",
    sub: "Taste Culture",
    link: "/offers",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GEN010463-1fZjBC81TLBrrDMAWsUDQiS6GCjXKY.jpg",
    alt: "Fine Dining on Deck - Gourmet Cruise Dining",
    label: "Fine Dining",
    sub: "Ocean Views",
    link: "/gallery",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FS-Landaa-Giraavaru-Water-Villa-Maldives-Qk26jDyyM14z5kTULVMheNLhRq1C17.jpeg",
    alt: "Luxury Resort - Overwater Villa Paradise",
    label: "Beach Resorts",
    sub: "Island Paradise",
    link: "/gallery",
  },
];

/* ── Ambient Particles ── */
function AmbientParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.2 + 0.05,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(212, 168, 83, ${p.opacity}) 0%, transparent 70%)`,
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, Math.random() * 30 - 15],
            opacity: [0, p.opacity, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Card Stack — shared container perspective + click-to-focus ── */

// Each card sits in the stack with a fixed horizontal offset.
// The OUTER container carries the isometric angle from the spec:
//   perspective(1200px) rotateY(-20deg) skewY(4deg)
// Clicking a card elevates it (translateZ + resets rotateY) while
// the others dim, giving a "bring to front" focus effect.

const STACK_STEP = 88; // px between card left-edges

function StackCard({
  img,
  index,
  activeIndex,
  onActivate,
}: {
  img: (typeof CARD_IMAGES)[0];
  index: number;
  activeIndex: number;
  onActivate: (i: number) => void;
}) {
  const [, navigate] = useLocation();
  const isActive = index === activeIndex;
  const isOther = activeIndex !== -1 && !isActive;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        // Portrait 1:1.78 ratio — tall cards matching reference
        width: 158,
        height: 282,
        left: index * STACK_STEP,
        top: "50%",
        transformOrigin: "center center",
        zIndex: isActive ? 20 : index + 1,
      }}
      // Per-card: only handle vertical centering + focus elevation.
      // The container carries rotateY / skewY so no per-card rotation needed.
      transformTemplate={({ y }) =>
        `translateY(calc(-50% + ${y})) translateZ(0px)`
      }
      animate={{
        y: isActive ? "-60px" : "0px",
        scale: isActive ? 1.06 : isOther ? 0.96 : 1,
        opacity: isOther ? 0.55 : 1,
        filter: isOther ? "brightness(0.6)" : "brightness(1)",
      }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      initial={{ opacity: 0, y: "60px" }}
      whileInView={{ opacity: 1, y: "0px" }}
      viewport={{ once: true }}
      onClick={() => {
        if (isActive) {
          navigate(img.link);
        } else {
          onActivate(index);
        }
      }}
    >
      {/* Card shell */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          borderRadius: 12,
          boxShadow: isActive
            ? "0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(212,168,83,0.4)"
            : "6px 12px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.10)",
          transition: "box-shadow 0.45s ease",
        }}
      >
        {/* Full-bleed image — object-cover preserves full resolution & ratio */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={img.src}
            alt={img.alt}
            lazy={false}
            goldShimmer
            containerClassName="absolute inset-0"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Gradient scrim — fades to black at bottom for label legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Gold accent line — top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, #D4A853, transparent)",
            opacity: isActive ? 1 : 0.35,
            transition: "opacity 0.45s",
          }}
        />

        {/* Label — glassmorphism panel at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-3 z-10"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            background: "rgba(0, 0, 0, 0.38)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Category — gold, uppercase, no wrapping */}
          <p
            className="text-[var(--theme-primary)] uppercase font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontSize: 9, letterSpacing: "0.20em", lineHeight: 1.4 }}
          >
            {img.sub}
          </p>
          {/* Title — white, no wrapping */}
          <p
            className="text-white font-bold whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontSize: 13, lineHeight: 1.35 }}
          >
            {img.label}
          </p>
        </div>

        {/* Active indicator ring */}
        {isActive && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: 12 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0"
              style={{
                borderRadius: 12,
                boxShadow: "inset 0 0 0 1.5px rgba(212,168,83,0.65)",
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Card Stack Container ── */
function CinematicCardsRow() {
  const [, navigate] = useLocation();
  // -1 means no card is actively focused
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Clicking outside the stack resets focus
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Container: 4 × 88px step + 158px card = 510px total footprint
  // Extra 40px right padding so last card isn't clipped by container edge
  const W = STACK_STEP * (CARD_IMAGES.length - 1) + 158 + 40;

  return (
    <>
      {/* Mobile — 2x2 grid */}
      <div className="grid grid-cols-2 gap-2 sm:hidden" style={{ height: 270 }}>
        {CARD_IMAGES.map((img, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl cursor-pointer"
            onClick={() => navigate(img.link)}
          >
            <OptimizedImage
              src={img.src}
              alt={img.alt}
              lazy={false}
              goldShimmer
              containerClassName="absolute inset-0"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div
              className="absolute bottom-0 left-0 right-0 px-2 py-2"
              style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                background: "rgba(0,0,0,0.35)",
              }}
            >
              <p
                className="text-[var(--theme-primary)] uppercase font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ fontSize: 8, letterSpacing: "0.18em" }}
              >
                {img.sub}
              </p>
              <p
                className="text-white font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ fontSize: 11 }}
              >
                {img.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet+ — isometric container + stacked cards */}
      <div
        className="hidden sm:block"
        style={{
          // Isometric angle applied once to the whole group — matches spec exactly
          transform: "perspective(1200px) rotateY(-20deg) skewY(4deg)",
          transformOrigin: "center center",
          width: W,
          height: 320,
          position: "relative",
        }}
        ref={containerRef}
      >
        {CARD_IMAGES.map((img, i) => (
          <StackCard
            key={i}
            img={img}
            index={i}
            activeIndex={activeIndex}
            onActivate={setActiveIndex}
          />
        ))}
      </div>
    </>
  );
}

/* ── Animated word rotator for heading ── */
const ROTATING_WORDS = ["Discover", "Explore", "Experience"];

function RotatingWord() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative overflow-hidden" style={{ minWidth: "3ch" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[wordIndex]}
          className="gold-shimmer inline-block"
          initial={{ y: 40, opacity: 0, rotateX: -45 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -40, opacity: 0, rotateX: 45 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          {ROTATING_WORDS[wordIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── Main Hero ── */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const cardsY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      {/* ── Background Video with parallax ── */}
      <motion.div className="absolute inset-0 z-[1]" style={{ y: bgY }}>
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-[120%] object-cover object-center"
          >
            <source src={ASSETS.HERO_VIDEO} type="video/mp4" />
          </video>
        )}
        {videoError && (
          <img
            src={ASSETS.HERO_BG}
            alt="Misty mountains landscape - atmospheric travel destination"
            className="absolute inset-0 w-full h-[120%] object-cover object-center"
          />
        )}
        <div className="fog-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-surface)]/60 via-[var(--theme-surface)]/30 to-[var(--theme-surface)]/80" />
      </motion.div>

      {/* ── Ambient Particles ── */}
      <AmbientParticles />

      {/* ── Content ── */}
      <div className="container relative z-[8] flex flex-col md:flex-row items-center justify-between gap-8 pt-12 sm:pt-20 md:pt-0 pb-8 sm:pb-14 min-h-screen">

        {/* ── LEFT: Text Content ── */}
        <motion.div
          className="w-full md:w-[46%] text-left px-2 sm:px-0 md:pl-4"
          style={{ y: textY }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {/* Brand Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
            >
              <div className="h-px w-6 sm:w-8 md:w-12 bg-gradient-to-r from-transparent to-[var(--theme-primary)]/60" />
              <span className="text-white/40 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-[var(--font-body)]">
                VANIR GROUP &mdash; Luxury Travel
              </span>
              <div className="h-px w-6 sm:w-8 md:w-12 bg-gradient-to-l from-transparent to-[var(--theme-primary)]/60" />
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
              className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-5 leading-[1.15]"
            >
              <span className="block mb-1"></span>
              <RotatingWord />
              <span className="block text-white/70 text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-1 sm:mt-2 font-light">
                Egypt&apos;s Wonders
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-white/45 text-xs sm:text-sm md:text-base lg:text-lg max-w-xl font-[var(--font-body)] leading-relaxed mb-6 sm:mb-8 md:mb-10 px-2 sm:px-0"
            >
              Experience the magic of ancient Egypt with curated luxury tours,
              Nile cruises, and unforgettable adventures designed for the
              discerning traveler.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.7 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start"
            >
              <a
                href="/booking"
                className="hero-btn-primary group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 font-semibold text-xs sm:text-sm tracking-wide w-full sm:w-auto"
              >
                Begin Your Journey
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </a>
              <a
                href="/gallery"
                className="hero-btn-secondary group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border-2 font-semibold text-xs sm:text-sm tracking-wide backdrop-blur-sm w-full sm:w-auto"
              >
                Explore Gallery
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Fan Cards ── */}
        <motion.div
          className="w-full md:w-[54%] flex items-center justify-center md:justify-end"
          style={{ y: cardsY }}
        >
          <CinematicCardsRow />
        </motion.div>

      </div>

      {/* ── Social Media Icons (bottom right) ── */}
      <motion.div
        className="absolute bottom-8 right-8 z-[8] hidden md:flex flex-col gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <a
          href="https://www.facebook.com/share/1DvRyfaQRC/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[var(--theme-primary)]/50 hover:bg-[var(--theme-primary)]/10 transition-all duration-300"
          aria-label="Facebook"
        >
          <Facebook size={18} />
        </a>
        <a
          href="https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[var(--theme-primary)]/50 hover:bg-[var(--theme-primary)]/10 transition-all duration-300"
          aria-label="Instagram"
        >
          <Instagram size={18} />
        </a>
      </motion.div>

      {/* ── Watermark ── */}
      <div className="absolute bottom-6 left-6 z-[7] pointer-events-none opacity-10">
        <img
          src={ASSETS.LOGO_WATERMARK}
          alt="VANIR GROUP logo watermark"
          className="h-8 sm:h-10 md:h-14 lg:h-16 w-auto object-contain"
          draggable={false}
        />
      </div>
    </section>
  );
}
