/*
 * Design: Art Deco Luxe - Black & Gold
 * Stats: Counter section with gold numbers
 */
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Users, MapPin, Award, Globe } from "lucide-react";

const stats = [
  { icon: Users, value: "15K+", label: "Happy Travelers" },
  { icon: MapPin, value: "200+", label: "Destinations" },
  { icon: Award, value: "50+", label: "Awards Won" },
  { icon: Globe, value: "30+", label: "Countries" },
];

export default function StatsSection() {
  const { ref, inView } = useInView({ threshold: 0.3 });

  return (
    <section ref={ref} className="py-10 sm:py-12 md:py-16 bg-[var(--theme-surface)] border-y border-white/5">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon size={22} className="text-[var(--theme-primary)] mx-auto mb-2 sm:mb-3 sm:w-7 sm:h-7" />
              <div className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--theme-primary)] mb-1">
                {stat.value}
              </div>
              <p className="text-white/50 text-xs sm:text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
