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
import { trpc } from "@/lib/trpc";

const CARD_IMAGES_FALLBACK = [
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

/* ── Fan Card — per-card rotateY perspective fan matching reference ── */

// Individual rotateY values create the cascade:
// leftmost card is nearly edge-on (42°), rightmost is near-flat (3°).
// Each card steps 82px to the right with increasing z-depth.
const FAN_CONFIG = [
  { rotateY: 42, z:  0,  delay: 0.2 },
  { rotateY: 26, z: 20,  delay: 0.35 },
  { rotateY: 12, z: 36,  delay: 0.50 },
  { rotateY:  3, z: 48,  delay: 0.65 },
];

const CARD_W = 170;  // px — portrait width
const CARD_H = 300;  // px — portrait height (~1:1.76 ratio)
const STEP   = 82;   // px — horizontal step between card left-edges

function FanCard({
  img,
  index,
}: {
  img: (typeof CARD_IMAGES)[0];
  index: number;
}) {
  const [, navigate] = useLocation();
  const cfg = FAN_CONFIG[index];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: CARD_W,
        height: CARD_H,
        left: index * STEP,
        top: "50%",
        transformOrigin: "center center",
        zIndex: hovered ? 20 : index + 1,
      }}
      // transformTemplate keeps vertical centering and perspective stable while
      // Framer Motion animates rotateY and y independently each frame.
      transformTemplate={({ rotateY, y }) =>
        `translateY(calc(-50% + ${y})) perspective(1000px) rotateY(${rotateY}) translateZ(${cfg.z}px)`
      }
      initial={{ opacity: 0, rotateY: `${cfg.rotateY + 18}deg`, y: "55px" }}
      animate={{ opacity: 1, rotateY: `${cfg.rotateY}deg`, y: "0px" }}
      transition={{ duration: 1.0, delay: cfg.delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: "-14px", transition: { duration: 0.35, ease: "easeOut" } }}
      onClick={() => navigate(img.link)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          borderRadius: 10,
          boxShadow: hovered
            ? "0 20px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(212,168,83,0.35)"
            : "4px 10px 32px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.10)",
          transition: "box-shadow 0.35s ease",
        }}
      >
        {/* Full-bleed image — fills card completely, no text overlay */}
        <OptimizedImage
          src={img.src}
          alt={img.alt}
          lazy={false}
          goldShimmer
          containerClassName="absolute inset-0"
          className="w-full h-full object-cover object-center"
        />

        {/* Subtle top gold accent on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none transition-opacity duration-400"
          style={{
            background: "linear-gradient(90deg, transparent, #D4A853, transparent)",
            opacity: hovered ? 0.85 : 0,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ── Fan Cards Container ── */
function CinematicCardsRow({ cardImages }: { cardImages: typeof CARD_IMAGES_FALLBACK }) {
  const [, navigate] = useLocation();

  // Total footprint: 4 cards × step(82) + card-width(170) = 416px
  const W = (cardImages.length - 1) * STEP + CARD_W + 30; // 30px right breathing room
  const H = CARD_H + 30; // 30px for hover lift clearance

  return (
    <>
      {/* Mobile — 2x2 grid */}
      <div className="grid grid-cols-2 gap-2 sm:hidden" style={{ height: 270 }}>
        {cardImages.map((img, i) => (
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
          </div>
        ))}
      </div>

      {/* Tablet+ — perspective fan */}
      <div
        className="hidden sm:block relative"
        style={{ width: W, height: H }}
      >
        {cardImages.map((img, i) => (
          <FanCard key={i} img={img} index={i} />
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
  const sectionRef = useRef<HTMLSection>(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const cardsY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  // Fetch hero images from database
  const { data: savedImagesJson } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_images" },
    { staleTime: 5 * 60 * 1000 }
  );

  // Parse saved images or use fallback
  const cardImages = useMemo(() => {
    if (!savedImagesJson) return CARD_IMAGES_FALLBACK;
    try {
      const parsed = JSON.parse(savedImagesJson);
      // Validate it's an array with required fields
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].src) {
        return parsed;
      }
    } catch (e) {
      console.warn("[v0] Failed to parse hero images:", e);
    }
    return CARD_IMAGES_FALLBACK;
  }, [savedImagesJson]);

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
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Fan Cards ── */}
        <motion.div
          className="w-full md:w-[54%] flex items-center justify-center md:justify-end"
          style={{ y: cardsY }}
        >
          <CinematicCardsRow cardImages={cardImages} />
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
