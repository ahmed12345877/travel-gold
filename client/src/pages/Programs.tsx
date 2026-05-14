/*
 * Design: Art Deco Luxe - Black & Gold
 * Programs Page: Travel packages, tours, cruises, and experiences
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Ship, Mountain, Users, Heart, Compass, Camera, Clock, Star,
  ArrowRight, Check, Sparkles,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import WatermarkImage from "@/components/WatermarkImage";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8";

type Program = {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  image: string;
  duration: string;
  groupSize: string;
  priceFrom: string;
  rating: number;
  reviews: number;
  highlights: string[];
  includes: string[];
  featured?: boolean;
};

const programs: Program[] = [
  {
    id: 1,
    title: "Luxury Nile Cruise",
    subtitle: "The Ultimate Egyptian Experience",
    category: "cruises",
    description: "Sail the Nile in 5-star luxury from Luxor to Aswan, visiting ancient temples, tombs, and vibrant markets along the way.",
    image: `${CDN}/nile-cruise-deck_0c941b35.jpg`,
    duration: "5-7 Days",
    groupSize: "2-20",
    priceFrom: "$2,499",
    rating: 4.9,
    reviews: 1240,
    highlights: ["Karnak Temple", "Valley of Kings", "Edfu & Kom Ombo", "Aswan High Dam"],
    includes: ["5-Star Cabin", "All Meals", "Expert Egyptologist", "Airport Transfers"],
    featured: true,
  },
  {
    id: 2,
    title: "Classic Egypt Tour",
    subtitle: "Cairo, Luxor & Aswan",
    category: "packages",
    description: "A comprehensive 7-day journey through Egypt's greatest treasures — from the Pyramids to the temples of Upper Egypt.",
    image: `${CDN}/pyramids-giza_5a4860db.jpg`,
    duration: "7 Days",
    groupSize: "2-15",
    priceFrom: "$1,299",
    rating: 4.8,
    reviews: 2100,
    highlights: ["Pyramids of Giza", "Egyptian Museum", "Luxor Temple", "Philae Temple"],
    includes: ["4-Star Hotels", "Breakfast & Dinner", "Licensed Guide", "All Entrance Fees"],
    featured: true,
  },
  {
    id: 3,
    title: "Desert Safari Adventure",
    subtitle: "Into the Western Desert",
    category: "adventure",
    description: "Experience the magic of Egypt's Western Desert with camel rides, dune bashing, Bedouin camps, and stargazing under pristine skies.",
    image: `${CDN}/desert-safari_f88e9fa9.jpg`,
    duration: "3-4 Days",
    groupSize: "4-12",
    priceFrom: "$599",
    rating: 4.7,
    reviews: 860,
    highlights: ["Camel Trekking", "Dune Bashing", "Bedouin Camp", "Stargazing"],
    includes: ["4x4 Vehicle", "Camping Gear", "All Meals", "Professional Guide"],
  },
  {
    id: 4,
    title: "Honeymoon Paradise",
    subtitle: "Romance on the Red Sea",
    category: "honeymoon",
    description: "Celebrate love with a romantic getaway featuring private beach dinners, couple spa treatments, and sunset sailing.",
    image: `${CDN}/honeymoon-beach_4aee13b3.jpg`,
    duration: "5-7 Days",
    groupSize: "2",
    priceFrom: "$1,899",
    rating: 4.9,
    reviews: 680,
    highlights: ["Private Beach Dinner", "Couples Spa", "Sunset Sailing", "Snorkeling"],
    includes: ["5-Star Resort", "All-Inclusive", "Airport Transfers", "Romantic Setup"],
    featured: true,
  },
  {
    id: 5,
    title: "Cultural Heritage Tour",
    subtitle: "Walk Through History",
    category: "cultural",
    description: "Dive deep into Egypt's 5,000-year civilization with expert Egyptologists guiding you through temples, museums, and hidden gems.",
    image: `${CDN}/guide-karnak_e7ad9b7c.jpg`,
    duration: "10 Days",
    groupSize: "2-10",
    priceFrom: "$2,199",
    rating: 4.9,
    reviews: 540,
    highlights: ["Private Museum Tours", "Karnak Sound & Light", "Coptic Cairo", "Abu Simbel"],
    includes: ["Boutique Hotels", "All Meals", "Expert Egyptologist", "Internal Flights"],
  },
  {
    id: 6,
    title: "Family Fun Egypt",
    subtitle: "Adventures for All Ages",
    category: "family",
    description: "Kid-friendly itineraries with interactive tours, camel rides, felucca sailing, and beach time — memories the whole family will cherish.",
    image: `${CDN}/family-vacation_9d23c5a6.jpg`,
    duration: "7 Days",
    groupSize: "4-8",
    priceFrom: "$999",
    rating: 4.8,
    reviews: 920,
    highlights: ["Interactive Pyramids Tour", "Camel Ride", "Felucca Sailing", "Beach Day"],
    includes: ["Family Rooms", "Kid-Friendly Meals", "Child Guide", "All Transfers"],
  },
  {
    id: 7,
    title: "Red Sea Diving",
    subtitle: "Underwater Paradise",
    category: "adventure",
    description: "Explore the Red Sea's legendary coral reefs and marine life with PADI-certified instructors at world-class dive sites.",
    image: `${CDN}/hurghada-diving_1d5763c1.jpg`,
    duration: "5 Days",
    groupSize: "2-8",
    priceFrom: "$799",
    rating: 4.8,
    reviews: 1100,
    highlights: ["Ras Mohammed", "Thistlegorm Wreck", "Coral Gardens", "Night Diving"],
    includes: ["Dive Equipment", "Boat Trips", "PADI Instructor", "Resort Stay"],
  },
  {
    id: 8,
    title: "Historical Rome & Egypt",
    subtitle: "Two Civilizations, One Journey",
    category: "packages",
    description: "Compare the grandeur of Ancient Rome with Ancient Egypt in this unique cross-continental tour of two legendary civilizations.",
    image: `${CDN}/guide-rome_7f625e79.jpg`,
    duration: "12 Days",
    groupSize: "2-12",
    priceFrom: "$3,499",
    rating: 4.9,
    reviews: 380,
    highlights: ["Colosseum", "Vatican", "Pyramids", "Karnak Temple"],
    includes: ["4-Star Hotels", "Flights Included", "Expert Guides", "Most Meals"],
  },
  {
    id: 9,
    title: "Nile Cruise Night Experience",
    subtitle: "Cairo's Floating Dinner",
    category: "cruises",
    description: "Enjoy a magical evening on the Nile with live entertainment, gourmet dining, and stunning views of Cairo's illuminated skyline.",
    image: `${CDN}/nile-cruise-night_fb88a685.jpg`,
    duration: "1 Evening",
    groupSize: "2-50",
    priceFrom: "$149",
    rating: 4.7,
    reviews: 3200,
    highlights: ["Gourmet Dinner", "Live Music", "Belly Dancing", "Cairo Skyline"],
    includes: ["Dinner Buffet", "Entertainment", "Hotel Pickup", "Drinks Package"],
  },
];

const categories = [
  { key: "all", label: "All Programs", icon: Sparkles },
  { key: "packages", label: "Tour Packages", icon: Compass },
  { key: "cruises", label: "Nile Cruises", icon: Ship },
  { key: "adventure", label: "Adventure", icon: Mountain },
  { key: "honeymoon", label: "Honeymoon", icon: Heart },
  { key: "cultural", label: "Cultural", icon: Camera },
  { key: "family", label: "Family", icon: Users },
];

export default function Programs() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1 });
  const { ref: gridRef, inView: gridInView } = useInView({ threshold: 0.05 });

  const filtered = activeCategory === "all"
    ? programs
    : programs.filter((p) => p.category === activeCategory);

  const featured = programs.filter((p) => p.featured);

  return (
    <>
      <Navbar />
      <PageMeta
        title="Travel Programs - Packages, Cruises & Tours"
        description="Browse VANIR GROUP's curated travel programs: luxury Nile cruises, desert safaris, honeymoon packages, cultural tours, and family adventures in Egypt and beyond."
        keywords="Egypt travel packages, Nile cruise luxury, desert safari Egypt, honeymoon Egypt, cultural tours, family travel Egypt, Red Sea diving"
        canonicalPath="/programs"
      />

      <div className="min-h-screen bg-[var(--theme-background)]">
        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-28 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={`${CDN}/nile-cruise-sunset_8f287d0e.jpg`}
              alt="Nile Cruise at sunset"
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
                Curated Experiences
              </span>
              <h1 className="font-[var(--font-display)] text-3xl sm:text-2xl sm:text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Travel <span className="text-[var(--theme-primary)]">Programs</span> & Tours
              </h1>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl">
                From luxury Nile cruises to desert adventures — every program is
                meticulously crafted for an unforgettable experience.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Programs - Large Cards */}
        {activeCategory === "all" && (
          <section className="py-12 sm:py-16 md:py-20 bg-[var(--theme-background)]">
            <div className="container">
              <div className="text-center mb-12">
                <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                  Most Popular
                </span>
                <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Featured Programs
                </h2>
                <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {featured.map((prog, i) => (
                  <motion.div
                    key={prog.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="group bg-[var(--theme-background)] border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/40 transition-all duration-500"
                  >
                    <WatermarkImage
                      src={prog.image}
                      alt={prog.title}
                      className="h-64"
                      imgClassName="group-hover:scale-110 transition-transform duration-700"
                      watermarkPosition="bottom-right"
                      watermarkOpacity={0.25}
                      watermarkSize="h-6"
                      loading="lazy"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-background)] via-[var(--theme-background)]/20 to-transparent" />
                      <div className="absolute top-4 left-4 bg-[var(--theme-primary)] px-3 py-1 z-20">
                        <span className="text-[var(--theme-background)] text-xs font-bold uppercase tracking-wider">
                          Featured
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-[var(--theme-background)]/80 backdrop-blur-sm px-3 py-1 border border-[var(--theme-primary)]/30 z-20">
                        <Star size={12} className="text-[var(--theme-primary)] fill-[var(--theme-primary)]" />
                        <span className="text-[var(--theme-primary)] text-xs font-semibold">{prog.rating}</span>
                      </div>
                    </WatermarkImage>

                    <div className="p-6">
                      <span className="text-[var(--theme-primary)]/60 text-xs uppercase tracking-wider">
                        {prog.subtitle}
                      </span>
                      <h3 className="font-[var(--font-display)] text-xl font-bold text-white mt-1 mb-2 group-hover:text-[var(--theme-primary)] transition-colors">
                        {prog.title}
                      </h3>
                      <p className="text-white/50 text-sm mb-4 line-clamp-2">
                        {prog.description}
                      </p>

                      <div className="flex items-center gap-4 mb-4 text-white/40 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {prog.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {prog.groupSize} pax
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {prog.includes.map((inc) => (
                          <span key={inc} className="flex items-center gap-1 text-xs text-[var(--theme-primary)]/70">
                            <Check size={10} /> {inc}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div>
                          <span className="text-white/40 text-xs">From</span>
                          <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-xl font-bold ml-2">
                            {prog.priceFrom}
                          </span>
                          <span className="text-white/30 text-xs">/person</span>
                        </div>
                        <a
                          href="/booking"
                          className="flex items-center gap-1 text-[var(--theme-primary)] text-sm font-medium hover:underline"
                        >
                          Book Now <ArrowRight size={14} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Filter + All Programs */}
        <section ref={gridRef} className="py-16 bg-[var(--theme-background)]">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                All Programs
              </h2>
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 border ${
                      activeCategory === cat.key
                        ? "bg-[var(--theme-primary)] text-[var(--theme-background)] border-[var(--theme-primary)]"
                        : "bg-transparent text-white/60 border-white/10 hover:border-[var(--theme-primary)]/40 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <p className="text-white/40 text-sm mb-8">
              Showing {filtered.length} program{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((prog, index) => (
                <motion.div
                  key={prog.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={gridInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group bg-[var(--theme-background)] border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/40 transition-all duration-500"
                >
                  <WatermarkImage
                    src={prog.image}
                    alt={prog.title}
                    className="h-52"
                    imgClassName="group-hover:scale-110 transition-transform duration-700"
                    watermarkPosition="bottom-right"
                    watermarkOpacity={0.25}
                    watermarkSize="h-5"
                    loading="lazy"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-background)]/80 to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-[var(--theme-background)]/80 backdrop-blur-sm px-3 py-1 border border-[var(--theme-primary)]/30 z-20">
                      <Star size={12} className="text-[var(--theme-primary)] fill-[var(--theme-primary)]" />
                      <span className="text-[var(--theme-primary)] text-xs font-semibold">{prog.rating}</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm px-3 py-1 z-20">
                      <span className="text-white text-xs font-medium capitalize">
                        {prog.category}
                      </span>
                    </div>
                  </WatermarkImage>

                  <div className="p-5">
                    <span className="text-[var(--theme-primary)]/50 text-xs uppercase tracking-wider">
                      {prog.subtitle}
                    </span>
                    <h3 className="font-[var(--font-display)] text-lg font-semibold text-white mt-1 mb-2 group-hover:text-[var(--theme-primary)] transition-colors">
                      {prog.title}
                    </h3>
                    <p className="text-white/50 text-sm mb-3 line-clamp-2">
                      {prog.description}
                    </p>

                    <div className="flex items-center gap-4 mb-3 text-white/40 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {prog.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {prog.groupSize}
                      </span>
                      <span className="text-white/30">
                        {prog.reviews.toLocaleString()} reviews
                      </span>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {prog.highlights.slice(0, 3).map((h) => (
                        <span
                          key={h}
                          className="text-xs bg-white/5 text-white/50 px-2 py-0.5 border border-white/5"
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div>
                        <span className="text-white/40 text-xs">From </span>
                        <span className="text-[var(--theme-primary)] font-[var(--font-display)] text-lg font-bold">
                          {prog.priceFrom}
                        </span>
                      </div>
                    </div>

                    <a
                      href="/booking"
                      className="group/btn mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] text-sm font-medium hover:bg-[var(--theme-primary)] hover:text-[var(--theme-background)] transition-all duration-300"
                    >
                      View Details & Book
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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
              Custom Itineraries
            </span>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Need a Tailored Program?
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8">
              Our travel designers can create a bespoke itinerary matching your
              exact preferences, group size, and budget.
            </p>
            <a
              href="/booking"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-background)] font-semibold hover:bg-[var(--theme-primary-light)] transition-colors"
            >
              Request Custom Program
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
