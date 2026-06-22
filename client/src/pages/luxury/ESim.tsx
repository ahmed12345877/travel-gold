/*
 * Design: Art Deco Luxe - Black & Gold
 * eSIM Page: Premium international connectivity
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Wifi, Globe, Smartphone, Zap, Shield, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const plans = [
  {
    name: "Explorer",
    data: "5 GB",
    validity: "7 Days",
    coverage: "Egypt Only",
    price: "$12",
    features: ["4G LTE", "Instant Activation", "No Physical SIM", "Email Support"],
  },
  {
    name: "Traveler",
    data: "15 GB",
    validity: "30 Days",
    coverage: "Egypt + 5 MENA Countries",
    price: "$29",
    features: ["4G/5G LTE", "Instant Activation", "Multi-Country Coverage", "Priority Support"],
    featured: true,
  },
  {
    name: "Elite",
    data: "50 GB",
    validity: "90 Days",
    coverage: "140+ Countries",
    price: "$79",
    features: ["5G Capable", "Instant Activation", "Global Coverage", "24/7 Concierge Support"],
  },
];

const benefits = [
  { icon: Zap, title: "Instant Activation", desc: "Your eSIM is ready before you board. Scan a QR code — connected in seconds upon landing." },
  { icon: Globe, title: "Global Coverage", desc: "Stay connected across 140+ countries with our premium carrier network partnerships." },
  { icon: Shield, title: "No Roaming Fees", desc: "Fixed pricing. No surprise bills. You pay exactly what's shown — nothing more." },
  { icon: Smartphone, title: "Device Compatible", desc: "Works with all eSIM-compatible iPhones, Samsung, Google Pixel, and more." },
];

export default function ESim() {
  return (
    <>
      <PageMeta
        title="International eSIM | VANIR GROUP"
        description="Premium international eSIM plans for luxury travelers. Instant activation, global coverage, no roaming surprises."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Wifi size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              Stay Connected. <span className="text-[#D4AF37]">Always.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Premium eSIM plans designed for the luxury traveler. Instant digital activation, 5G-capable networks, and coverage across 140+ countries — no physical SIM, no roaming fees, no compromises.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Get Your eSIM <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Choose Your <span className="text-[#D4AF37]">Plan</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className={`relative bg-zinc-900 border ${plan.featured ? "border-[#D4AF37]" : "border-white/10"} p-8 hover:border-[#D4AF37]/70 transition-all duration-500`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1 uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-4">{plan.coverage}</div>
                <h3 className="text-white text-2xl font-bold mb-2 font-[var(--font-display)]">{plan.name}</h3>
                <div className="text-4xl font-bold text-white mb-1">{plan.price}</div>
                <div className="text-white/50 text-sm mb-6">{plan.data} · {plan.validity}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                      <Check size={13} className="text-[#D4AF37] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/contact"
                  className={`w-full flex items-center justify-center gap-2 py-3 text-sm uppercase tracking-wider font-bold transition-all duration-300 ${plan.featured ? "bg-[#D4AF37] text-black hover:bg-white" : "border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"}`}
                >
                  Order Now <ArrowRight size={14} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-zinc-950 border-y border-[#D4AF37]/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center p-6">
                <div className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-4">
                  <b.icon size={20} className="text-[#D4AF37]" />
                </div>
                <h4 className="text-white font-bold mb-2">{b.title}</h4>
                <p className="text-white/50 text-sm">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Connected Before You <span className="text-[#D4AF37]">Land</span>
          </h2>
          <p className="text-white/60 mb-8">Order your eSIM at least 24 hours before departure. Receive your QR activation code via email. Scan and connect.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Order eSIM Now <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
