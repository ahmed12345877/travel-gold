/*
 * Design: Art Deco Luxe - Black & Gold
 * Hotels Page: Premium hotel collections for discerning travelers
 */
import { motion } from "framer-motion";
import { Star, MapPin, ArrowRight, Check, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const hotels = [
  {
    id: 1,
    name: "Four Seasons Nile Plaza",
    location: "Cairo, Egypt",
    stars: 5,
    category: "Urban Palace",
    description: "Commanding the Cairo skyline above the eternal Nile, the Four Seasons Nile Plaza redefines the meaning of urban grandeur. Panoramic river suites, a world-class spa, and Michelin-standard dining await.",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    priceFrom: "$850/night",
    amenities: ["Nile-View Suites", "Award-Winning Spa", "3 Fine-Dining Outlets", "Rooftop Pool"],
    featured: true,
  },
  {
    id: 2,
    name: "Oberoi Sahl Hasheesh",
    location: "Hurghada, Red Sea",
    stars: 5,
    category: "Beachfront Resort",
    description: "A private enclave of barefoot luxury nestled along a secluded Red Sea cove. All-villa architecture, direct beach access, and an adults-only atmosphere crafted for absolute serenity.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    priceFrom: "$1,200/night",
    amenities: ["Private Beach", "Infinity Pool", "Dive Center", "Butler Service"],
    featured: true,
  },
  {
    id: 3,
    name: "Sofitel Legend Old Cataract",
    location: "Aswan, Egypt",
    stars: 5,
    category: "Historic Legend",
    description: "Agatha Christie penned Death on the Nile here. Standing sentinel over the First Cataract since 1899, this legendary palace blends colonial grandeur with contemporary luxury.",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    priceFrom: "$620/night",
    amenities: ["Historic Palace Wing", "Nile Felucca Rides", "Poolside Terrace", "Egyptian Spa Rituals"],
  },
  {
    id: 4,
    name: "Kempinski Hotel Soma Bay",
    location: "Soma Bay, Red Sea",
    stars: 5,
    category: "Spa & Wellness",
    description: "A 53,000 m² Thalasso spa complex at the tip of Soma Bay peninsula — the world's premier thalassotherapy destination fused with Egyptian warmth.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    priceFrom: "$490/night",
    amenities: ["World's Largest Thalasso Spa", "7 Pools", "Watersports Center", "Golf Access"],
  },
  {
    id: 5,
    name: "Marriott Mena House",
    location: "Giza, Egypt",
    stars: 5,
    category: "Iconic Heritage",
    description: "Wake up to the Pyramids of Giza through your bedroom window. Mena House has hosted royalty and heads of state for over 140 years.",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    priceFrom: "$750/night",
    amenities: ["Pyramid-View Suites", "Historic Gardens", "Olympic Pool", "Authentic Egyptian Cuisine"],
  },
  {
    id: 6,
    name: "Conrad Cairo",
    location: "Cairo, Egypt",
    stars: 5,
    category: "Contemporary Luxury",
    description: "A beacon of modern sophistication in Egypt's capital. Sleek architecture, curated art, and a rooftop bar with unrivaled Cairo skyline views.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    priceFrom: "$380/night",
    amenities: ["Rooftop Skybar", "Executive Lounge", "Fitness Center", "Concierge Service"],
  },
];

export default function Hotels() {
  return (
    <>
      <PageMeta
        title="Luxury Hotels | VANIR GROUP"
        description="Exclusive access to Egypt's finest 5-star hotels and resort collections, curated for high-net-worth travelers."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Crown size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              Where Legends{" "}
              <span className="text-[#D4AF37]">Sleep</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Exclusive access to Egypt's most iconic 5-star hotels and private resorts — each property personally vetted, each stay an extraordinary chapter in your story.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Reserve Your Suite <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Hotel Cards */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Our <span className="text-[#D4AF37]">Curated</span> Collection
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Handpicked properties where architecture, service, and location converge in perfect harmony.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel, idx) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative bg-zinc-900 overflow-hidden border ${hotel.featured ? "border-[#D4AF37]/50" : "border-white/10"} hover:border-[#D4AF37]/70 transition-all duration-500`}
              >
                {hotel.featured && (
                  <div className="absolute top-4 left-4 z-10 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">
                    Featured
                  </div>
                )}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex gap-1">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium mb-1">{hotel.category}</div>
                  <h3 className="text-white text-xl font-bold mb-1 font-[var(--font-display)]">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-white/50 text-xs mb-3">
                    <MapPin size={12} /> {hotel.location}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">{hotel.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {hotel.amenities.map((a) => (
                      <span key={a} className="flex items-center gap-1 text-white/60 text-xs">
                        <Check size={10} className="text-[#D4AF37]" /> {a}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[#D4AF37] font-bold">From {hotel.priceFrom}</span>
                    <a href="/contact" className="text-white text-xs uppercase tracking-wider hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                      Enquire <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-950 border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Your Suite Awaits a <span className="text-[#D4AF37]">Phone Call</span>
          </h2>
          <p className="text-white/60 mb-8">
            Our hotel specialists have exclusive access to upgrades, private rates, and complimentary benefits unavailable to the public.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Speak to a Hotel Specialist <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
