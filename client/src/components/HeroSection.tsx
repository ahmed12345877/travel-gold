/*
 * Design: Misty Dark Theme - Cinematic Hero
 * Layout: Full-width hero images at top with cinematic reveal effect,
 * elegant text below with animated "Discover" shimmer.
 * Mobile-optimized: 2x2 grid on small screens, 4-column on desktop.
 */
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, Facebook, Instagram } from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";

const HERO_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/misty-hero-bg-L7rPLhy7UyP6hQeLmG4RHw.webp";
const HERO_VIDEO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/hero_video_optimized_882588ee.mp4";
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png";

const CARD_IMAGES = [
  {
    src: "/manus-storage/5d0d46494043a2b038ba343324bc8f0d_0780bda8.jpg",
    alt: "Explore Egyptian Destinations - Luxury Travel Experiences",
    label: "Destinations",
    sub: "Ancient Wonders",
    link: "/destinations",
  },
  {
    src: "/manus-storage/7c432e4f0cd306e2cdb1baa297b06080_95a7f0d0.jpg",
    alt: "Special Travel Offers and Exclusive Deals",
    label: "Exclusive Offers",
    sub: "Premium Deals",
    link: "/offers",
  },
  {
    src: "/manus-storage/b80f9986b2674d3e00234a665f8766de_1a5fab97.jpg",
    alt: "Gallery - Luxury Travel Moments",
    label: "Gallery",
    sub: "Captured Moments",
    link: "/gallery",
  },
  {
    src: "/manus-storage/7ad96b54737ddbdf4212d40750e60a1c_814f4a6b.jpg",
    alt: "Gallery - Unforgettable Experiences",
    label: "Experiences",
    sub: "Unforgettable",
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

/* ── Cinematic Card with Reveal Effect ── */
function CinematicCard({
  img,
  index,
  activeIndex,
  isMobileGrid,
}: {
  img: (typeof CARD_IMAGES)[0];
  index: number;
  activeIndex: number;
  isMobileGrid?: boolean;
}) {
  const [, navigate] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const isActive = index === activeIndex;

  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer group"
      style={
        isMobileGrid
          ? { width: "100%", height: "100%" }
          : {
              flex: isActive ? "2.2" : "1",
              transition: "flex 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }
      }
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.9,
        delay: 0.3 + index * 0.12,
        ease: [0.23, 1, 0.32, 1],
      }}
      onClick={() => navigate(img.link)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full h-full overflow-hidden rounded-xl">
        <motion.img
          src={img.src}
          alt={img.alt}
          className="w-full h-full object-cover"
          loading="eager"
          animate={{
            scale: isHovered ? 1.08 : 1,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        {/* Permanent subtle gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Gold accent line at top */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, #D4A853, transparent)",
          }}
          animate={{
            opacity: isActive || isHovered ? 1 : 0.3,
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Cinematic light sweep on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(212,168,83,0.15) 50%, transparent 60%)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "200%" : "-100%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Label - always visible at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
          <motion.div
            animate={{
              y: isActive || isHovered ? 0 : 4,
              opacity: isActive || isHovered ? 1 : 0.7,
            }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[var(--theme-primary)] text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium mb-0.5 sm:mb-1">
              {img.sub}
            </p>
            <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-wide">
              {img.label}
            </p>
          </motion.div>
        </div>

        {/* Active indicator dot */}
        <motion.div
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--theme-primary)]"
          animate={{
            scale: isActive ? [1, 1.3, 1] : 0,
            opacity: isActive ? 1 : 0,
          }}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut",
          }}
        />

        {/* Hover border glow */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? "inset 0 0 0 1px rgba(212,168,83,0.5), 0 0 30px rgba(212,168,83,0.15)"
              : "inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </motion.div>
  );
}

/* ── Cards Row with auto-cycling active state ── */
function CinematicCardsRow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARD_IMAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile: 2x2 grid */}
      <div
        className="grid grid-cols-2 gap-2 sm:hidden"
        style={{ height: "280px" }}
      >
        {CARD_IMAGES.map((img, i) => (
          <CinematicCard
            key={i}
            img={img}
            index={i}
            activeIndex={activeIndex}
            isMobileGrid
          />
        ))}
      </div>
      {/* Tablet+: flex row with accordion effect */}
      <div
        className="hidden sm:flex gap-2 md:gap-3 lg:gap-4"
        style={{ height: "clamp(180px, 25vw, 300px)" }}
      >
        {CARD_IMAGES.map((img, i) => (
          <CinematicCard
            key={i}
            img={img}
            index={i}
            activeIndex={activeIndex}
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
    <span
      className="inline-block relative overflow-hidden"
      style={{ minWidth: "3ch" }}
    >
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
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        )}
        {videoError && (
          <img
            src={HERO_BG}
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
      <div className="container relative z-[8] flex flex-col pt-12 sm:pt-20 md:pt-24 pb-8 sm:pb-14">
        {/* ── TOP: Cinematic Cards Row ── */}
        <motion.div
          style={{ y: cardsY }}
          className="w-full mb-4 sm:mb-8 md:mb-10"
        >
          <CinematicCardsRow />
        </motion.div>

        {/* ── BOTTOM: Text Content - Centered & Elegant ── */}
        <motion.div
          className="w-full max-w-3xl mx-auto text-center px-2 sm:px-0"
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
              className="text-white/45 text-xs sm:text-sm md:text-base lg:text-lg max-w-xl mx-auto font-[var(--font-body)] leading-relaxed mb-6 sm:mb-8 md:mb-10 px-2 sm:px-0"
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
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center"
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
          src={LOGO_URL}
          alt="VANIR GROUP logo watermark"
          className="h-8 sm:h-10 md:h-14 lg:h-16 w-auto object-contain"
          draggable={false}
        />
      </div>
    </section>
  );
}
