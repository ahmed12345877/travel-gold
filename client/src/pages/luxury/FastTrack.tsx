/*
 * Design: Art Deco Luxe - Black & Gold
 * Fast Track Page: VIP airport fast track & transfers
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Zap, Shield, Car, Clock, Star, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const services = [
  {
    title: "VIP Meet & Greet",
    desc: "A dedicated protocol officer greets you at the aircraft steps or the first immigration counter and personally escorts you through every step of arrival.",
    icon: Star,
    features: ["Aircraft Steps or Gate Meet", "Personal Protocol Officer", "Luggage Coordination", "Available at 12+ Egyptian Airports"],
  },
  {
    title: "Fast Track Immigration",
    desc: "Bypass standard immigration queues entirely via dedicated VIP lanes. From touchdown to exit in under 20 minutes — guaranteed.",
    icon: Zap,
    features: ["Dedicated VIP Lanes", "Automated Passport Support", "Family & Group Processing", "Arrival & Departure Available"],
  },
  {
    title: "Luxury Limousine Transfer",
    desc: "A fleet of premium vehicles awaits: Mercedes S-Class, BMW 7 Series, Range Rover, and fully armoured options. Door-to-door precision.",
    icon: Car,
    features: ["Mercedes S-Class / BMW 7 Series", "Armoured Vehicles Available", "Professional Licensed Chauffeurs", "Real-Time Flight Tracking"],
  },
  {
    title: "Lounge Access",
    desc: "Exclusive access to premium airport lounges — fine dining, private shower suites, business workstations, and premium spirits.",
    icon: Crown,
    features: ["Premium Lounge Access", "Fine Dining & Open Bar", "Shower & Rest Suites", "Business Facilities"],
  },
];

export default function FastTrack() {
  return (
    <>
      <PageMeta
        title="VIP Fast Track & Airport Transfers | VANIR GROUP"
        description="VIP fast track immigration, luxury airport transfers, and meet & greet services across Egypt's major airports."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Zap size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              No Queues. <span className="text-[#D4AF37]">No Waiting.</span> Ever.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              VIP fast track immigration and luxury transfers at Egypt's major airports. Your journey begins and ends in absolute comfort — from wheels down to hotel door.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Book Fast Track <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Complete <span className="text-[#D4AF37]">VIP Airport</span> Services
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">From the moment your plane lands to the moment you arrive at your destination — we handle everything.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc, idx) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="bg-zinc-900 border border-white/10 hover:border-[#D4AF37]/50 p-8 transition-all duration-500 group"
              >
                <div className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/10 transition-colors">
                  <svc.icon size={22} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-white text-xl font-bold mb-3 font-[var(--font-display)]">{svc.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-5">{svc.desc}</p>
                <ul className="space-y-2">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                      <Check size={13} className="text-[#D4AF37] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Airports Coverage */}
      <section className="py-16 bg-zinc-950 border-y border-[#D4AF37]/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-8 font-[var(--font-display)]">Airport <span className="text-[#D4AF37]">Coverage</span></h3>
          <div className="flex flex-wrap justify-center gap-4">
            {["Cairo International (CAI)", "Hurghada International (HRG)", "Sharm El Sheikh (SSH)", "Luxor International (LXR)", "Aswan (ASW)", "Marsa Alam (RMF)", "Borg El Arab (HBE)", "El Alamein (DBB)"].map((airport) => (
              <span key={airport} className="px-4 py-2 border border-[#D4AF37]/30 text-white/70 text-sm hover:border-[#D4AF37] hover:text-white transition-all duration-300">
                {airport}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Arrive Like <span className="text-[#D4AF37]">Royalty</span>
          </h2>
          <p className="text-white/60 mb-8">Book your VIP fast track at least 48 hours in advance. Last-minute bookings accommodated subject to availability.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Reserve Now <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
