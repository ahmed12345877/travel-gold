/*
 * Design: Art Deco Luxe - Black & Gold
 * Groups Page: Premium group travel services
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Users, Heart, Award, Globe, Phone, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const groupTypes = [
  {
    title: "Family Reunions",
    icon: Heart,
    desc: "Multi-generational family journeys that create shared memories to be passed down for generations. Private villas, dedicated family coordinators, and itineraries that delight every age.",
    examples: ["Private Villa Buyouts", "Intergenerational Activities", "Family Photography Sessions", "Dedicated Family Coordinator"],
    image: "https://images.unsplash.com/photo-1506377711776-dbdc2f3c20d9?w=800&q=80",
  },
  {
    title: "Private Groups",
    icon: Users,
    desc: "Friends, social circles, and private clubs traveling together in elevated style. Group discounts, coordinated logistics, and private experiences that keep your group together.",
    examples: ["Group Hotel Block Reservations", "Private Yacht Charters", "Coordinated Arrival & Departure", "Group Activity Programs"],
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  },
  {
    title: "Educational Groups",
    icon: Award,
    desc: "Academic expeditions, educational tours, and student groups with certified guides, educational programs, and safety-first protocols across all Egyptian destinations.",
    examples: ["Certified Academic Guides", "Educational Programs", "Museum & Site Access", "School Safety Protocols"],
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80",
  },
  {
    title: "Religious Pilgrimages",
    icon: Globe,
    desc: "Sacred journeys to Egypt's ancient Christian, Islamic, and Jewish heritage sites managed with deep respect, protocol expertise, and seamless organizational support.",
    examples: ["Sacred Site Access", "Protocol Coordination", "Religious Requirements Met", "Spiritual Program Design"],
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
  },
];

const stats = [
  { value: "15,000+", label: "Group Travelers Hosted" },
  { value: "200+", label: "Group Itineraries Delivered" },
  { value: "5–500", label: "Group Size Range" },
  { value: "35+", label: "Nationalities Served" },
];

export default function Groups() {
  return (
    <>
      <PageMeta
        title="Group Travel | VANIR GROUP"
        description="Premium group travel management for families, social groups, corporate groups, and educational tours across Egypt."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377711776-dbdc2f3c20d9?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Users size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              Better Together. <span className="text-[#D4AF37]">Even Better</span> in Egypt.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Group travel specialists managing every logistical detail for groups of 5 to 500. Families, social groups, corporations, and educational institutions — we deliver seamless group experiences at scale.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Plan Group Travel <ArrowRight size={16} />
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
                <div className="text-3xl font-bold text-[#D4AF37] font-[var(--font-display)] mb-2">{s.value}</div>
                <div className="text-white/60 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Group Types */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Group <span className="text-[#D4AF37]">Specializations</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groupTypes.map((g, idx) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900 border border-white/10 hover:border-[#D4AF37]/50 overflow-hidden transition-all duration-500 group"
              >
                <div className="h-48 overflow-hidden">
                  <img src={g.image} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border border-[#D4AF37]/40 flex items-center justify-center">
                      <g.icon size={18} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-white text-xl font-bold font-[var(--font-display)]">{g.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">{g.desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {g.examples.map((e) => (
                      <div key={e} className="flex items-center gap-2 text-white/60 text-xs">
                        <Check size={10} className="text-[#D4AF37] shrink-0" /> {e}
                      </div>
                    ))}
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
            Your Group. Our <span className="text-[#D4AF37]">Expertise.</span>
          </h2>
          <p className="text-white/60 mb-8">Share your group size, travel dates, and interests. Our group travel specialists will develop a comprehensive proposal within 48 hours.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Request Group Proposal <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
