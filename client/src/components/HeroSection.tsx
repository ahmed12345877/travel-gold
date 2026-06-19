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
