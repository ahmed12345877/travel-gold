/*
 * Design: Art Deco Luxe - Dynamic Theme Colors
 * Layout: Left side text with CTAs, right side image grid
 * Color palette: Uses CSS custom properties (--theme-* variables)
 * Features: Restored original design with dynamic theme color support
 */
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Facebook, Instagram } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { ASSETS } from "@/config/assets";
import { useThemeColors } from "@/contexts/ThemeColorsProvider";
import { trpc } from "@/lib/trpc";

/* ── Color utility for opacity-safe color mixing ── */
const colorMix = (color: string, percentage: number): string => {
  return `color-mix(in srgb, ${color} ${percentage}%, transparent)`;
};

/* ── Main Hero ── */
export default function HeroSection() {
  const sectionRef = useRef<HTMLSectionElement | null>(null);
  const { colors } = useThemeColors();
  const [heroData, setHeroData] = useState<any>(null);
  const [heroImages, setHeroImages] = useState<any[]>([]);

  // Fetch hero data from admin
  const { data: savedHeroData } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_data" },
    { staleTime: 30000 }
  );

  // Fetch hero images from admin
  const { data: savedHeroImages } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_images" },
    { staleTime: 30000 }
  );

  useEffect(() => {
    if (savedHeroData) {
      try {
        const parsed = JSON.parse(savedHeroData);
        setHeroData(parsed);
      } catch (e) {
        console.error("Failed to parse hero data:", e);
        setHeroData(null);
      }
    } else {
      setHeroData(null);
    }
  }, [savedHeroData]);

  useEffect(() => {
    if (savedHeroImages) {
      try {
        const parsed = JSON.parse(savedHeroImages);
        if (Array.isArray(parsed)) {
          setHeroImages(parsed);
        } else {
          console.error("Hero images is not an array:", parsed);
          setHeroImages([]);
        }
      } catch (e) {
        console.error("Failed to parse hero images:", e);
        setHeroImages([]);
      }
    } else {
      setHeroImages([]);
    }
  }, [savedHeroImages]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  // Default values if not configured in admin
  const mainTitle = heroData?.title || "Explore";
  const mainSubtitle = heroData?.subtitle || "Egypt's Wonders";
  const mainDescription = heroData?.description || "Experience the magic of ancient Egypt with curated luxury tours, Nile cruises, and unforgettable adventures designed for the discerning traveler.";
  const button1Text = heroData?.buttonText1 || "Begin Your Journey";
  const button1Link = heroData?.buttonLink1 || "#search-form";
  const button2Text = heroData?.buttonText2 || "Explore Gallery";
  const button2Link = heroData?.buttonLink2 || "#gallery";

  // Travel images for the grid (beautiful destinations)
  const heroGridImages = heroImages && heroImages.length > 0 ? heroImages : [
    {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      label: "Mountain Paradise",
      sublabel: "MOUNTAIN TOURS",
    },
    {
      url: "https://images.unsplash.com/photo-1571115764595-644467f3f325?w=400&h=400&fit=crop",
      label: "Culinary Tours",
      sublabel: "CULINARY EXPERIENCE",
    },
    {
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=400&fit=crop",
      label: "Beach Resorts",
      sublabel: "BEACH PARADISE",
    },
    {
      url: "https://images.unsplash.com/photo-1488747807830-63789f68bb65?w=400&h=400&fit=crop",
      label: "Island Paradise",
      sublabel: "ISLAND ESCAPE",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, var(--theme-background), var(--theme-surface))`,
      }}
    >
      {/* ── Background accent ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -right-32 -top-32 w-64 h-64 rounded-full blur-3xl"
          style={{
            backgroundColor: colorMix(colors.primary, 3),
          }}
        ></div>
        <div
          className="absolute -left-32 -bottom-32 w-80 h-80 rounded-full blur-3xl"
          style={{
            backgroundColor: colorMix(colors.primary, 2),
          }}
        ></div>
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
              className="text-sm sm:text-base tracking-widest uppercase"
              style={{ color: colorMix(colors.primary, 80) }}
            >
              — VANIR GROUP — LUXURY TRAVEL —
            </motion.p>

            {/* Main Title with dynamic primary color */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              style={{ color: colors.text }}
            >
              <span className="block">{mainTitle}</span>
              <span className="block" style={{ color: colors.primary }}>{mainSubtitle}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-base sm:text-lg max-w-md leading-relaxed"
              style={{ color: colors.textMuted }}
            >
              {mainDescription}
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
                href={button1Link}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-300 hover:scale-105 focus-visible:scale-105 focus-visible:outline-none"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  boxShadow: `0 0 20px ${colorMix(colors.primary, 13)}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 30px ${colorMix(colors.primary, 25)}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 20px ${colorMix(colors.primary, 13)}`;
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 30px ${colorMix(colors.primary, 25)}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 20px ${colorMix(colors.primary, 13)}`;
                }}
              >
                {button1Text}
                <ArrowRight size={20} />
              </a>

              {/* Secondary CTA */}
              <a
                href={button2Link}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 font-semibold rounded-lg transition-all duration-300 focus-visible:outline-none"
                style={{
                  borderColor: colorMix(colors.text, 30),
                  color: colors.text,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.backgroundColor = colorMix(colors.primary, 8);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colorMix(colors.text, 30);
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.backgroundColor = colorMix(colors.primary, 8);
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colorMix(colors.text, 30);
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {button2Text}
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
            {heroGridImages.map((image, index) => (
              <motion.figure
                key={image.url || index}
                className="relative group overflow-hidden rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Image */}
                <img
                  src={image.url || image.src}
                  alt={image.label || image.alt || `Hero image ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={320}
                  className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    backgroundColor: colorMix(colors.background, 40),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colorMix(colors.background, 20);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colorMix(colors.background, 40);
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.backgroundColor = colorMix(colors.background, 20);
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.backgroundColor = colorMix(colors.background, 40);
                  }}
                  tabIndex={-1}
                />

                {/* Title */}
                <figcaption className="absolute inset-0 flex items-end p-3 sm:p-4">
                  <div className="space-y-1">
                    <p
                      className="text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"
                      style={{ color: colors.text }}
                    >
                      {image.label}
                    </p>
                    {image.sublabel && (
                      <p
                        className="text-xs opacity-0 group-hover:opacity-75 group-focus-within:opacity-75 transition-opacity duration-300 tracking-widest"
                        style={{ color: colorMix(colors.text, 60) }}
                      >
                        {image.sublabel}
                      </p>
                    )}
                  </div>
                </figcaption>
              </motion.figure>
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
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none"
          style={{
            border: `1px solid ${colorMix(colors.text, 30)}`,
            color: colorMix(colors.text, 70),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.color = colors.primary;
            e.currentTarget.style.backgroundColor = colorMix(colors.primary, 8);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colorMix(colors.text, 30);
            e.currentTarget.style.color = colorMix(colors.text, 70);
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.color = colors.primary;
            e.currentTarget.style.backgroundColor = colorMix(colors.primary, 8);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colorMix(colors.text, 30);
            e.currentTarget.style.color = colorMix(colors.text, 70);
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Facebook"
        >
          <Facebook size={18} />
        </a>
        <a
          href="https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none"
          style={{
            border: `1px solid ${colorMix(colors.text, 30)}`,
            color: colorMix(colors.text, 70),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.color = colors.primary;
            e.currentTarget.style.backgroundColor = colorMix(colors.primary, 8);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colorMix(colors.text, 30);
            e.currentTarget.style.color = colorMix(colors.text, 70);
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.color = colors.primary;
            e.currentTarget.style.backgroundColor = colorMix(colors.primary, 8);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colorMix(colors.text, 30);
            e.currentTarget.style.color = colorMix(colors.text, 70);
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Instagram"
        >
          <Instagram size={18} />
        </a>
      </motion.div>

      {/* ── Watermark ── */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none opacity-10">
        <img
          src={ASSETS.LOGO_WATERMARK}
          alt="VANIR GROUP logo watermark"
          className="h-8 sm:h-10 md:h-14 lg:h-16 w-auto object-contain"
          draggable={false}
          decoding="async"
        />
      </div>
    </section>
  );
}
