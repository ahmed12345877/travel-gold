/*
 * Design: Art Deco Luxe - Black & Gold
 * Affiliated Page: Partner companies and affiliated brands
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Globe, Shield, Star, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const affiliates = [
  {
    category: "Luxury Hotels & Resorts",
    icon: Star,
    partners: [
      { name: "Four Seasons Hotels", desc: "Preferred partner status across all Egypt and Middle East properties.", logo: "FS" },
      { name: "Oberoi Hotels & Resorts", desc: "Exclusive access to Egypt's Oberoi portfolio with VIP benefits.", logo: "OB" },
      { name: "Kempinski Hotels", desc: "Preferred corporate partner for Kempinski properties in Egypt.", logo: "KP" },
    ],
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
  },
  {
    category: "Private Aviation",
    icon: Crown,
    partners: [
      { name: "Egypt Air Private Jet", desc: "Official partner for private jet operations out of Egypt.", logo: "EA" },
      { name: "Air Charter Middle East", desc: "Regional aviation partner for Gulf and MENA routes.", logo: "AC" },
      { name: "VistaJet", desc: "Global heavy-jet access through VistaJet's worldwide fleet.", logo: "VJ" },
    ],
    image: "https://images.unsplash.com/photo-1559628233-100c798642c0?w=800&q=80",
  },
  {
    category: "Financial & Concierge",
    icon: Shield,
    partners: [
      { name: "Quintessentially", desc: "Lifestyle management and global concierge partner for HNWI clients.", logo: "QN" },
      { name: "American Express Travel", desc: "Travel finance and premium card services for elite travelers.", logo: "AX" },
      { name: "Black Card Services", desc: "Specialist financial services for ultra-high-net-worth clientele.", logo: "BC" },
    ],
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80",
  },
  {
    category: "Ground Operations",
    icon: Globe,
    partners: [
      { name: "Egypt National Tours Authority", desc: "Official partnership for licensed guide and tour operations.", logo: "EN" },
      { name: "Cairo Luxury Limousines", desc: "Exclusive provider of premium ground transport across Egypt.", logo: "CL" },
      { name: "Nile Cruise Alliance", desc: "Partnership with Egypt's premier 5-star Nile cruise operators.", logo: "NC" },
    ],
    image: "https://images.unsplash.com/photo-1562059392-097958f757ca?w=800&q=80",
  },
];

const values = [
  { title: "Shared Excellence", desc: "Every affiliated company is held to the same standard of excellence we apply to our own operations." },
  { title: "Seamless Integration", desc: "Our partnerships are operationally integrated — not just business card exchanges. You experience the difference." },
  { title: "Exclusive Access", desc: "Preferred partner status means our clients access benefits, rates, and experiences unavailable through other channels." },
  { title: "Mutual Accountability", desc: "We stand behind every affiliated partner recommendation. If something falls short, we take responsibility." },
];

export default function Affiliated() {
  return (
    <>
      <PageMeta
        title="Affiliated Partners | VANIR GROUP"
        description="VANIR GROUP's network of world-class affiliated companies spanning hotels, aviation, concierge services, and ground operations."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative py-36 flex items-center justify-center bg-black border-b border-[#D4AF37]/20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80')" }}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Globe size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              A Network Built on <span className="text-[#D4AF37]">Excellence</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              VANIR GROUP's strength lies in its ecosystem. A carefully selected network of world-class affiliated companies that share our uncompromising standards and enhance every aspect of our service.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Become a Partner <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Affiliates */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {affiliates.map((category, idx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 border border-[#D4AF37]/40 flex items-center justify-center">
                    <category.icon size={18} className="text-[#D4AF37]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-[var(--font-display)]">
                    {category.category}
                  </h2>
                  <div className="flex-1 h-px bg-[#D4AF37]/20 ml-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {category.partners.map((partner) => (
                    <div
                      key={partner.name}
                      className="bg-zinc-900 border border-white/10 hover:border-[#D4AF37]/50 p-6 transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-4 text-[#D4AF37] font-bold text-lg font-[var(--font-display)]">
                        {partner.logo}
                      </div>
                      <h4 className="text-white font-bold mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">{partner.name}</h4>
                      <p className="text-white/50 text-sm leading-relaxed">{partner.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Values */}
      <section className="py-20 bg-zinc-950 border-y border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center font-[var(--font-display)]">
            Our Partnership <span className="text-[#D4AF37]">Philosophy</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, idx) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center p-6">
                <h4 className="text-[#D4AF37] font-bold mb-3">{v.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="py-20 bg-black">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Join Our <span className="text-[#D4AF37]">Partner Network</span>
          </h2>
          <p className="text-white/60 mb-8">If your company shares our commitment to luxury, excellence, and exceptional client experiences, we'd welcome a conversation about partnership opportunities.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Discuss Partnership <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
