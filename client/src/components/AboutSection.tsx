/*
 * Design: Art Deco Luxe - Black & Gold
 * About: Two-column layout with images (watermarked) and text, gold accents
 * Mobile-optimized: responsive padding, image heights, and text sizes
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import WatermarkImage from "@/components/WatermarkImage";

const ABOUT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/about-travel-4Y8tnAxaJ7BPzwzd9c8nz7.webp";
const COMPASS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/adventure-compass-JPN4nXqdUC8hH7JzrSRakn.webp";

export default function AboutSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <section id="about" className="py-12 sm:py-16 md:py-24 bg-[var(--theme-surface)]" ref={ref}>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Images column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <WatermarkImage
                  src={ABOUT_IMG}
                  alt="Luxury travel experience"
                  className="border border-white/10 h-40 sm:h-52 md:h-64"
                  imgClassName="hover:scale-105 transition-transform duration-700"
                  watermarkPosition="bottom-right"
                  watermarkOpacity={0.25}
                  watermarkSize="h-4 sm:h-5 md:h-6"
                  loading="lazy"
                />
                <WatermarkImage
                  src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=300&fit=crop"
                  alt="Travel scenery"
                  className="border border-white/10 h-32 sm:h-40 md:h-48"
                  imgClassName="hover:scale-105 transition-transform duration-700"
                  watermarkPosition="bottom-right"
                  watermarkOpacity={0.25}
                  watermarkSize="h-4 sm:h-5 md:h-6"
                  loading="lazy"
                />
              </div>
              <div className="pt-4 sm:pt-6 md:pt-8">
                <WatermarkImage
                  src={COMPASS_IMG}
                  alt="Travel adventure compass"
                  className="border border-white/10 h-52 sm:h-64 md:h-80"
                  imgClassName="hover:scale-105 transition-transform duration-700"
                  watermarkPosition="bottom-right"
                  watermarkOpacity={0.25}
                  loading="lazy"
                  watermarkSize="h-4 sm:h-5 md:h-6"
                />
              </div>
            </div>
            {/* Decorative gold corner */}
            <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-16 sm:h-16 border-t-2 border-l-2 border-[var(--theme-primary)]/40" />
            <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-10 h-10 sm:w-16 sm:h-16 border-b-2 border-r-2 border-[var(--theme-primary)]/40" />
          </motion.div>

          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
              We Care About Your Happiness
            </span>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              We Are Your Gateway
              <br />
              To Adventure
            </h2>
            <p className="text-white/60 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              At VANIR GROUP, we believe in the transformative power of
              travel. As avid explorers ourselves, we understand the desire
              to uncover new experiences, forge meaningful connections, and
              create lasting memories across the globe.
            </p>

            <a
              href="#destinations"
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold text-xs sm:text-sm tracking-wide hover:bg-[var(--theme-primary-light)] transition-all duration-300"
            >
              Read More
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
