/*
 * Design: Art Deco Luxe - Black & Gold
 * CTA: Full-width banner with gold background and dark text
 * Mobile-optimized: responsive padding, text sizes, stacking
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";

export default function CTASection() {
  const { ref, inView } = useInView({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-[var(--theme-primary)] via-[#B8860B] to-[var(--theme-primary)] relative overflow-hidden"
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(10,10,10,0.1) 35px, rgba(10,10,10,0.1) 36px)`,
          }}
        />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            {/* Avatars */}
            <div className="flex -space-x-3 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
                alt="Satisfied luxury travel client"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--theme-surface)] object-cover"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
                alt="Happy traveler who booked with VANIR GROUP"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--theme-surface)] object-cover"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face"
                alt="Returning customer enjoying premium travel services"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--theme-surface)] object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-[var(--theme-surface)] font-[var(--font-display)] text-base sm:text-lg md:text-xl font-semibold max-w-md">
              Partnering with you to transform your vision into reality.
            </p>
          </div>

          <a
            href="/booking"
            className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--theme-surface)] text-[var(--theme-primary)] font-semibold text-xs sm:text-sm tracking-wide hover:bg-[var(--theme-surface)] transition-all duration-300 w-full sm:w-auto"
          >
            Book Your Trip Now
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
