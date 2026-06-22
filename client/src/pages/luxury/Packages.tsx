/*
 * Design: Art Deco Luxe - Black & Gold
 * Packages Page: All-inclusive luxury travel packages
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Clock, Users, Check, Star, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const packages = [
  {
    id: 1,
    name: "Imperial Egypt",
    tagline: "The Complete Egyptian Journey",
    duration: "12 Days / 11 Nights",
    destinations: "Cairo · Luxor · Aswan · Abu Simbel",
    groupSize: "Private (2–12)",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80",
    description: "The definitive luxury Egypt experience. Twelve days that cover the full breadth of Egypt's ancient legacy — from the Pyramids of Giza to the temples of Abu Simbel — delivered in an uncompromising 5-star environment.",
    includes: [
      "5-Star Hotels Throughout",
      "Private Expert Egyptologist",
      "All Internal Flights",
      "All Meals (Curated Fine Dining)",
      "Airport Fast Track (Arrival & Departure)",
      "Luxury Ground Transport",
      "Nile Sunset Felucca",
      "24/7 Dedicated Concierge",
    ],
    priceFrom: "$8,500/person",
    rating: 5.0,
    featured: true,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Red Sea Reverie",
    tagline: "Barefoot Luxury on the Red Sea",
    duration: "7 Days / 6 Nights",
    destinations: "Hurghada · Soma Bay · Giftun Island",
    groupSize: "2–20 Guests",
    image: "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80",
    description: "Seven days of absolute Red Sea luxury. A beachfront 5-star resort, private yacht excursions to deserted islands, world-class diving or snorkeling, and sundowner cruises over crystalline waters.",
    includes: [
      "5-Star Beachfront Resort",
      "Private Yacht Full-Day Charter",
      "Snorkeling & Diving Equipment",
      "Half-Board Dining",
      "Luxury Airport Transfer",
      "Watersports Access",
    ],
    priceFrom: "$3,800/person",
    rating: 4.9,
    featured: true,
    badge: "Most Popular",
  },
  {
    id: 3,
    name: "Nile & Monuments",
    tagline: "Sailing Through 5,000 Years",
    duration: "9 Days / 8 Nights",
    destinations: "Cairo · Luxor · Nile Cruise · Aswan",
    groupSize: "Private Cabin",
    image: "https://images.unsplash.com/photo-1562059392-097958f757ca?w=800&q=80",
    description: "Begin in Cairo's grandeur, then board a 5-star Nile cruise ship and sail serenely between Luxor and Aswan — with private temple visits, Egyptologist lectures, and gourmet dining at every anchor point.",
    includes: [
      "5-Star Cairo Hotel (2 nights)",
      "5-Star Nile Cruise Ship (5 nights)",
      "5-Star Aswan Hotel (2 nights)",
      "Private Egyptologist",
      "All Temple Entrance Fees",
      "Full Board Throughout",
      "Internal Flight Cairo–Luxor",
    ],
    priceFrom: "$5,200/person",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Desert Kingdom",
    tagline: "Into Egypt's Eternal Wilderness",
    duration: "6 Days / 5 Nights",
    destinations: "Cairo · Bahariya · White Desert · Siwa",
    groupSize: "Private (2–8)",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    description: "Journey into Egypt's Western Desert — the otherworldly chalk sculptures of the White Desert, the thermal springs of Bahariya, and the oracle city of Siwa with its eco-luxury desert lodge.",
    includes: [
      "Luxury Desert Tented Camp",
      "Eco-Lodge Siwa (2 nights)",
      "Expert Desert Guide",
      "Private 4×4 Fleet",
      "All Meals",
      "Hot Springs Experience",
    ],
    priceFrom: "$3,200/person",
    rating: 4.8,
  },
  {
    id: 5,
    name: "Cairo Weekend Escape",
    tagline: "Egypt's Greatest City in 3 Days",
    duration: "3 Days / 2 Nights",
    destinations: "Cairo · Giza · Saqqara",
    groupSize: "Private",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    description: "The perfect introduction to Egypt's ancient capital. The Pyramids, the Egyptian Museum, a Nile dinner cruise, and the bazaars of Khan El-Khalili — all in a perfectly curated weekend format.",
    includes: [
      "5-Star Cairo Hotel",
      "Private Egyptologist Guide",
      "Pyramids VIP Access",
      "Nile Dinner Cruise",
      "Daily Breakfast",
      "Luxury Transfers",
    ],
    priceFrom: "$1,200/person",
    rating: 4.9,
  },
  {
    id: 6,
    name: "Grand Honeymoon",
    tagline: "Egypt's Most Romantic Journey",
    duration: "10 Days / 9 Nights",
    destinations: "Cairo · Luxor · Aswan · Red Sea",
    groupSize: "Couples (Private)",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    description: "Egypt's most romantic itinerary — ancient wonder, Nile romance, and Red Sea luxury combined into one unforgettable honeymoon journey. Every detail personalised for newlyweds.",
    includes: [
      "Honeymoon Suite Upgrades",
      "Romantic Dining Setups",
      "Couples Spa Treatments",
      "Private Felucca Sunset",
      "Flower & Gift Arrangements",
      "All Internal Flights",
    ],
    priceFrom: "$6,800/couple",
    rating: 5.0,
    badge: "Romance",
  },
];

export default function Packages() {
  return (
    <>
      <PageMeta
        title="Luxury Packages | VANIR GROUP"
        description="All-inclusive luxury Egypt travel packages — meticulously curated itineraries for high-net-worth individuals and discerning travelers."
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
              Every Detail. <span className="text-[#D4AF37]">Perfected.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              All-inclusive luxury packages crafted for those who refuse to compromise. Each package is fully private, entirely flexible, and delivered with the meticulous attention to detail VANIR is known for.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Explore Packages <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Signature <span className="text-[#D4AF37]">Packages</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">All packages are fully private and can be customized to your exact specifications.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group bg-zinc-900 border ${pkg.featured ? "border-[#D4AF37]/50" : "border-white/10"} overflow-hidden hover:border-[#D4AF37]/70 transition-all duration-500`}
              >
                {pkg.badge && (
                  <div className="bg-[#D4AF37] text-black text-xs font-bold text-center py-2 uppercase tracking-widest">
                    {pkg.badge}
                  </div>
                )}
                <div className="relative h-52 overflow-hidden">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1"><Clock size={11} /> {pkg.duration}</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {pkg.groupSize}</span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 px-2 py-1">
                    <Star size={10} className="text-[#D4AF37] fill-[#D4AF37]" />
                    <span className="text-white text-xs font-bold">{pkg.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-1">{pkg.tagline}</div>
                  <h3 className="text-white text-xl font-bold mb-2 font-[var(--font-display)]">{pkg.name}</h3>
                  <div className="flex items-center gap-1 text-white/50 text-xs mb-3"><MapPin size={11} /> {pkg.destinations}</div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{pkg.description}</p>
                  <div className="space-y-1 mb-5">
                    {pkg.includes.slice(0, 4).map((inc) => (
                      <div key={inc} className="flex items-center gap-2 text-white/60 text-xs">
                        <Check size={10} className="text-[#D4AF37] shrink-0" /> {inc}
                      </div>
                    ))}
                    {pkg.includes.length > 4 && (
                      <div className="text-[#D4AF37] text-xs ml-4">+{pkg.includes.length - 4} more inclusions</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[#D4AF37] font-bold">From {pkg.priceFrom}</span>
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

      {/* Custom CTA */}
      <section className="py-20 bg-zinc-950 border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Don't See Your <span className="text-[#D4AF37]">Dream Package?</span>
          </h2>
          <p className="text-white/60 mb-8">
            Every VANIR package can be entirely bespoke. Tell us your ideal trip — the destinations, experiences, duration, and budget — and we'll build it from scratch.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Build Your Package <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
