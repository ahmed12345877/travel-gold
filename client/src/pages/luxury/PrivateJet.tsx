/*
 * Design: Art Deco Luxe - Black & Gold
 * Private Jet Page: Ultra-luxury private aviation
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Plane, Shield, Clock, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const features = [
  { icon: Plane, title: "Global Fleet Access", desc: "Light jets to ultra-long-range heavy jets — over 5,000 aircraft available across Egypt, the Middle East, Europe, and beyond." },
  { icon: Shield, title: "Safety First", desc: "Every operator is ARGUS or Wyvern certified. We never compromise on safety standards — regardless of urgency." },
  { icon: Clock, title: "On-Demand Departure", desc: "Depart when you decide. No check-in queues. No delays. Your aircraft holds its position for your exact departure time." },
  { icon: Globe, title: "Global Reach", desc: "Access to 40,000+ airports worldwide — including private strips unavailable to commercial aviation." },
  { icon: Crown, title: "White-Glove Concierge", desc: "Bespoke catering, ground transport, hotel coordination, and in-flight services — managed by your personal aviation concierge." },
  { icon: Shield, title: "Discretion Guaranteed", desc: "Absolute passenger confidentiality. Your manifest, itinerary, and travel details remain exclusively between you and us." },
];

const fleetCategories = [
  {
    name: "Very Light Jets",
    capacity: "4–6 Passengers",
    range: "Up to 2,000 km",
    example: "Phenom 300, Citation CJ4",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
    desc: "Perfect for short regional hops — Cairo to Sharm El Sheikh, or Cairo to Dubai — in supreme comfort.",
  },
  {
    name: "Midsize Jets",
    capacity: "7–9 Passengers",
    range: "Up to 4,500 km",
    example: "Citation XLS+, Hawker 900XP",
    image: "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80",
    desc: "The optimal balance of cabin comfort and range — ideal for Europe and Middle East routes.",
  },
  {
    name: "Heavy Jets",
    capacity: "10–16 Passengers",
    range: "Up to 10,000 km",
    example: "Gulfstream G550, Falcon 7X",
    image: "https://images.unsplash.com/photo-1559628233-100c798642c0?w=800&q=80",
    desc: "Full stand-up cabins, lay-flat beds, and intercontinental reach. The ultimate in private aviation.",
    featured: true,
  },
];

export default function PrivateJet() {
  return (
    <>
      <PageMeta
        title="Private Jet Charter | VANIR GROUP"
        description="Ultra-luxury private jet charter from Egypt and the Middle East. On-demand departures, global fleet access, white-glove service."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559628233-100c798642c0?w=1600&q=80')" }}
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
              The Sky is Not{" "}
              <span className="text-[#D4AF37]">The Limit</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Private jet charter for individuals and corporations who understand that time is the only non-renewable luxury. Depart on your schedule. Arrive in absolute privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
              >
                Request a Quote <ArrowRight size={16} />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-bold px-8 py-4 text-sm uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300"
              >
                Speak to Aviation Specialist
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fleet */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Choose Your <span className="text-[#D4AF37]">Aircraft</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fleetCategories.map((fleet, idx) => (
              <motion.div
                key={fleet.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className={`bg-zinc-900 border ${fleet.featured ? "border-[#D4AF37]/50" : "border-white/10"} overflow-hidden hover:border-[#D4AF37]/60 transition-all duration-500`}
              >
                {fleet.featured && (
                  <div className="bg-[#D4AF37] text-black text-xs font-bold px-4 py-2 uppercase tracking-widest text-center">
                    Most Popular
                  </div>
                )}
                <div className="h-48 overflow-hidden">
                  <img src={fleet.image} alt={fleet.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-1 font-[var(--font-display)]">{fleet.name}</h3>
                  <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-3">{fleet.example}</div>
                  <div className="flex gap-4 mb-4 text-white/60 text-xs">
                    <span>👥 {fleet.capacity}</span>
                    <span>✈️ {fleet.range}</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">{fleet.desc}</p>
                  <a href="/contact" className="w-full flex items-center justify-center gap-2 border border-[#D4AF37]/50 text-[#D4AF37] py-3 text-sm uppercase tracking-wider hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
                    Request Quote <ArrowRight size={14} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center font-[var(--font-display)]">
            Why <span className="text-[#D4AF37]">VANIR</span> Private Aviation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="flex gap-4 p-6 bg-black border border-white/10 hover:border-[#D4AF37]/30 transition-all duration-300"
              >
                <div className="shrink-0 w-10 h-10 border border-[#D4AF37]/40 flex items-center justify-center">
                  <f.icon size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">{f.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Your Aircraft is <span className="text-[#D4AF37]">Standing By</span>
          </h2>
          <p className="text-white/60 mb-8">
            Our aviation desk operates 24/7. Charter quotes within 2 hours. Departure readiness within 4 hours.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
          >
            Charter Now <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
