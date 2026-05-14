/*
 * Design: Art Deco Luxe - Black & Gold
 * Destinations: Cards with travel packages, gold pricing, star ratings, and watermark
 */
import { motion } from "framer-motion";
import { Star, ArrowRight, Clock } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import WatermarkImage from "@/components/WatermarkImage";

const EGYPT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-egypt-YcosuhKLMYbaJ475QVrVxy.webp";
const SHARM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-sharm-Fh2PhqqrRQGfdg6EtwXedu.webp";

const destinations = [
  {
    image: EGYPT_IMG,
    title: "Ghorepani Poon Hill Trek",
    location: "Bhutan, India, Pokhara",
    price: "$400.00",
    days: "08 days",
    rating: 4.9,
  },
  {
    image: SHARM_IMG,
    title: "Langtang Valley Trekking",
    location: "SHARM EL SHEKH, EGYPT",
    price: "$600.00",
    days: "10 days",
    rating: 4.9,
  },
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    title: "Short Trek around Pokhara",
    location: "Nepal, Pokhara, Tibet",
    price: "$300.00",
    days: "07 days",
    rating: 4.9,
  },
  {
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    title: "Island Peak Climbing",
    location: "SHARM EL SHEKH, EGYPT, Pokhara",
    price: "$200.00",
    days: "03 days",
    rating: 4.9,
  },
];

export default function DestinationsSection() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section id="destinations" className="py-12 sm:py-16 md:py-24 bg-[var(--theme-surface)]" ref={ref}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
            Popular Destinations
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Top Travel Packages
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Destination cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-[var(--theme-surface)] border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/40 transition-all duration-500"
            >
              {/* Image with watermark */}
              <WatermarkImage
                src={dest.image}
                alt={dest.title}
                className="h-44 sm:h-48 md:h-56"
                imgClassName="group-hover:scale-110 transition-transform duration-700"
                watermarkPosition="bottom-right"
                watermarkOpacity={0.3}
                watermarkSize="h-6 md:h-7"
                loading="lazy"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/80 to-transparent" />
                {/* Rating badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-[var(--theme-surface)]/80 backdrop-blur-sm px-3 py-1 border border-[var(--theme-primary)]/30 z-20">
                  <Star size={12} className="text-[var(--theme-primary)] fill-[var(--theme-primary)]" />
                  <span className="text-[var(--theme-primary)] text-xs font-semibold">{dest.rating}</span>
                </div>
              </WatermarkImage>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-[var(--font-display)] text-lg font-semibold text-white mb-2 group-hover:text-[var(--theme-primary)] transition-colors">
                  {dest.title}
                </h3>
                <p className="text-white/40 text-xs mb-4">{dest.location}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-lg font-bold">
                      {dest.price}
                    </span>
                    <span className="text-white/40 text-xs">/Person</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Clock size={12} />
                    {dest.days}
                  </div>
                </div>

                <a
                  href="/booking"
                  className="group/btn mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] text-sm font-medium hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all duration-300"
                >
                  Book Now
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
