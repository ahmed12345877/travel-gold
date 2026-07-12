/*
 * Design: Art Deco Luxe - Black & Gold
 * Insurance Page: Premium travel insurance
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Shield, Heart, Plane, Briefcase, Phone, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const plans = [
  {
    name: "Essential",
    price: "$45",
    period: "per trip",
    desc: "Solid protection for straightforward journeys",
    features: [
      "Medical Expenses up to $100,000",
      "Trip Cancellation up to $3,000",
      "Baggage Loss up to $1,500",
      "Flight Delay Coverage",
      "24/7 Emergency Helpline",
    ],
  },
  {
    name: "Premium",
    price: "$95",
    period: "per trip",
    desc: "Comprehensive protection for the discerning traveler",
    features: [
      "Medical Expenses up to $500,000",
      "Emergency Evacuation (Unlimited)",
      "Trip Cancellation up to $10,000",
      "Baggage Loss up to $5,000",
      "Cancel for Any Reason (75% refund)",
      "Concierge Medical Assistance",
      "Adventure Activities Covered",
    ],
    featured: true,
  },
  {
    name: "Elite",
    price: "$195",
    period: "per trip",
    desc: "The pinnacle of travel protection for ultra-luxury travel",
    features: [
      "Medical Expenses (Unlimited)",
      "Emergency Evacuation (Unlimited)",
      "Trip Cancellation (Full Value)",
      "Baggage Loss up to $15,000",
      "Cancel for Any Reason (100% refund)",
      "Private Medical Concierge",
      "Private Jet Evacuation",
      "Political Evacuation Coverage",
    ],
  },
];

const coverageItems = [
  { icon: Heart, title: "Medical Emergencies", desc: "Coverage for all medical emergencies abroad, including hospital stays, surgery, and specialist consultations." },
  { icon: Plane, title: "Trip Cancellation", desc: "Full reimbursement of non-refundable travel costs if you must cancel for covered reasons." },
  { icon: Briefcase, title: "Baggage & Belongings", desc: "Protection for lost, stolen, or damaged luggage and personal effects — including high-value items." },
  { icon: Shield, title: "Emergency Evacuation", desc: "Medical air ambulance and evacuation to the nearest appropriate medical facility or home country." },
];

export default function Insurance() {
  return (
    <>
      <PageMeta
        title="Travel Insurance | VANIR GROUP"
        description="Premium travel insurance plans for luxury travelers — comprehensive medical, cancellation, and evacuation coverage."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Shield size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              Travel Boldly. <span className="text-[#D4AF37]">We've Got</span> You Covered.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Premium travel insurance designed for luxury travelers. From medical emergencies to trip cancellations — our plans provide the peace of mind your journey deserves.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Get Insured <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Choose Your <span className="text-[#D4AF37]">Protection</span>
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
                    Best Value
                  </div>
                )}
                <h3 className="text-white text-2xl font-bold mb-2 font-[var(--font-display)]">{plan.name}</h3>
                <div className="text-4xl font-bold text-white mb-1">{plan.price}</div>
                <div className="text-white/50 text-sm mb-4">{plan.period}</div>
                <p className="text-white/60 text-sm mb-6">{plan.desc}</p>
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
                  Get This Plan <ArrowRight size={14} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20 bg-zinc-950 border-y border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center font-[var(--font-display)]">
            What's <span className="text-[#D4AF37]">Covered</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverageItems.map((c, idx) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center p-6">
                <div className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-4">
                  <c.icon size={20} className="text-[#D4AF37]" />
                </div>
                <h4 className="text-white font-bold mb-2">{c.title}</h4>
                <p className="text-white/50 text-sm">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            The Unexpected Shouldn't <span className="text-[#D4AF37]">Ruin the Extraordinary</span>
          </h2>
          <p className="text-white/60 mb-8">Contact us to discuss your specific coverage needs. We can tailor any plan to match your travel profile and risk requirements.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Get a Quote <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
