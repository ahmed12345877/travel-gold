/*
 * Design: Art Deco Luxe - Black & Gold
 * Activities: Cards with gold accents, carousel-like layout
 * Mobile-optimized: single column on mobile, responsive padding
 */
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Tent, Ship, Mountain } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useState } from "react";
import { toast } from "sonner";

const activities = [
  {
    icon: Tent,
    title: "Tent Camping",
    description: "Our personalized itineraries meticulously designed to cater to your personalized itineraries are meticulously crafted.",
    color: "#D4A853",
  },
  {
    icon: Mountain,
    title: "Mountain Hiking",
    description: "Our personalized itineraries meticulously designed to cater to your personalized itineraries are meticulously crafted.",
    color: "#F5E6B8",
  },
  {
    icon: Ship,
    title: "Fishing & Boat",
    description: "Our personalized itineraries meticulously designed to cater to your personalized itineraries are meticulously crafted.",
    color: "#B8860B",
  },
];

export default function ActivitiesSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <section id="activities" className="py-12 sm:py-16 md:py-24 bg-[var(--theme-surface)]" ref={ref}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 md:mb-16"
        >
          <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
            Our Best Activities
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Explore Exceptional
            <br />
            Travel Benefits
          </h2>
          <p className="text-white/50 max-w-md text-sm sm:text-base">
            Credibly harness client-centric opportunities with
            prospective bandwidth
          </p>

          {/* Navigation arrows */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              className="w-9 h-9 sm:w-10 sm:h-10 border border-[var(--theme-primary)]/40 flex items-center justify-center text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all duration-300"
            >
              <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={() => setCurrentSlide(Math.min(activities.length - 1, currentSlide + 1))}
              className="w-9 h-9 sm:w-10 sm:h-10 border border-[var(--theme-primary)]/40 flex items-center justify-center text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all duration-300"
            >
              <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </motion.div>

        {/* Activity cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.title + index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group bg-[var(--theme-surface)] border border-white/8 p-5 sm:p-6 md:p-8 hover:border-[var(--theme-primary)]/40 transition-all duration-500 relative overflow-hidden"
            >
              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-bl from-[var(--theme-primary)]/10 to-transparent" />

              <div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mb-4 sm:mb-6 border border-[var(--theme-primary)]/30"
                style={{ color: activity.color }}
              >
                <activity.icon size={24} className="sm:w-7 sm:h-7 md:w-7 md:h-7" />
              </div>

              <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                {activity.title}
              </h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                {activity.description}
              </p>

              <button
                onClick={() => toast("Feature coming soon")}
                className="group/link inline-flex items-center gap-2 text-[var(--theme-primary)] text-xs sm:text-sm font-medium hover:text-white transition-colors"
              >
                View Details
                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
