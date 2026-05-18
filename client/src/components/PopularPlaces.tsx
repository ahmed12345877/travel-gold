/*
 * Design: Art Deco Luxe - Black & Gold
 * Popular Places: Grid cards with destination images, gold overlays, and watermark
 */
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import WatermarkImage from "@/components/WatermarkImage";

const EGYPT_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-egypt-YcosuhKLMYbaJ475QVrVxy.webp";
const SHARM_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-sharm-Fh2PhqqrRQGfdg6EtwXedu.webp";
const HERO_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/hero-bg-YvjFWtPTFizkPySUcokQvt.webp";

const places = [
  {
    image: EGYPT_IMG,
    name: "EGYPT",
    travelers: "174,688 Travelers",
  },
  {
    image: SHARM_IMG,
    name: "Sharm El Sheikh",
    travelers: "98,420 Travelers",
  },
  {
    image: HERO_BG,
    name: "Luxor",
    travelers: "65,320 Travelers",
  },
  {
    image:
      "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500&h=600&fit=crop",
    name: "United Kingdom",
    travelers: "174,688 Travelers",
  },
];

export default function PopularPlaces() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section
      className="py-12 sm:py-16 md:py-24 bg-[var(--theme-surface)]"
      ref={ref}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
            Trending Destinations
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Popular Places
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {places.map((place, index) => (
            <motion.div
              key={place.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <WatermarkImage
                src={place.image}
                alt={place.name}
                className="aspect-[3/4]"
                imgClassName="group-hover:scale-110 transition-transform duration-700"
                watermarkPosition="top-right"
                watermarkOpacity={0.3}
                watermarkSize="h-6 md:h-8"
                loading="lazy"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/90 via-[var(--theme-surface)]/20 to-transparent" />
                {/* Gold border on hover */}
                <div className="absolute inset-0 border border-transparent group-hover:border-[var(--theme-primary)]/50 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
                  <h3 className="font-[var(--font-display)] text-white text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 group-hover:text-[var(--theme-primary)] transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-[var(--theme-primary)]/70 text-[10px] sm:text-xs">
                    {place.travelers}
                  </p>
                </div>
              </WatermarkImage>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
