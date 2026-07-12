/*
 * Design: Art Deco Luxe - Black & Gold
 * MICE Page: Meetings, Incentives, Conferences & Events
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Users, Briefcase, Award, Building, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const services = [
  {
    icon: Building,
    title: "Corporate Conferences",
    description: "End-to-end management of international conferences from 50 to 5,000 delegates. Venue selection, AV production, simultaneous interpretation, and post-event analytics included.",
  },
  {
    icon: Award,
    title: "Incentive Travel Programs",
    description: "Reward your top performers with transformative Egypt and Middle East incentive journeys. We design bespoke reward experiences that inspire loyalty and elevate performance culture.",
  },
  {
    icon: Users,
    title: "Corporate Events & Galas",
    description: "Spectacular gala dinners at iconic venues — the base of the Pyramids, a Nile river cruise ship, a private desert camp. We create events your delegates will speak of for decades.",
  },
  {
    icon: Globe,
    title: "International Delegations",
    description: "Dedicated protocol officers, official meet-and-greet, diplomatic liaison, and comprehensive ground support for heads-of-state level delegations and government delegations.",
  },
  {
    icon: Briefcase,
    title: "Exhibition Management",
    description: "Full-service exhibition and trade show management: booth design, logistics, staff, lead capture systems, and dedicated translation services across 12 languages.",
  },
  {
    icon: Crown,
    title: "VIP Executive Retreats",
    description: "Ultra-exclusive C-suite retreats combining strategic off-site sessions with extraordinary Egyptian experiences. Private villas, private yachts, private access — everything private.",
  },
];

const stats = [
  { value: "500+", label: "Corporate Events Delivered" },
  { value: "50,000+", label: "Delegates Hosted" },
  { value: "40+", label: "Countries Represented" },
  { value: "98%", label: "Client Satisfaction Rate" },
];

export default function MICE() {
  return (
    <>
      <PageMeta
        title="MICE & Corporate Events | VANIR GROUP"
        description="Egypt's premier corporate events and MICE specialist — conferences, incentives, and executive retreats for global organizations."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Briefcase size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              Events That <span className="text-[#D4AF37]">Command</span> Respect
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Egypt's most trusted corporate events partner. From intimate executive retreats to large-scale international conferences — we deliver flawless, unforgettable, on-brand experiences.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Request a Proposal <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-zinc-950 border-y border-[#D4AF37]/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] font-[var(--font-display)] mb-2">{s.value}</div>
                <div className="text-white/60 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Full-Spectrum <span className="text-[#D4AF37]">MICE Services</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              A single, trusted partner for every dimension of your corporate event — from concept to conclusion.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, idx) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900 border border-white/10 hover:border-[#D4AF37]/50 p-8 transition-all duration-500 group"
              >
                <div className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
                  <svc.icon size={22} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-white text-lg font-bold mb-3 font-[var(--font-display)]">{svc.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{svc.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-950 border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Ready to <span className="text-[#D4AF37]">Elevate</span> Your Next Event?
          </h2>
          <p className="text-white/60 mb-8">
            Submit your event brief and our MICE specialists will respond with a bespoke proposal within 24 hours.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Submit Your Brief <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
