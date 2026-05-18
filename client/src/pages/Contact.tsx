/*
 * Design: Art Deco Luxe - Black & Gold
 * Contact Page: Full contact page with form, map, and office info
 * Typography: Playfair Display for headings, Raleway for body, Dancing Script for accents
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/OptimizedImage";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  CheckCircle,
  User,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

import SEO from "@/components/SEO";
import PageMeta from "@/components/PageMeta";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png";

const OFFICE_LOCATION = { lat: 30.0444, lng: 31.2357 }; // Cairo, Egypt

const contactInfo = [
  {
    icon: MapPin,
    title: "Our Office",
    details: ["203 SALAHSALEEM, SET", "CAIRO, EGYPT"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@vanirgroup.com", "support@vanirgroup.com"],
    links: ["mailto:info@vanirgroup.com", "mailto:support@vanirgroup.com"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+20 112 398 8882", "+20 100 000 0000"],
    links: ["tel:+201123988882", "tel:+201000000000"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Friday: 09am - 05pm", "Saturday: 10am - 02pm"],
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSending(false);
      setSubmitted(true);
      toast.success("Your message has been sent successfully!");
    },
    onError: (error) => {
      setSending(false);
      toast.error(error.message || "Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    submitMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject || undefined,
      message: formData.message,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="Contact Us - Get in Touch"
        description="Contact VANIR GROUP for luxury Egypt travel inquiries. Reach us by phone, email, or visit our Cairo office. We're here to plan your perfect Egyptian adventure."
        keywords="contact VANIR GROUP, Egypt travel agency contact, Cairo office, travel inquiry Egypt, book consultation"
        canonicalPath="/contact"
      />
      <SEO
        title="Contact Us"
        description="Get in touch with VANIR GROUP. Book your luxury Egypt trip, ask questions, or request a custom travel itinerary."
        keywords="contact VANIR GROUP, Egypt travel booking, luxury tour inquiry"
      />
      <Navbar />

      {/* Hero Banner */}
      <section className="relative py-14 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/manus-storage/hero-contact_3d764475.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-surface)]/85 via-[var(--theme-surface)]/75 to-[var(--theme-surface)]" />
        </div>
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212,168,83,0.15) 35px, rgba(212,168,83,0.15) 36px)`,
            }}
          />
        </div>

        {/* Watermark */}
        <div className="absolute bottom-6 right-8 opacity-10 pointer-events-none">
          <OptimizedImage
            src={LOGO_URL}
            alt="VANIR Logo"
            className="h-16 w-auto"
            containerClassName="h-16 w-auto"
            lazy={true}
          />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
              Get In Touch
            </span>
            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
              Contact Us
            </h1>
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4 mb-6" />
            <p className="text-white/60 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Have a question or ready to plan your next adventure? We'd love to
              hear from you. Reach out and let us turn your travel dreams into
              reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-10 sm:py-12 md:py-16 bg-[var(--theme-surface)]">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[var(--theme-surface)] border border-white/8 p-6 text-center group hover:border-[var(--theme-primary)]/40 transition-all duration-500"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-3 sm:mb-4 flex items-center justify-center border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)] group-hover:text-[var(--theme-surface)] transition-all duration-300">
                  <item.icon
                    size={18}
                    className="sm:w-5 sm:h-5 md:w-6 md:h-6"
                  />
                </div>
                <h3 className="font-[var(--font-display)] text-white font-semibold text-sm sm:text-base md:text-lg mb-2 sm:mb-3">
                  {item.title}
                </h3>
                {item.details.map((detail, i) =>
                  item.links?.[i] ? (
                    <a
                      key={i}
                      href={item.links[i]}
                      className="block text-white/50 text-sm hover:text-[var(--theme-primary)] transition-colors leading-relaxed"
                    >
                      {detail}
                    </a>
                  ) : (
                    <p
                      key={i}
                      className="text-white/50 text-sm leading-relaxed"
                    >
                      {detail}
                    </p>
                  ),
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-[var(--theme-surface)]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Send Us A Message
              </span>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5 sm:mb-8 leading-tight">
                We'd Love To
                <br />
                Hear From You
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[var(--theme-surface)] border border-white/10 p-6 sm:p-8 md:p-12 text-center"
                >
                  <CheckCircle
                    size={64}
                    className="text-[var(--theme-primary)] mx-auto mb-6"
                  />
                  <h3 className="font-[var(--font-display)] text-2xl text-white font-bold mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-white/60 mb-6">
                    Thank you for reaching out. Our team will get back to you
                    within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold text-sm tracking-wide hover:bg-[var(--theme-primary-light)] transition-all duration-300"
                  >
                    Send Another Message
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]/50"
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name *"
                        required
                        className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[var(--theme-primary)]/60 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]/50"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your Email *"
                        required
                        className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[var(--theme-primary)]/60 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone & Subject row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]/50"
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[var(--theme-primary)]/60 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Briefcase
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]/50"
                      />
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-[var(--theme-surface)] border border-white/10 text-white pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[var(--theme-primary)]/60 transition-colors appearance-none"
                      >
                        <option value="" className="bg-[var(--theme-surface)]">
                          Select Subject
                        </option>
                        <option
                          value="general"
                          className="bg-[var(--theme-surface)]"
                        >
                          General Inquiry
                        </option>
                        <option
                          value="booking"
                          className="bg-[var(--theme-surface)]"
                        >
                          Trip Booking
                        </option>
                        <option
                          value="custom"
                          className="bg-[var(--theme-surface)]"
                        >
                          Custom Package
                        </option>
                        <option
                          value="support"
                          className="bg-[var(--theme-surface)]"
                        >
                          Customer Support
                        </option>
                        <option
                          value="partnership"
                          className="bg-[var(--theme-surface)]"
                        >
                          Partnership
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <MessageSquare
                      size={16}
                      className="absolute left-4 top-4 text-[var(--theme-primary)]/50"
                    />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your Message *"
                      required
                      rows={6}
                      className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[var(--theme-primary)]/60 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="group inline-flex items-center gap-3 px-10 py-4 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold text-sm tracking-wide hover:bg-[var(--theme-primary-light)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[var(--theme-surface)]/30 border-t-[var(--theme-surface)] rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                        <ArrowRight
                          size={16}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col"
            >
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Find Us On The Map
              </span>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5 sm:mb-8 leading-tight">
                Our Office
                <br />
                Location
              </h2>

              <div className="flex-1 min-h-[280px] sm:min-h-[350px] md:min-h-[400px] border border-white/10 overflow-hidden relative">
                <iframe
                  src="https://storage.googleapis.com/maps-solutions-c8ei8tkc1m/commutes/5wns/commutes.html"
                  width="100%"
                  height="100%"
                  style={{ border: "0", minHeight: "280px" }}
                  loading="lazy"
                  title="VANIR GROUP Office Location"
                />
                {/* Gold corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--theme-primary)]/50 pointer-events-none z-10" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--theme-primary)]/50 pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--theme-primary)]/50 pointer-events-none z-10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--theme-primary)]/50 pointer-events-none z-10" />
              </div>

              <div className="mt-6 bg-[var(--theme-surface)] border border-white/8 p-5 flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-[var(--font-display)] text-white font-semibold text-sm mb-1">
                    VANIR GROUP Headquarters
                  </h4>
                  <p className="text-white/50 text-xs">
                    203 SALAHSALEEM, SET, CAIRO, EGYPT
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ mini section */}
      <section className="py-12 sm:py-16 md:py-20 bg-[var(--theme-surface)]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
              Common Questions
            </span>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Frequently Asked
            </h2>
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "How do I book a trip with VANIR GROUP?",
                a: "You can book through our website, call us directly, or visit our Cairo office. Our team will help you customize the perfect travel package.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, bank transfers, and cash payments at our office. Flexible payment plans are also available.",
              },
              {
                q: "Can I customize my travel package?",
                a: "Absolutely! We specialize in creating personalized itineraries tailored to your preferences, budget, and travel style.",
              },
              {
                q: "What is your cancellation policy?",
                a: "Cancellation policies vary by package. Generally, free cancellation is available up to 30 days before departure. Contact us for specific details.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[var(--theme-surface)] border border-white/8 p-6 hover:border-[var(--theme-primary)]/30 transition-all duration-500"
              >
                <h3 className="font-[var(--font-display)] text-white font-semibold text-base mb-3">
                  {faq.q}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
