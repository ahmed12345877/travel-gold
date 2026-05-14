/*
 * Design: Art Deco Luxe - Black & Gold
 * Destinations Page: Full catalog of Egypt & international destinations
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowRight, Globe, Compass, Search } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import WatermarkImage from "@/components/WatermarkImage";

const CDN =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8";

type Destination = {
  id: number;
  name: string;
  nameAr: string;
  country: string;
  region: "egypt" | "middle-east" | "europe" | "asia";
  description: string;
  image: string;
  rating: number;
  reviews: number;
  highlights: string[];
  priceFrom: string;
  duration: string;
  featured?: boolean;
};

const destinations: Destination[] = [
  // EGYPT
  {
    id: 1,
    name: "Cairo & Giza",
    nameAr: "القاهرة والجيزة",
    country: "Egypt",
    region: "egypt",
    description:
      "Explore the Great Pyramids, the Sphinx, and the vibrant Khan El-Khalili bazaar in Egypt's iconic capital.",
    image: `${CDN}/pyramids-giza_5a4860db.jpg`,
    rating: 4.9,
    reviews: 2450,
    highlights: [
      "Pyramids of Giza",
      "Egyptian Museum",
      "Khan El-Khalili",
      "Citadel of Saladin",
    ],
    priceFrom: "$299",
    duration: "3-5 Days",
    featured: true,
  },
  {
    id: 2,
    name: "Luxor",
    nameAr: "الأقصر",
    country: "Egypt",
    region: "egypt",
    description:
      "Walk through the Valley of Kings and marvel at Karnak Temple, the world's largest ancient religious site.",
    image: `${CDN}/karnak-temple_a7b15bf3.jpg`,
    rating: 4.9,
    reviews: 1890,
    highlights: [
      "Karnak Temple",
      "Valley of Kings",
      "Hatshepsut Temple",
      "Luxor Temple",
    ],
    priceFrom: "$349",
    duration: "3-4 Days",
    featured: true,
  },
  {
    id: 3,
    name: "Aswan",
    nameAr: "أسوان",
    country: "Egypt",
    region: "egypt",
    description:
      "Sail on a felucca at sunset and visit the magnificent Philae Temple on the banks of the Nile.",
    image: `${CDN}/aswan-felucca_889a0340.jpg`,
    rating: 4.8,
    reviews: 1340,
    highlights: [
      "Philae Temple",
      "Nubian Village",
      "Felucca Sailing",
      "High Dam",
    ],
    priceFrom: "$279",
    duration: "2-3 Days",
  },
  {
    id: 4,
    name: "Sharm El Sheikh",
    nameAr: "شرم الشيخ",
    country: "Egypt",
    region: "egypt",
    description:
      "Dive into crystal-clear waters, explore coral reefs, and relax on pristine beaches.",
    image: `${CDN}/sharm-resort_a26d0b20.jpg`,
    rating: 4.7,
    reviews: 2100,
    highlights: ["Ras Mohammed", "Naama Bay", "Tiran Island", "Desert Safari"],
    priceFrom: "$399",
    duration: "5-7 Days",
  },
  {
    id: 5,
    name: "Hurghada",
    nameAr: "الغردقة",
    country: "Egypt",
    region: "egypt",
    description:
      "Experience world-class diving and snorkeling in the Red Sea's most vibrant coral gardens.",
    image: `${CDN}/hurghada-coral_0efb5bb7.jpg`,
    rating: 4.6,
    reviews: 1780,
    highlights: [
      "Giftun Island",
      "Coral Reefs",
      "Desert Safari",
      "Marina Boulevard",
    ],
    priceFrom: "$349",
    duration: "5-7 Days",
  },
  {
    id: 6,
    name: "Alexandria",
    nameAr: "الإسكندرية",
    country: "Egypt",
    region: "egypt",
    description:
      "Discover the Mediterranean charm of Egypt's second city, from the Citadel to the legendary Library.",
    image: `${CDN}/alex-citadel_a3ce57f5.jpg`,
    rating: 4.7,
    reviews: 980,
    highlights: [
      "Qaitbay Citadel",
      "Bibliotheca",
      "Corniche",
      "Montazah Palace",
    ],
    priceFrom: "$199",
    duration: "2-3 Days",
  },
  {
    id: 7,
    name: "Siwa Oasis",
    nameAr: "واحة سيوة",
    country: "Egypt",
    region: "egypt",
    description:
      "Escape to the Western Desert's hidden gem with salt lakes, ancient ruins, and starlit skies.",
    image: `${CDN}/siwa-oasis_db3b7653.jpg`,
    rating: 4.8,
    reviews: 620,
    highlights: [
      "Salt Lakes",
      "Oracle Temple",
      "Desert Camping",
      "Hot Springs",
    ],
    priceFrom: "$249",
    duration: "3-4 Days",
  },
  // MIDDLE EAST
  {
    id: 8,
    name: "Dubai",
    nameAr: "دبي",
    country: "UAE",
    region: "middle-east",
    description:
      "Experience the ultimate luxury in the city of superlatives — from Burj Khalifa to desert adventures.",
    image: `${CDN}/dubai-skyline_653097dc.jpg`,
    rating: 4.8,
    reviews: 3200,
    highlights: [
      "Burj Khalifa",
      "Dubai Mall",
      "Desert Safari",
      "Palm Jumeirah",
    ],
    priceFrom: "$599",
    duration: "4-6 Days",
    featured: true,
  },
  {
    id: 9,
    name: "Istanbul",
    nameAr: "إسطنبول",
    country: "Turkey",
    region: "middle-east",
    description:
      "Where East meets West — explore the Hagia Sophia, Blue Mosque, and the Grand Bazaar.",
    image: `${CDN}/istanbul-hagia_0ac16b7c.jpg`,
    rating: 4.8,
    reviews: 2800,
    highlights: [
      "Hagia Sophia",
      "Blue Mosque",
      "Grand Bazaar",
      "Bosphorus Cruise",
    ],
    priceFrom: "$449",
    duration: "4-5 Days",
  },
  // EUROPE
  {
    id: 10,
    name: "Paris",
    nameAr: "باريس",
    country: "France",
    region: "europe",
    description:
      "The City of Light awaits — from the Eiffel Tower to Montmartre, romance fills every corner.",
    image: `${CDN}/paris-eiffel_ed23fdbb.jpg`,
    rating: 4.9,
    reviews: 4100,
    highlights: [
      "Eiffel Tower",
      "Louvre Museum",
      "Champs-Élysées",
      "Versailles",
    ],
    priceFrom: "$699",
    duration: "5-7 Days",
    featured: true,
  },
  {
    id: 11,
    name: "Santorini",
    nameAr: "سانتوريني",
    country: "Greece",
    region: "europe",
    description:
      "Blue domes, white-washed villages, and breathtaking sunsets over the Aegean Sea.",
    image: `${CDN}/santorini-sunset_1eed46d1.jpg`,
    rating: 4.9,
    reviews: 2600,
    highlights: [
      "Oia Sunset",
      "Caldera Views",
      "Wine Tasting",
      "Black Sand Beach",
    ],
    priceFrom: "$749",
    duration: "4-6 Days",
  },
  // ASIA
  {
    id: 12,
    name: "Bali",
    nameAr: "بالي",
    country: "Indonesia",
    region: "asia",
    description:
      "Tropical paradise with ancient temples, lush rice terraces, and world-class surfing.",
    image: `${CDN}/bali-terrace_4a2b5d41.jpg`,
    rating: 4.8,
    reviews: 3500,
    highlights: [
      "Ubud Temples",
      "Rice Terraces",
      "Beach Clubs",
      "Volcano Trekking",
    ],
    priceFrom: "$549",
    duration: "5-7 Days",
  },
  {
    id: 13,
    name: "Maldives",
    nameAr: "المالديف",
    country: "Maldives",
    region: "asia",
    description:
      "Overwater villas, turquoise lagoons, and the ultimate luxury island escape.",
    image: `${CDN}/maldives-villa_d8294f66.jpg`,
    rating: 4.9,
    reviews: 1900,
    highlights: [
      "Overwater Villas",
      "Snorkeling",
      "Spa Retreats",
      "Sunset Cruises",
    ],
    priceFrom: "$1,299",
    duration: "5-7 Days",
    featured: true,
  },
  {
    id: 14,
    name: "Thailand",
    nameAr: "تايلاند",
    country: "Thailand",
    region: "asia",
    description:
      "From Bangkok's temples to Phi Phi's turquoise waters — adventure and serenity combined.",
    image: `${CDN}/thailand-boat_0ece2c45.jpg`,
    rating: 4.7,
    reviews: 2900,
    highlights: [
      "Grand Palace",
      "Phi Phi Islands",
      "Chiang Mai",
      "Street Food",
    ],
    priceFrom: "$499",
    duration: "5-7 Days",
  },
  {
    id: 15,
    name: "Tokyo",
    nameAr: "طوكيو",
    country: "Japan",
    region: "asia",
    description:
      "A mesmerizing blend of ultra-modern technology and ancient traditions in Japan's capital.",
    image: `${CDN}/tokyo-night_5f9fb74c.jpg`,
    rating: 4.8,
    reviews: 2200,
    highlights: [
      "Shibuya Crossing",
      "Senso-ji Temple",
      "Mt. Fuji",
      "Akihabara",
    ],
    priceFrom: "$799",
    duration: "5-7 Days",
  },
];

const regions = [
  { key: "all", label: "All Destinations", icon: Globe },
  { key: "egypt", label: "Egypt", icon: Compass },
  { key: "middle-east", label: "Middle East", icon: MapPin },
  { key: "europe", label: "Europe", icon: MapPin },
  { key: "asia", label: "Asia", icon: MapPin },
];

export default function Destinations() {
  const [activeRegion, setActiveRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1 });
  const { ref: gridRef, inView: gridInView } = useInView({ threshold: 0.05 });

  const filtered = destinations.filter((d) => {
    const matchRegion = activeRegion === "all" || d.region === activeRegion;
    const matchSearch =
      searchQuery === "" ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.nameAr.includes(searchQuery);
    return matchRegion && matchSearch;
  });

  const featured = destinations.filter((d) => d.featured);

  return (
    <>
      <Navbar />
      <PageMeta
        title="Destinations - Explore Egypt & the World"
        description="Discover Egypt's most stunning destinations and international travel packages with VANIR GROUP. From the Pyramids of Giza to Maldives, Santorini, and Bali."
        keywords="Egypt destinations, Cairo tours, Luxor temples, Aswan, Sharm El Sheikh, Red Sea diving, Dubai, Maldives, Santorini, Bali, international travel"
        canonicalPath="/destinations"
      />

      <div className="min-h-screen bg-[var(--theme-background)]">
        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-28 pb-20 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={`${CDN}/pyramids-aerial_99a2dee6.jpg`}
              alt="Egypt aerial view"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-background)]/80 via-[var(--theme-background)]/60 to-[var(--theme-background)]" />
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Explore the World
              </span>
              <h1 className="font-[var(--font-display)] text-3xl sm:text-2xl sm:text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Discover Extraordinary{" "}
                <span className="text-[var(--theme-primary)]">
                  Destinations
                </span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl mb-8">
                From the ancient wonders of Egypt to the world's most
                breathtaking locations — curated luxury experiences await you.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
                />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-8 mt-12"
            >
              {[
                { value: "15+", label: "Destinations" },
                { value: "4", label: "Continents" },
                { value: "5,000+", label: "Happy Travelers" },
                { value: "4.8", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="font-[var(--font-display)] text-2xl md:text-3xl font-bold text-[var(--theme-primary)]">
                    {stat.value}
                  </span>
                  <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Destinations */}
        {searchQuery === "" && activeRegion === "all" && (
          <section className="py-12 sm:py-16 md:py-20 bg-[var(--theme-background)]">
            <div className="container">
              <div className="text-center mb-12">
                <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                  Handpicked for You
                </span>
                <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Featured Destinations
                </h2>
                <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.slice(0, 3).map((dest, i) => (
                  <motion.a
                    key={dest.id}
                    href="/booking"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className={`group relative overflow-hidden ${
                      i === 0 ? "md:col-span-2 md:row-span-2" : ""
                    }`}
                  >
                    <WatermarkImage
                      src={dest.image}
                      alt={dest.name}
                      className={i === 0 ? "h-[500px]" : "h-[240px]"}
                      imgClassName="group-hover:scale-110 transition-transform duration-700"
                      watermarkPosition="bottom-right"
                      watermarkOpacity={0.25}
                      watermarkSize="h-6"
                      loading="lazy"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-background)] via-[var(--theme-background)]/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin
                            size={14}
                            className="text-[var(--theme-primary)]"
                          />
                          <span className="text-white/60 text-xs uppercase tracking-wider">
                            {dest.country}
                          </span>
                        </div>
                        <h3 className="font-[var(--font-display)] text-xl md:text-2xl font-bold text-white group-hover:text-[var(--theme-primary)] transition-colors">
                          {dest.name}
                        </h3>
                        <p className="text-white/50 text-sm mt-1 line-clamp-2">
                          {dest.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-lg font-bold">
                            From {dest.priceFrom}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star
                              size={14}
                              className="text-[var(--theme-primary)] fill-[var(--theme-primary)]"
                            />
                            <span className="text-white/70 text-sm">
                              {dest.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </WatermarkImage>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Region Filter */}
        <section ref={gridRef} className="py-16 bg-[var(--theme-background)]">
          <div className="container">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {regions.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.key}
                    onClick={() => setActiveRegion(r.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 border ${
                      activeRegion === r.key
                        ? "bg-[var(--theme-primary)] text-[var(--theme-background)] border-[var(--theme-primary)]"
                        : "bg-transparent text-white/60 border-white/10 hover:border-[var(--theme-primary)]/40 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Results count */}
            <p className="text-white/40 text-sm mb-8">
              Showing {filtered.length} destination
              {filtered.length !== 1 ? "s" : ""}
              {activeRegion !== "all" && (
                <span>
                  {" "}
                  in{" "}
                  <span className="text-[var(--theme-primary)]">
                    {regions.find((r) => r.key === activeRegion)?.label}
                  </span>
                </span>
              )}
              {searchQuery && (
                <span>
                  {" "}
                  matching &quot;
                  <span className="text-[var(--theme-primary)]">
                    {searchQuery}
                  </span>
                  &quot;
                </span>
              )}
            </p>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={gridInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group bg-[var(--theme-background)] border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/40 transition-all duration-500"
                >
                  {/* Image */}
                  <WatermarkImage
                    src={dest.image}
                    alt={dest.name}
                    className="h-56"
                    imgClassName="group-hover:scale-110 transition-transform duration-700"
                    watermarkPosition="bottom-right"
                    watermarkOpacity={0.25}
                    watermarkSize="h-5"
                    loading="lazy"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-background)]/80 to-transparent" />
                    {/* Rating badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-[var(--theme-background)]/80 backdrop-blur-sm px-3 py-1 border border-[var(--theme-primary)]/30 z-20">
                      <Star
                        size={12}
                        className="text-[var(--theme-primary)] fill-[var(--theme-primary)]"
                      />
                      <span className="text-[var(--theme-primary)] text-xs font-semibold">
                        {dest.rating}
                      </span>
                    </div>
                    {/* Region badge */}
                    <div className="absolute top-4 right-4 bg-[var(--theme-primary)]/20 backdrop-blur-sm px-3 py-1 z-20">
                      <span className="text-[var(--theme-primary)] text-xs font-medium uppercase tracking-wider">
                        {dest.country}
                      </span>
                    </div>
                  </WatermarkImage>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-[var(--font-display)] text-lg font-semibold text-white group-hover:text-[var(--theme-primary)] transition-colors">
                          {dest.name}
                        </h3>
                        <span className="text-white/30 text-xs">
                          {dest.nameAr}
                        </span>
                      </div>
                      <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-lg font-bold">
                        {dest.priceFrom}
                      </span>
                    </div>

                    <p className="text-white/50 text-sm mb-4 line-clamp-2">
                      {dest.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dest.highlights.slice(0, 3).map((h) => (
                        <span
                          key={h}
                          className="text-xs bg-white/5 text-white/50 px-2.5 py-1 border border-white/5"
                        >
                          {h}
                        </span>
                      ))}
                      {dest.highlights.length > 3 && (
                        <span className="text-xs text-[var(--theme-primary)]/60 px-2 py-1">
                          +{dest.highlights.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <MapPin size={12} />
                        {dest.duration}
                      </div>
                      <span className="text-white/30 text-xs">
                        {dest.reviews.toLocaleString()} reviews
                      </span>
                    </div>

                    <a
                      href="/booking"
                      className="group/btn mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] text-sm font-medium hover:bg-[var(--theme-primary)] hover:text-[var(--theme-background)] transition-all duration-300"
                    >
                      Explore & Book
                      <ArrowRight
                        size={14}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <Compass size={48} className="text-white/20 mx-auto mb-4" />
                <h3 className="font-[var(--font-display)] text-xl text-white/60 mb-2">
                  No destinations found
                </h3>
                <p className="text-white/30 text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-[var(--theme-background)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 35px, #D4A853 35px, #D4A853 36px)",
              }}
            />
          </div>
          <div className="container relative z-10 text-center">
            <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
              Can&apos;t Find What You&apos;re Looking For?
            </span>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Let Us Plan Your Perfect Trip
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8">
              Our travel experts can create a custom itinerary tailored to your
              preferences, budget, and travel style.
            </p>
            <a
              href="/booking"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-background)] font-semibold hover:bg-[var(--theme-primary-light)] transition-colors"
            >
              Contact Our Experts
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
