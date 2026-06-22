/*
 * Design: Art Deco Luxe - Black & Gold
 * Day Trips Page: Curated private day excursions
 */
import { motion } from "framer-motion";
import { ArrowRight, Clock, Users, Crown, MapPin, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const trips = [
  {
    id: 1,
    title: "Private Pyramids & Sphinx at Sunrise",
    location: "Giza, Cairo",
    duration: "Full Day",
    groupSize: "Private",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80",
    description: "Beat the crowds with exclusive pre-opening access to the Giza Plateau. Your private Egyptologist narrates 4,500 years of history as the rising sun bathes the pyramids in liquid gold.",
    highlights: ["Pre-Opening VIP Access", "Private Egyptologist Guide", "Luxury Vehicle Transfer", "Camel Ride Option"],
    priceFrom: "$450/person",
    featured: true,
  },
  {
    id: 2,
    title: "Luxor Temples by Moonlight",
    location: "Luxor, Upper Egypt",
    duration: "Full Day + Evening",
    groupSize: "Private",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80",
    description: "A full-day private charter to the world's greatest open-air museum. Karnak, the Valley of Kings, and Luxor Temple by moonlight — an experience that transcends the ordinary.",
    highlights: ["Private Air Charter Available", "Valley of the Kings", "Karnak Sound & Light Show", "Nile Felucca Sundowner"],
    priceFrom: "$890/person",
    featured: true,
  },
  {
    id: 3,
    title: "Red Sea Yacht Day",
    location: "Hurghada / Soma Bay",
    duration: "Full Day",
    groupSize: "Up to 12",
    image: "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80",
    description: "Charter a private motor yacht to secluded coral reefs, vibrant snorkel spots, and deserted sandbanks. Gourmet lunch served aboard by your private chef.",
    highlights: ["Private Yacht Charter", "Snorkeling & Diving", "Chef-Prepared Lunch", "Open Bar"],
    priceFrom: "$320/person",
  },
  {
    id: 4,
    title: "Alexandria Mediterranean Escape",
    location: "Alexandria, Egypt",
    duration: "Full Day",
    groupSize: "Private",
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80",
    description: "Egypt's Mediterranean jewel — the Bibliotheca Alexandrina, the Catacombs of Kom El Shoqafa, the Montaza Palace gardens, and the freshest seafood on the continent.",
    highlights: ["Bibliotheca Alexandrina", "Royal Palaces", "Mediterranean Seafood Lunch", "Vintage Corniche Drive"],
    priceFrom: "$280/person",
  },
  {
    id: 5,
    title: "Desert Safari & Bedouin Dinner",
    location: "Western Desert, Egypt",
    duration: "Full Day",
    groupSize: "Up to 8",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    description: "Venture into the Western Desert's golden dunes by luxury 4×4. Hot springs, crystal mountains, and a traditional Bedouin dinner under a canopy of a billion stars.",
    highlights: ["Luxury 4×4 Fleet", "Hot Springs Swim", "Crystal Mountain", "Bedouin Stargazing Dinner"],
    priceFrom: "$560/person",
  },
  {
    id: 6,
    title: "Nile Felucca & Nubian Village",
    location: "Aswan, Egypt",
    duration: "Half Day",
    groupSize: "Private",
    image: "https://images.unsplash.com/photo-1562059392-097958f757ca?w=800&q=80",
    description: "Drift down the world's most legendary river on a traditional felucca sailboat, then explore a vibrant Nubian village overflowing with colour, culture, and timeless hospitality.",
    highlights: ["Private Felucca Sailing", "Nubian Village Tour", "Traditional Lunch", "Philae Temple Visit"],
    priceFrom: "$195/person",
  },
];

export default function DayTrips() {
  return (
    <>
      <PageMeta
        title="Private Day Trips | VANIR GROUP"
        description="Exclusive private day excursions across Egypt's legendary landmarks, curated for the discerning traveler."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
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
              One Day. <span className="text-[#D4AF37]">A Lifetime</span> of Memories.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Private, fully guided day excursions to Egypt's most breathtaking landmarks. Zero compromise. Maximum exclusivity.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Book a Private Trip <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Signature <span className="text-[#D4AF37]">Excursions</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Every excursion is entirely private. Every moment is designed around you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative bg-zinc-900 overflow-hidden border ${trip.featured ? "border-[#D4AF37]/50" : "border-white/10"} hover:border-[#D4AF37]/60 transition-all duration-500`}
              >
                {trip.featured && (
                  <div className="absolute top-4 left-4 z-10 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">
                    Signature
                  </div>
                )}
                <div className="relative h-52 overflow-hidden">
                  <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1"><Clock size={11} /> {trip.duration}</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {trip.groupSize}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 text-white/50 text-xs mb-2"><MapPin size={11} /> {trip.location}</div>
                  <h3 className="text-white text-lg font-bold mb-3 font-[var(--font-display)]">{trip.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">{trip.description}</p>
                  <div className="space-y-1 mb-5">
                    {trip.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-white/60 text-xs">
                        <Star size={10} className="text-[#D4AF37] fill-[#D4AF37] shrink-0" /> {h}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[#D4AF37] font-bold text-sm">From {trip.priceFrom}</span>
                    <a href="/contact" className="text-white text-xs uppercase tracking-wider hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                      Book Now <ArrowRight size={12} />
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
            Design Your <span className="text-[#D4AF37]">Perfect Day</span>
          </h2>
          <p className="text-white/60 mb-8">
            Every itinerary is bespoke. Tell us your passions — history, adventure, gastronomy — and we'll craft an unforgettable day tailored entirely to you.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Create Your Itinerary <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
