/*
 * Design: Art Deco Luxe - Dynamic Theme Colors
 * Layout: Left side text with CTAs, right side image grid
 * Color palette: Uses CSS custom properties (--theme-* variables)
 * Features: Restored original design with dynamic theme color support
 */
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Facebook, Instagram } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { ASSETS } from "@/config/assets";
import { useThemeColors } from "@/contexts/ThemeColorsProvider";
import { trpc } from "@/lib/trpc";
import { applyLuxuryImageFallback } from "@/lib/imageFallback";

/* ── Color utility for opacity-safe color mixing ── */
const colorMix = (color: string, percentage: number): string => {
  return `color-mix(in srgb, ${color} ${percentage}%, transparent)`;
};

/* ── Main Hero ── */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { colors } = useThemeColors();
  const [heroData, setHeroData] = useState<any>(null);
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [sliderIndex, setSliderIndex] = useState(0);

  // Fetch hero data from admin
  const { data: savedHeroData } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_settings" },
    { staleTime: 30000, refetchInterval: 4000, refetchOnWindowFocus: true }
  );
  const { data: savedLegacyHeroData } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_data" },
    { staleTime: 30000, refetchInterval: 4000, refetchOnWindowFocus: true }
  );

  // Fetch hero images from admin
  const { data: savedHeroImages } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_images" },
    { staleTime: 30000, refetchInterval: 4000, refetchOnWindowFocus: true }
  );

  useEffect(() => {
    const payload = savedHeroData || savedLegacyHeroData;
    if (payload) {
      try {
        const parsed = JSON.parse(payload);
        setHeroData(parsed);
      } catch (e) {
        console.error("Failed to parse hero data:", e);
        setHeroData(null);
      }
    } else {
      setHeroData(null);
    }
  }, [savedHeroData, savedLegacyHeroData]);

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
  const mainTitle = heroData?.title || "VANIR GROUP — LUXURY TRAVEL";
  const subtitle = heroData?.subtitle || "— VANIR GROUP — LUXURY TRAVEL —";
  const featuredImageUrl = heroData?.featuredImageUrl;
  const hasBgMedia = heroData && (heroData.mediaType === "image" || heroData.mediaType === "video") && heroData.mediaUrl;
  const backgroundType = heroData?.backgroundType || (heroData?.mediaType === "video" ? "html5-video" : "static-image");
  const sliderImages = heroImages.filter((img) => Boolean(img.url));
  const activeSlide = sliderImages[sliderIndex];

  useEffect(() => {
    if (backgroundType !== "dynamic-slider" || sliderImages.length <= 1) return;
    const autoplayMs = heroData?.autoplayMs || 3500;
    const timer = setInterval(() => {
      setSliderIndex((prev) => {
        const next = prev + 1;
        if (next >= sliderImages.length) {
          return heroData?.loopSlides === false ? prev : 0;
        }
        return next;
      });
    }, autoplayMs);
    return () => clearInterval(timer);
  }, [backgroundType, heroData?.autoplayMs, heroData?.loopSlides, sliderImages.length]);

  const getSliderAnimation = () => {
    switch (heroData?.sliderEffect) {
      case "cube":
        return { initial: { opacity: 0, rotateY: 18, scale: 0.98 }, animate: { opacity: 1, rotateY: 0, scale: 1 }, exit: { opacity: 0, rotateY: -18, scale: 0.98 } };
      case "flip":
        return { initial: { opacity: 0, rotateX: 40 }, animate: { opacity: 1, rotateX: 0 }, exit: { opacity: 0, rotateX: -40 } };
      case "coverflow":
        return { initial: { opacity: 0, x: 60, scale: 0.92 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: -60, scale: 0.92 } };
      case "creative":
        return { initial: { opacity: 0, y: 22, scale: 1.04 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -22, scale: 0.97 } };
      default:
        return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
    }
  };

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
      {/* ── Background media (image / video from admin) ── */}
      {backgroundType === "dynamic-slider" && sliderImages.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.img
            key={activeSlide?.url || "fallback-slide"}
            src={activeSlide?.url}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: `${heroData?.mediaCropX ?? 50}% ${heroData?.mediaCropY ?? 50}%` }}
            alt=""
            onError={(e) => applyLuxuryImageFallback(e.currentTarget)}
            transition={{ duration: 0.8, ease: "easeOut" }}
            {...getSliderAnimation()}
          />
        </AnimatePresence>
      )}
      {backgroundType === "html5-video" && heroData?.mediaUrl && (
        <video
          src={heroData.mediaUrl}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: `${heroData.mediaCropX ?? 50}% ${heroData.mediaCropY ?? 50}%` }}
          muted
          autoPlay
          loop
          playsInline
        />
      )}
      {backgroundType === "static-image" && heroData?.mediaUrl && (
        <img
          src={heroData.mediaUrl}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: `${heroData.mediaCropX ?? 50}% ${heroData.mediaCropY ?? 50}%` }}
          alt=""
          onError={(e) => applyLuxuryImageFallback(e.currentTarget)}
        />
      )}
      {(hasBgMedia || backgroundType === "dynamic-slider") && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: heroData?.overlayColor === "light"
              ? `rgba(255,255,255,${(heroData?.overlayOpacity ?? 50) / 100})`
              : `rgba(0,0,0,${(heroData?.overlayOpacity ?? 50) / 100})`,
          }}
        />
      )}
      {(hasBgMedia || backgroundType === "dynamic-slider") && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />
      )}

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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 md:pt-32 lg:pt-32">
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
              style={{
                color: heroData?.subtitleStyle?.color || colorMix(colors.primary, 85),
                fontSize: `${heroData?.subtitleStyle?.fontSize || 16}px`,
                fontWeight: heroData?.subtitleStyle?.fontWeight || "bold",
                textAlign: (heroData?.subtitleStyle?.textAlign || "left") as any,
                letterSpacing: `${heroData?.subtitleStyle?.letterSpacing || 4}px`,
                lineHeight: `${heroData?.subtitleStyle?.lineHeight || 1.4}`,
                textTransform: (heroData?.subtitleStyle?.textTransform || "uppercase") as any,
                opacity: heroData?.subtitleStyle?.opacity || 1,
                textShadow: heroData?.subtitleStyle?.textShadow
                  ? `${heroData?.subtitleStyle?.shadowOffsetX || 2}px ${heroData?.subtitleStyle?.shadowOffsetY || 2}px ${heroData?.subtitleStyle?.shadowBlur || 8}px ${heroData?.subtitleStyle?.shadowColor || "rgba(0,0,0,0.5)"}`
                  : "none",
              }}
            >
              {subtitle}
            </motion.p>

            {/* Main Title with dynamic primary color and custom styles */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="leading-tight tracking-tight"
              style={{
                transition: heroData?.textFadeInEnabled ? `opacity ${heroData?.textFadeInDuration || 900}ms ease` : undefined,
                fontSize: `${heroData?.titleStyle?.fontSize || 56}px`,
                fontWeight: heroData?.titleStyle?.fontWeight || "bold",
                color: heroData?.titleStyle?.color || "#ffffff",
                textAlign: (heroData?.titleStyle?.textAlign || "left") as any,
                textTransform: (heroData?.titleStyle?.textTransform || "none") as any,
                letterSpacing: `${heroData?.titleStyle?.letterSpacing || 1}px`,
                lineHeight: `${heroData?.titleStyle?.lineHeight || 1.4}`,
                opacity: heroData?.titleStyle?.opacity || 1,
                textShadow: heroData?.titleStyle?.textShadow
                  ? `${heroData?.titleStyle?.shadowOffsetX || 2}px ${heroData?.titleStyle?.shadowOffsetY || 2}px ${heroData?.titleStyle?.shadowBlur || 8}px ${heroData?.titleStyle?.shadowColor || "rgba(0,0,0,0.5)"}`
                  : "none",
              }}
            >
              <span className="block">{mainTitle}</span>
            </motion.h1>
          </motion.div>

          {/* ── Right Column: Image Grid ── */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Featured Image - 5th Hero Image */}
            {featuredImageUrl && (
              <motion.figure
                className="relative group overflow-hidden rounded-lg w-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={featuredImageUrl}
                  alt="Featured Hero Image"
                  loading="lazy"
                  decoding="async"
                  width={500}
                  height={300}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => applyLuxuryImageFallback(e.currentTarget)}
                />
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
                />
              </motion.figure>
            )}
            
            {/* Grid Images - 4 images */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                    onError={(e) => applyLuxuryImageFallback(e.currentTarget)}
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
            </div>
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
          onError={(e) => applyLuxuryImageFallback(e.currentTarget)}
        />
      </div>
    </section>
  );
}
