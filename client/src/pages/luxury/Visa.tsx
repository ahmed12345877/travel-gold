/*
 * Design: Art Deco Luxe - Black & Gold
 * Visa Page: Visa assistance and documentation services
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, FileText, Shield, Clock, Check, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const visaTypes = [
  {
    type: "Tourist Visa",
    duration: "Single / Multiple Entry",
    processing: "3–5 Business Days",
    validity: "30–90 Days",
    desc: "Complete e-visa application support for tourism visits to Egypt. We handle documentation, application submission, and follow-up — you simply arrive.",
    featured: true,
  },
  {
    type: "Business Visa",
    duration: "Multiple Entry",
    processing: "5–7 Business Days",
    validity: "Up to 12 Months",
    desc: "Streamlined business visa processing with dedicated corporate support for executives, delegations, and frequent business travelers.",
  },
  {
    type: "Transit Visa",
    duration: "Single Entry",
    processing: "1–3 Business Days",
    validity: "48–72 Hours",
    desc: "Fast-track transit visa processing for travelers connecting through Cairo International Airport.",
  },
  {
    type: "Residency & Long Stay",
    duration: "Extended",
    processing: "Assessed Case-by-Case",
    validity: "Up to 5 Years",
    desc: "Complex long-stay and residency permit coordination handled by our specialist legal and immigration team.",
  },
];

const steps = [
  { num: "01", title: "Submit Your Request", desc: "Complete our secure online inquiry form with your travel dates, nationality, and visa type." },
  { num: "02", title: "Document Review", desc: "Our visa specialist reviews your documentation and advises on any additional requirements within 4 hours." },
  { num: "03", title: "Application Processing", desc: "We submit and actively manage your application with the relevant authorities on your behalf." },
  { num: "04", title: "Visa Delivery", desc: "Your approved visa is delivered digitally or by courier — with full support for any follow-up requirements." },
];

export default function Visa() {
  return (
    <>
      <PageMeta
        title="Visa Assistance | VANIR GROUP"
        description="Expert visa assistance and documentation services for Egypt and beyond. Professional processing for all nationalities."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <FileText size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              The World Awaits. <span className="text-[#D4AF37]">We Handle</span> the Paperwork.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Professional visa processing and documentation services for all nationalities. From Egyptian e-visa to complex multi-country itineraries — we navigate the bureaucracy so you don't have to.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Start Visa Application <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Visa Types */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Visa <span className="text-[#D4AF37]">Categories</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visaTypes.map((v, idx) => (
              <motion.div
                key={v.type}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-zinc-900 border ${v.featured ? "border-[#D4AF37]/50" : "border-white/10"} p-8 hover:border-[#D4AF37]/60 transition-all duration-500`}
              >
                {v.featured && <div className="inline-block bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest mb-4">Most Requested</div>}
                <h3 className="text-white text-xl font-bold mb-4 font-[var(--font-display)]">{v.type}</h3>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Type", value: v.duration },
                    { label: "Processing", value: v.processing },
                    { label: "Validity", value: v.validity },
                  ].map((d) => (
                    <div key={d.label} className="text-center p-3 bg-black border border-white/10">
                      <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-1">{d.label}</div>
                      <div className="text-white text-xs font-medium">{d.value}</div>
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-5">{v.desc}</p>
                <a href="/contact" className="inline-flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-wider hover:text-white transition-colors">
                  Apply Now <ArrowRight size={12} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-zinc-950 border-y border-[#D4AF37]/20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center font-[var(--font-display)]">
            How It <span className="text-[#D4AF37]">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center">
                <div className="text-5xl font-bold text-[#D4AF37]/20 font-[var(--font-display)] mb-3">{step.num}</div>
                <h4 className="text-white font-bold mb-2">{step.title}</h4>
                <p className="text-white/50 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Your Visa. <span className="text-[#D4AF37]">Our Expertise.</span>
          </h2>
          <p className="text-white/60 mb-8">We support travelers from over 90 nationalities. Contact us with your requirements and receive a response within 4 hours.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Get Started <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
