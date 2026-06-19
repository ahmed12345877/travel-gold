/*
 * Design: Art Deco Luxe - Black & Gold
 * Layout: Left side text with CTAs, right side image grid
 * Color palette: Black (#0d1117), Gold (#D4A853), Light Gold (#F5E6B8)
 * Features: Restored original design with beautiful travel imagery grid
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

  // Travel images for the grid (beautiful destinations)
  const heroImages = [
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      alt: "Mountain landscape",
    },
    {
      src: "https://images.unsplash.com/photo-1571115764595-644467f3f325?w=400&h=400&fit=crop",
      alt: "Food and dining",
    },
    {
      src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=400&fit=crop",
      alt: "Beach resort",
    },
    {
      src: "https://images.unsplash.com/photo-1488747807830-63789f68bb65?w=400&h=400&fit=crop",
      alt: "Coastal beauty",
    },
  ];

  const imageTitles = ["Mountain Paradise", "Culinary Tours", "Beach Resorts", "Island Paradise"];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1a1f2e] flex items-center overflow-hidden"
    >
      {/* ── Background accent ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-32 -top-32 w-64 h-64 bg-[#D4A853]/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-32 -bottom-32 w-80 h-80 bg-[#D4A853]/3 rounded-full blur-3xl"></div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* ── Left Column: Text Content ── */}
          <motion.div
            className="flex flex-col gap-6 sm:gap-8"
            style={{ y: textY }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base tracking-widest text-[#D4A853]/80 uppercase"
            >
              — VANIR GROUP — LUXURY TRAVEL —
            </motion.p>

            {/* Main Title with "Explore" in gold */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
            >
              <span className="block text-white">Explore</span>
              <span className="block text-[#D4A853]">Egypt&apos;s Wonders</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-base sm:text-lg text-gray-300/90 max-w-md leading-relaxed"
            >
              Experience the magic of ancient Egypt with curated luxury tours, Nile cruises, and unforgettable adventures designed for the discerning traveler.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {/* Primary CTA */}
              <a
                href="#search-form"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0d1117] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#D4A853]/20 transition-all duration-300 hover:scale-105"
              >
                Begin Your Journey
                <ArrowRight size={20} />
              </a>

              {/* Secondary CTA */}
              <a
                href="#gallery"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:border-white hover:bg-white/5 transition-all duration-300"
              >
                Explore Gallery
                <ArrowRight size={20} />
              </a>
            </motion.div>
          </motion.div>

          {/* ── Right Column: Image Grid ── */}
          <motion.div
            className="grid grid-cols-2 gap-3 sm:gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {heroImages.map((image, index) => (
              <motion.div
                key={index}
                className="relative group overflow-hidden rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Image */}
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />

                {/* Title */}
                <div className="absolute inset-0 flex items-end p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {imageTitles[index]}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Social Media Icons (bottom right) ── */}
      <motion.div
        className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <a
          href="https://www.facebook.com/share/1DvRyfaQRC/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-[#D4A853] hover:bg-white/10 transition-all duration-300"
          aria-label="Facebook"
        >
          <Facebook size={18} />
        </a>
        <a
          href="https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-[#D4A853] hover:bg-white/10 transition-all duration-300"
          aria-label="Instagram"
        >
          <Instagram size={18} />
        </a>
      </motion.div>

      {/* ── Watermark ── */}
      <div className="absolute bottom-6 left-6 z-5 pointer-events-none opacity-10">
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
