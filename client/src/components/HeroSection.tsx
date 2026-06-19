/*
 * Design: Misty Dark Theme - Cinematic Hero
 * Layout: Full-width hero images at top with cinematic reveal effect,
 * elegant text below with animated "Discover" shimmer.
 * Mobile-optimized: 2x2 grid on small screens, 4-column on desktop.
 */
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Facebook, Instagram } from "lucide-react";
import { useRef } from "react";
import { ASSETS } from "@/config/assets";

/* ── Main Hero ── */
export default function HeroSection() {
  const sectionRef = useRef<HTMLSection>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Premium Egyptian Background Image ── */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <img
          src="/images/hero-egyptian.jpg"
          alt="Egyptian pyramid and ancient architecture - luxury travel"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Subtle overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ── Content Container ── */}
      <motion.div
        className="relative z-[8] flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 gap-6 sm:gap-8"
        style={{ y: textY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Main Title - Premium Serif */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight tracking-tight max-w-5xl"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Discover Egypt&apos;s Timeless Wonders
        </motion.h1>

        {/* Subtitle - Golden Italicized */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl italic max-w-3xl"
          style={{ color: "#D4A853" }}
        >
          Journey through ancient civilization and modern enchantment
        </motion.p>

        {/* Divider Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="w-16 h-1 bg-gradient-to-r from-transparent via-white to-transparent mt-2"
        />

        {/* CTA Button - White to Gold Hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <a
            href="https://vanirgroup.com"
            className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 md:px-12 py-4 sm:py-5 font-semibold text-sm sm:text-base md:text-lg tracking-wide rounded-full transition-all duration-500 ease-out"
            style={{
              background: "white",
              color: "#0d1117",
              boxShadow: "0 8px 32px rgba(212, 168, 83, 0.2)",
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget;
              target.style.background = "linear-gradient(135deg, #D4A853 0%, #F5E6B8 50%, #D4A853 100%)";
              target.style.color = "#0d1117";
              target.style.boxShadow = "0 12px 48px rgba(212, 168, 83, 0.4)";
              target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              target.style.background = "white";
              target.style.color = "#0d1117";
              target.style.boxShadow = "0 8px 32px rgba(212, 168, 83, 0.2)";
              target.style.transform = "translateY(0)";
            }}
          >
            Start Exploring
            <ArrowRight size={20} className="transition-transform duration-300" />
          </a>
        </motion.div>
      </motion.div>

      {/* ── Social Media Icons (bottom right) ── */}
      <motion.div
        className="absolute bottom-8 right-8 z-[8] hidden md:flex flex-col gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <a
          href="https://www.facebook.com/share/1DvRyfaQRC/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-300"
          aria-label="Facebook"
        >
          <Facebook size={18} />
        </a>
        <a
          href="https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-300"
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
