/*
 * Design: Art Deco Luxe - Black & Gold
 * Flights Booking Page: Premium flight booking service
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Plane, Star, Shield, Clock, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const cabinClasses = [
  {
    name: "First Class",
    desc: "The apex of commercial aviation. Private suites, flat-bed loungers, gourmet dining, and a level of personal service that borders on the extraordinary.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    features: ["Private Enclosed Suites", "Flat-Bed Seats", "Champagne & Fine Dining", "Dedicated First Class Lounges", "Priority Boarding & Deplaning"],
    featured: true,
  },
  {
    name: "Business Class",
    desc: "Arrive refreshed and ready. Fully flat beds, aisle access, premium entertainment, and curated dining — the intelligent choice for the serious traveler.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    features: ["Lie-Flat Bed", "Direct Aisle Access", "Premium Lounge Access", "Noise-Cancelling Headsets", "Express Immigration"],
  },
  {
    name: "Premium Economy",
    desc: "Substantially more space, priority service, and enhanced dining — for those who demand more than economy without the full business class investment.",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    features: ["Extra Legroom (38\")", "Premium Meal Service", "Priority Check-in", "Additional Baggage", "Enhanced Recline"],
  },
];

const services = [
  { icon: Star, title: "Exclusive Fares", desc: "Access to corporate, consolidator, and negotiated fares unavailable on public booking platforms." },
  { icon: Clock, title: "24/7 Support", desc: "A dedicated travel consultant available around the clock for changes, emergencies, and rebooking." },
  { icon: Shield, title: "Flexible Bookings", desc: "We secure the most flexible fare conditions — essential for dynamic travel schedules." },
  { icon: Crown, title: "Lounge Access", desc: "Complimentary access to premium airport lounges worldwide as part of select booking packages." },
];

export default function FlightsBooking() {
  return (
    <>
      <PageMeta
        title="Premium Flight Booking | VANIR GROUP"
        description="First class and business class flight booking with exclusive fares, 24/7 support, and white-glove travel management."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Plane size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              The Journey Begins <span className="text-[#D4AF37]">Before</span> You Land
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Premium flight booking for discerning travelers — exclusive first and business class fares, seamless connections, and a dedicated travel consultant managing every detail.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Book Your Flight <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Cabin Classes */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Travel in <span className="text-[#D4AF37]">Your Class</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cabinClasses.map((cabin, idx) => (
              <motion.div
                key={cabin.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className={`bg-zinc-900 border ${cabin.featured ? "border-[#D4AF37]/60" : "border-white/10"} overflow-hidden hover:border-[#D4AF37]/60 transition-all duration-500 group`}
              >
                {cabin.featured && (
                  <div className="bg-[#D4AF37] text-black text-xs font-bold text-center py-2 uppercase tracking-widest">
                    Our Recommendation
                  </div>
                )}
                <div className="h-48 overflow-hidden">
                  <img src={cabin.image} alt={cabin.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-3 font-[var(--font-display)]">{cabin.name}</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">{cabin.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {cabin.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-white/70 text-xs">
                        <Check size={11} className="text-[#D4AF37] shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a href="/contact" className="inline-flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-wider hover:text-white transition-colors">
                    Book This Class <ArrowRight size={12} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-zinc-950 border-y border-[#D4AF37]/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, idx) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center p-6 bg-black border border-white/10 hover:border-[#D4AF37]/30 transition-all duration-300">
                <div className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-4">
                  <s.icon size={20} className="text-[#D4AF37]" />
                </div>
                <h4 className="text-white font-bold mb-2">{s.title}</h4>
                <p className="text-white/50 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Your Seat is <span className="text-[#D4AF37]">One Call Away</span>
          </h2>
          <p className="text-white/60 mb-8">Share your travel dates and preferences. Our consultants will source the best available fares and present curated options within 2 hours.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Request Flight Options <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
