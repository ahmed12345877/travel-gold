/*
 * Design: Art Deco Luxe - Black & Gold
 * Hotels Booking Page: Hotel reservation service
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Hotel, Star, Check, Phone, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const benefits = [
  { icon: Star, title: "Best Rate Guarantee", desc: "We negotiate exclusive rates with 500+ properties — often below any publicly available price, including official hotel websites." },
  { icon: Crown, title: "Complimentary Upgrades", desc: "As a preferred partner, we request room upgrades, early check-in, late check-out, and VIP amenities on your behalf — at no additional cost." },
  { icon: Shield, title: "Flexible Cancellations", desc: "We source the most favorable cancellation policies and manage all changes, cancellations, and modifications on your behalf." },
  { icon: Phone, title: "24/7 Concierge Link", desc: "A direct line to the hotel's VIP desk before you even arrive — your preferences, dietary needs, and special requests communicated in advance." },
];

const destinations = [
  {
    city: "Cairo",
    hotels: "120+",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&q=80",
    highlight: "From $180/night",
  },
  {
    city: "Hurghada & Red Sea",
    hotels: "85+",
    image: "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=80",
    highlight: "From $120/night",
  },
  {
    city: "Sharm El Sheikh",
    hotels: "95+",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    highlight: "From $150/night",
  },
  {
    city: "Luxor & Aswan",
    hotels: "60+",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=80",
    highlight: "From $200/night",
  },
  {
    city: "Siwa & Desert Lodges",
    hotels: "25+",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80",
    highlight: "From $350/night",
  },
  {
    city: "Alexandria",
    hotels: "40+",
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80",
    highlight: "From $140/night",
  },
];

export default function HotelsBooking() {
  return (
    <>
      <PageMeta
        title="Hotel Booking | VANIR GROUP"
        description="Premium hotel reservation service across Egypt — exclusive rates, complimentary upgrades, and VIP treatment at 500+ properties."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Hotel size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              Not Just a Room. <span className="text-[#D4AF37]">An Experience.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Hotel reservations backed by preferred partner status at Egypt's finest properties. Exclusive rates, guaranteed upgrades, and VIP recognition from the moment you arrive.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300"
            >
              Book Your Hotel <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-zinc-950 border-b border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="p-6 bg-black border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300">
                <div className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center mb-5">
                  <b.icon size={20} className="text-[#D4AF37]" />
                </div>
                <h4 className="text-white font-bold mb-2">{b.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-[var(--font-display)]">
              Our <span className="text-[#D4AF37]">Destinations</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">500+ partner properties across Egypt's most coveted destinations.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {destinations.map((dest, idx) => (
              <motion.a
                key={dest.city}
                href="/contact"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-52 overflow-hidden border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-500 block"
              >
                <img src={dest.image} alt={dest.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="text-white font-bold text-lg font-[var(--font-display)]">{dest.city}</div>
                  <div className="text-[#D4AF37] text-xs">{dest.hotels} Hotels · {dest.highlight}</div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-950 border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">
            Tell Us Where. We'll Handle <span className="text-[#D4AF37]">the Rest.</span>
          </h2>
          <p className="text-white/60 mb-8">Share your dates, destination, and preferences. Our hotel specialists will present curated options with exclusive pricing within 2 hours.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Start Your Search <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
