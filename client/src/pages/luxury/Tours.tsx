/*
 * Design: Art Deco Luxe - Black & Gold
 * Tours Page: Curated luxury tour packages
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Clock, Users, Star, MapPin, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const tours = [
  {
    id: 1,
    title: "Imperial Egypt — The Grand Tour",
    duration: "12 Days / 11 Nights",
    groupSize: "Private (2–12)",
    destinations: ["Cairo", "Luxor", "Aswan", "Abu Simbel"],
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80",
    description: "Egypt's greatest treasures assembled into one seamless, private itinerary. The Pyramids, Karnak, the Valley of the Kings, the temples of Abu Simbel — guided by one of Egypt's most respected Egyptologists.",
    includes: ["5-Star Hotels Throughout", "Private Egyptologist Guide", "All Internal Flights", "All Meals Included"],
    priceFrom: "$8,500/person",
    featured: true,
  },
  {
    id: 2,
    title: "Red Sea Luxury Escape",
    duration: "7 Days / 6 Nights",
    groupSize: "Private",
    destinations: ["Hurghada", "Soma Bay", "Giftun Island"],
    image: "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80",
    description: "A week of uncompromised Red Sea luxury — a 5-star beachfront resort, private yacht days, world-class diving, and sundowner cruises over some of the world's richest coral reefs.",
    includes: ["5-Star Resort Stay", "Private Yacht Days", "PADI Dive Course Option", "Gourmet Dining"],
    priceFrom: "$4,200/person",
    featured: true,
  },
  {
    id: 3,
    title: "Nile Luxury Cruise",
    duration: "7 Days / 6 Nights",
    groupSize: "Private Cabin",
    destinations: ["Luxor", "Edfu", "Kom Ombo", "Aswan"],
    image: "https://images.unsplash.com/photo-1562059392-097958f757ca?w=800&q=80",
    description: "Sail the world's most legendary waterway aboard a 5-star Nile cruise ship. Ancient temples glide past your private balcony as your personal Egyptologist unlocks history's greatest secrets.",
    includes: ["Private Cabin", "Egyptologist Guide", "Temple Excursions", "Full Board"],
    priceFrom: "$3,800/person",
  },
  {
    id: 4,
    title: "Desert Kingdom Discovery",
    duration: "5 Days / 4 Nights",
    groupSize: "Private (2–8)",
    destinations: ["White Desert", "Black Desert", "Siwa Oasis"],
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    description: "Into the eternal silence of Egypt's Western Desert — alien landscapes of chalk formations, boiling springs, and a Siwa Oasis stay in an eco-luxury lodge under Africa's most spectacular night sky.",
    includes: ["Luxury Desert Camps", "4×4 Private Fleet", "Expert Desert Guide", "All Meals"],
    priceFrom: "$2,900/person",
  },
  {
    id: 5,
    title: "Alexandria & The Mediterranean",
    duration: "3 Days / 2 Nights",
    groupSize: "Private",
    destinations: ["Alexandria", "El Alamein", "Marsa Matruh"],
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80",
    description: "Egypt's Mediterranean coastline — Alexandria's legendary library, El Alamein's moving WWII memorial, and the azure bays of Marsa Matruh.",
    includes: ["5-Star Coastal Hotels", "Private Guide", "Museum Entrances", "Sea Transport"],
    priceFrom: "$1,200/person",
  },
  {
    id: 6,
    title: "Sinai Sacred Journey",
    duration: "4 Days / 3 Nights",
    groupSize: "Private",
    destinations: ["Sharm El Sheikh", "St Catherine", "Dahab"],
    image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80",
    description: "Ascend Mount Sinai at sunrise, explore St Catherine's Monastery, and end in the bohemian beauty of Dahab — where the desert meets the Red Sea in spectacular fashion.",
    includes: ["Luxury Tented Camp", "Bedouin Guides", "Monastery Access", "Sunrise Summit"],
    priceFrom: "$1,800/person",
  },
];

export default function Tours() {
  return (
    <>
      <PageMeta
        title="Luxury Tours | VANIR GROUP"
        description="Private luxury tours across Egypt's most iconic destinations. Curated itineraries for high-net-worth travelers."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Crown size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              Egypt, <span className="text-[#D4AF37]">Privately</span> Yours
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Meticulously crafted private tours through the land of pharaohs. Every itinerary is bespoke, every guide is elite, and every moment is designed to exceed your highest expectations.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Plan My Tour <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Tours */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Signature <span className="text-[#D4AF37]">Itineraries</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Every tour is fully private. Every guide is certified. Every hotel is 5-star.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, idx) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group bg-zinc-900 border ${tour.featured ? "border-[#D4AF37]/50" : "border-white/10"} overflow-hidden hover:border-[#D4AF37]/60 transition-all duration-500`}
              >
                {tour.featured && (
                  <div className="bg-[#D4AF37] text-black text-xs font-bold text-center py-2 uppercase tracking-widest">
                    Signature Tour
                  </div>
                )}
                <div className="relative h-52 overflow-hidden">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1"><Clock size={11} /> {tour.duration}</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {tour.groupSize}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tour.destinations.map((d) => (
                      <span key={d} className="flex items-center gap-1 text-white/50 text-xs"><MapPin size={9} /> {d}</span>
                    ))}
                  </div>
                  <h3 className="text-white text-lg font-bold mb-3 font-[var(--font-display)]">{tour.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{tour.description}</p>
                  <div className="space-y-1 mb-5">
                    {tour.includes.map((inc) => (
                      <div key={inc} className="flex items-center gap-2 text-white/60 text-xs">
                        <Check size={10} className="text-[#D4AF37] shrink-0" /> {inc}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[#D4AF37] font-bold text-sm">From {tour.priceFrom}</span>
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
            Your Dream Egypt Tour <span className="text-[#D4AF37]">Starts Here</span>
          </h2>
          <p className="text-white/60 mb-8">Don't see exactly what you're looking for? Every tour can be customized. Tell us your vision and we'll build it around you.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Design Your Tour <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
