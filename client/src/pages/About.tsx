/*
 * Design: Art Deco Luxe - Black & Gold
 * About Page: Company history, vision, mission, values, team, and timeline
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, Target, Award, Users, Globe, Shield, Heart, Star,
  Linkedin, Twitter, Mail, ChevronRight, Compass, MapPin,
  TrendingUp, Calendar, Trophy, BadgeCheck, Medal, Crown
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import OptimizedImage from "@/components/OptimizedImage";
import PageMeta from "@/components/PageMeta";

/* ─── Image URLs ─── */
const IMAGES = {
  aboutHero: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/about-hero-2AaUoasqgiUnSNWvY9HdZm.webp",
  ceo: "/manus-storage/1000148297_a30175e7.webp",
  coo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/team-coo-5AGG89HCnmBhjQbcJ4ALq8.webp",
  marketing: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/team-marketing-b3JHQd27mnnpLURydNtbgX.webp",
  travel: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/team-travel-DWXCJxcJmzveyZdkVFafeg.webp",
  logo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png",
};

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const }
  }),
};

/* ─── Section Title Component ─── */
function SectionTitle({ subtitle, title, description, align = "center" }: {
  subtitle: string; title: string; description?: string; align?: "center" | "left";
}) {
  return (
    <div className={`mb-8 sm:mb-12 md:mb-16 ${align === "center" ? "text-center" : "text-left"}`}>
      <span className="font-[var(--font-display)] text-[var(--theme-primary)] text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase italic">
        {subtitle}
      </span>
      <h2 className="font-[var(--font-display)] text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-2 sm:mt-3 mb-3 sm:mb-4 leading-tight">
        {title}
      </h2>
      <div className="flex justify-center mt-3 sm:mt-4 mb-4 sm:mb-6">
        <div className="w-10 sm:w-16 h-[1px] bg-[var(--theme-primary)]" />
        <div className="w-2 h-2 bg-[var(--theme-primary)] rotate-45 mx-2 sm:mx-3 -mt-[3px]" />
        <div className="w-10 sm:w-16 h-[1px] bg-[var(--theme-primary)]" />
      </div>
      {description && (
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

/* ─── Hero Banner ─── */
function AboutHero() {
  return (
    <section className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <OptimizedImage src={IMAGES.aboutHero} alt="VANIR GROUP Office" className="w-full h-full object-cover" containerClassName="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-surface)]/80 via-[var(--theme-surface)]/60 to-[var(--theme-surface)]" />
      </div>
      <div className="relative z-10 text-center container">
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-[var(--font-display)] text-[var(--theme-primary)] text-sm tracking-[0.3em] uppercase italic"
        >
          Discover Our Story
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-[var(--font-display)] text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mt-3 sm:mt-4"
        >
          About Us
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-6"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex items-center justify-center gap-2 mt-6 text-white/50 text-sm"
        >
          <a href="/" className="hover:text-[var(--theme-primary)] transition-colors">Home</a>
          <ChevronRight size={14} />
          <span className="text-[var(--theme-primary)]">About Us</span>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Our Story Section ─── */
function OurStory() {
  return (
    <section className="py-12 sm:py-16 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          {/* Left: Image Collage */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.aboutHero}
                alt="VANIR GROUP Office"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-white/10" />
              {/* Watermark */}
              <div className="absolute bottom-4 right-4 opacity-30">
                <OptimizedImage src={IMAGES.logo} alt="VANIR GROUP Logo" className="h-10 w-auto" containerClassName="h-10 w-auto" lazy={true} />
              </div>
            </div>
            {/* Floating stats card */}
            <div className="absolute -bottom-6 sm:-bottom-8 -right-2 sm:-right-4 md:-right-8 bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 p-4 sm:p-6 shadow-xl">
              <div className="text-center">
                <span className="font-[var(--font-display)] text-[var(--theme-primary)] text-2xl sm:text-3xl md:text-4xl font-bold">15+</span>
                <p className="text-white/60 text-sm mt-1">Years of Excellence</p>
              </div>
            </div>
            {/* Decorative corner */}
            <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-[var(--theme-primary)]/40" />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.span variants={fadeUp} custom={0} className="font-[var(--font-display)] text-[var(--theme-primary)] text-sm tracking-[0.2em] uppercase italic">
              Our Story
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-[var(--font-display)] text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 sm:mt-3 mb-4 sm:mb-6 leading-tight">
              Crafting Unforgettable<br />Travel Experiences
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/60 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              Founded in 2010 in the heart of Cairo, VANIR GROUP began with a simple yet powerful vision: to transform the way people experience travel. What started as a small team of passionate travel enthusiasts has grown into one of Egypt's most trusted travel agencies.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-white/60 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              Over the past 15 years, we have curated thousands of bespoke travel experiences, from the ancient wonders of Egypt to the pristine beaches of the Red Sea. Our commitment to excellence and personalized service has earned us the trust of over 50,000 satisfied travelers worldwide.
            </motion.p>
            <motion.div variants={fadeUp} custom={4} className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {[
                { icon: Globe, label: "Countries Covered", value: "45+" },
                { icon: Users, label: "Happy Travelers", value: "50K+" },
                { icon: Award, label: "Awards Won", value: "28" },
                { icon: Star, label: "5-Star Reviews", value: "12K+" },
              ].map(({ icon: Icon, label, value }) => (
                        <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border border-[var(--theme-primary)]/30 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-[var(--theme-primary)]" />
                  </div>
                  <div>
                    <span className="font-[var(--font-display)] text-white text-base sm:text-lg md:text-xl font-bold">{value}</span>
                    <p className="text-white/50 text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Vision & Mission ─── */
function VisionMission() {
  const cards = [
    {
      icon: Eye,
      title: "Our Vision",
      text: "To be the leading luxury travel agency in the Middle East and North Africa, setting the gold standard for personalized travel experiences that inspire, transform, and create lifelong memories.",
      accent: "from-[var(--theme-primary)]/20 to-transparent",
    },
    {
      icon: Target,
      title: "Our Mission",
      text: "We plan for happiness. Our mission is to craft meticulously designed travel experiences that exceed expectations, combining world-class service with deep local knowledge to unlock the true essence of every destination.",
      accent: "from-[var(--theme-primary)]/20 to-transparent",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="What Drives Us"
          title="Vision & Mission"
          description="Guided by passion and driven by excellence, we strive to redefine luxury travel."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map(({ icon: Icon, title, text, accent }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={i}
              className="relative group"
            >
              <div className="bg-[#0F0F0F] border border-white/8 p-5 sm:p-7 md:p-10 h-full hover:border-[var(--theme-primary)]/40 transition-all duration-500">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accent}`} />
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border border-[var(--theme-primary)]/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[var(--theme-primary)]/10 transition-colors duration-300">
                  <Icon size={22} className="text-[var(--theme-primary)] sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-[var(--font-display)] text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{title}</h3>
                <p className="text-white/60 leading-relaxed">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Core Values ─── */
function CoreValues() {
  const values = [
    { icon: Shield, title: "Trust & Integrity", desc: "We build lasting relationships through transparency, honesty, and unwavering commitment to our promises." },
    { icon: Heart, title: "Passion for Travel", desc: "Our love for exploration drives us to discover and share the world's most extraordinary experiences." },
    { icon: Star, title: "Excellence", desc: "We pursue perfection in every detail, from itinerary planning to on-ground execution." },
    { icon: Users, title: "Client First", desc: "Every journey is tailored to our clients' unique preferences, ensuring personalized luxury at every step." },
    { icon: Globe, title: "Cultural Respect", desc: "We celebrate diversity and promote responsible tourism that honors local communities and traditions." },
    { icon: Compass, title: "Innovation", desc: "We continuously evolve our services, embracing new technologies and trends to enhance the travel experience." },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="What We Stand For"
          title="Our Core Values"
          description="The principles that guide every journey we craft and every relationship we build."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={i}
              className="group relative bg-[#0F0F0F] border border-white/5 p-5 sm:p-6 md:p-8 hover:border-[var(--theme-primary)]/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[var(--theme-primary)]/5 to-transparent" />
              <div className="w-14 h-14 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-[var(--theme-primary)] group-hover:border-[var(--theme-primary)] transition-all duration-300">
                <Icon size={24} className="text-[var(--theme-primary)] group-hover:text-[var(--theme-surface)] transition-colors duration-300" />
              </div>
              <h3 className="font-[var(--font-display)] text-white text-lg font-semibold mb-3">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Timeline ─── */
function Timeline() {
  const milestones = [
    { year: "2010", title: "The Beginning", desc: "VANIR GROUP was founded in Cairo with a vision to revolutionize luxury travel in Egypt." },
    { year: "2013", title: "Regional Expansion", desc: "Expanded services to cover the entire Middle East and North Africa region." },
    { year: "2016", title: "10,000 Travelers", desc: "Reached the milestone of serving 10,000 happy travelers from around the world." },
    { year: "2019", title: "International Recognition", desc: "Won the prestigious 'Best Luxury Travel Agency' award at the World Travel Awards." },
    { year: "2022", title: "Digital Transformation", desc: "Launched our digital platform for seamless booking and personalized travel planning." },
    { year: "2025", title: "50,000+ Travelers", desc: "Celebrated serving over 50,000 travelers with a 98% satisfaction rate." },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="Our Journey"
          title="Milestones & Achievements"
          description="A timeline of growth, innovation, and dedication to exceptional travel experiences."
        />
        <div className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[var(--theme-primary)]/40 via-[var(--theme-primary)]/20 to-transparent md:-translate-x-[0.5px]" />

          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={i * 0.5}
              className={`relative flex items-start mb-12 last:mb-0 ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-[var(--theme-primary)] rotate-45 -translate-x-[5px] md:-translate-x-[6px] mt-6 z-10" />

              {/* Content */}
              <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                <div className="bg-[#0F0F0F] border border-white/8 p-6 hover:border-[var(--theme-primary)]/30 transition-all duration-300">
                  <div className={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                    <Calendar size={14} className="text-[var(--theme-primary)]" />
                    <span className="font-[var(--font-display)] text-[var(--theme-primary)] text-xl font-bold">{m.year}</span>
                  </div>
                  <h3 className="font-[var(--font-display)] text-white text-lg font-semibold mb-2">{m.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Team Section ─── */
function TeamSection() {
  const team = [
    {
      name: "Ahmed Roshdi",
      role: "Founder & CEO",
      image: IMAGES.ceo,
      bio: "With over 20 years in the travel industry, Ahmed Roshdi founded VANIR GROUP with a passion for creating extraordinary journeys.",
    },
    {
      name: "Nadia Hassan",
      role: "Chief Operations Officer",
      image: IMAGES.coo,
      bio: "Nadia oversees all operations, ensuring every trip runs flawlessly from start to finish with her meticulous attention to detail.",
    },
    {
      name: "Karim Farouk",
      role: "Marketing Director",
      image: IMAGES.marketing,
      bio: "Karim brings creative vision to our brand, connecting travelers worldwide with the magic of Egyptian hospitality.",
    },
    {
      name: "Sara Mahmoud",
      role: "Head of Travel Planning",
      image: IMAGES.travel,
      bio: "Sara crafts personalized itineraries that transform travel dreams into reality, with deep knowledge of every destination.",
    },
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-16 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="Meet The Experts"
          title="Our Leadership Team"
          description="Passionate professionals dedicated to crafting your perfect travel experience."
        />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={i}
              className="group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative overflow-hidden mb-5">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Gold border overlay */}
                <div className="absolute inset-0 border border-white/10 group-hover:border-[var(--theme-primary)]/50 transition-all duration-500" />

                {/* Hover overlay with bio */}
                <div className={`absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/95 via-[var(--theme-surface)]/60 to-transparent flex items-end p-6 transition-opacity duration-500 ${
                  hoveredIndex === i ? "opacity-100" : "opacity-0"
                }`}>
                  <div>
                    <p className="text-white/80 text-sm leading-relaxed mb-4">{member.bio}</p>
                    <div className="flex gap-3">
                      {[Linkedin, Twitter, Mail].map((Icon, j) => (
                        <button
                          key={j}
                          className="w-8 h-8 border border-[var(--theme-primary)]/40 flex items-center justify-center text-[var(--theme-primary)]/70 hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] hover:border-[var(--theme-primary)] transition-all duration-300"
                        >
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[var(--theme-primary)]/30 group-hover:border-[var(--theme-primary)]/60 transition-all duration-500" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-[var(--theme-primary)]/30 group-hover:border-[var(--theme-primary)]/60 transition-all duration-500" />
              </div>

              <div className="text-center">
                <h3 className="font-[var(--font-display)] text-white text-lg font-semibold">{member.name}</h3>
                <p className="text-[var(--theme-primary)] text-sm mt-1">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Awards & Certifications ─── */
function AwardsSection() {
  const awards = [
    {
      icon: Trophy,
      title: "World Travel Awards",
      year: "2023",
      desc: "Best Luxury Travel Agency in Egypt — recognized for outstanding service and curated luxury experiences.",
      category: "award",
    },
    {
      icon: BadgeCheck,
      title: "IATA Accredited",
      year: "2015",
      desc: "International Air Transport Association accreditation — ensuring the highest standards in travel operations.",
      category: "certification",
    },
    {
      icon: Crown,
      title: "TripAdvisor Travelers' Choice",
      year: "2024",
      desc: "Awarded for consistently receiving outstanding reviews and being ranked in the top 10% of listings worldwide.",
      category: "award",
    },
    {
      icon: Shield,
      title: "Egyptian Tourism Authority",
      year: "2018",
      desc: "Officially licensed and certified by the Egyptian Ministry of Tourism for domestic and international tours.",
      category: "certification",
    },
    {
      icon: Medal,
      title: "Africa's Leading Tour Operator",
      year: "2022",
      desc: "Recognized at the World Travel Awards Africa ceremony for excellence in tour operations across the continent.",
      category: "award",
    },
    {
      icon: Star,
      title: "ISO 9001:2015 Certified",
      year: "2020",
      desc: "Quality Management System certification — demonstrating commitment to consistent quality and customer satisfaction.",
      category: "certification",
    },
  ];

  const [filter, setFilter] = useState<"all" | "award" | "certification">("all");
  const filtered = filter === "all" ? awards : awards.filter(a => a.category === filter);

  return (
    <section className="py-12 sm:py-16 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="Recognition & Trust"
          title="Awards & Certifications"
          description="Our commitment to excellence has been recognized by leading organizations in the global travel industry."
        />

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 flex-wrap">
          {[
            { key: "all" as const, label: "All" },
            { key: "award" as const, label: "Awards" },
            { key: "certification" as const, label: "Certifications" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold tracking-wider uppercase border transition-all duration-300 ${
                filter === key
                  ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] border-[var(--theme-primary)]"
                  : "bg-transparent text-white/60 border-white/15 hover:border-[var(--theme-primary)]/50 hover:text-[var(--theme-primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(({ icon: Icon, title, year, desc, category }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={i}
              className="group relative"
            >
              <div className="relative bg-[#0F0F0F] border border-white/8 p-5 sm:p-6 md:p-8 h-full hover:border-[var(--theme-primary)]/40 transition-all duration-500 overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)]/40 to-transparent group-hover:via-[var(--theme-primary)]/80 transition-all duration-500" />

                {/* Category badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] tracking-[0.15em] uppercase font-semibold px-3 py-1 ${
                    category === "award"
                      ? "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30"
                      : "bg-white/5 text-white/50 border border-white/10"
                  }`}>
                    {category === "award" ? "Award" : "Certification"}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border border-[var(--theme-primary)]/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[var(--theme-primary)]/10 group-hover:border-[var(--theme-primary)]/60 transition-all duration-500 rotate-45">
                  <Icon size={26} className="text-[var(--theme-primary)] -rotate-45 group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Year */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={13} className="text-[var(--theme-primary)]/60" />
                  <span className="font-[var(--font-display)] text-[var(--theme-primary)]/80 text-sm">{year}</span>
                </div>

                {/* Title */}
                <h3 className="font-[var(--font-display)] text-white text-lg font-semibold mb-3 group-hover:text-[var(--theme-primary-light)] transition-colors duration-300">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>

                {/* Decorative corner */}
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b border-r border-[var(--theme-primary)]/20 group-hover:border-[var(--theme-primary)]/50 transition-all duration-500" />

                {/* Hover glow */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--theme-primary)]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center justify-center gap-4 mt-10 sm:mt-16"
        >
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-[var(--theme-primary)]/30" />
          <Trophy size={18} className="text-[var(--theme-primary)]/40" />
          <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-[var(--theme-primary)]/30" />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Why Choose Us ─── */
function WhyChooseUs() {
  const reasons = [
    { icon: MapPin, title: "Local Expertise", desc: "Deep knowledge of Egypt and the Middle East, with insider access to hidden gems." },
    { icon: Shield, title: "Trusted & Licensed", desc: "Fully licensed and insured, with 15+ years of proven track record." },
    { icon: TrendingUp, title: "Best Value", desc: "Premium experiences at competitive prices, with no hidden fees." },
    { icon: Heart, title: "24/7 Support", desc: "Round-the-clock assistance throughout your journey, wherever you are." },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="Why VANIR GROUP"
          title="Why Choose Us"
          description="What sets us apart in the world of luxury travel."
        />
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reasons.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={i}
              className="text-center group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 border border-white/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 rotate-45 group-hover:bg-[var(--theme-primary)]/10 group-hover:border-[var(--theme-primary)]/50 transition-all duration-500">
                <Icon size={22} className="text-[var(--theme-primary)] -rotate-45 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="font-[var(--font-display)] text-white text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Banner ─── */
function CTABanner() {
  return (
    <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-r from-[var(--theme-primary)]/10 via-[var(--theme-primary)]/5 to-[var(--theme-primary)]/10 border-y border-white/10">
      <div className="container text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="font-[var(--font-display)] text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
            Let our team of experts craft the perfect travel experience for you. Contact us today and let's plan for happiness together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary-light)] transition-colors duration-300"
            >
              Contact Us
              <ChevronRight size={16} />
            </a>
            <a
              href="/#destinations"
              className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--theme-primary)] text-[var(--theme-primary)] font-semibold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all duration-300"
            >
              Explore Destinations
              <ChevronRight size={16} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Main About Page ─── */
export default function About() {
  return (
    <div className="min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="About Us - Our Story & Mission"
        description="Learn about VANIR GROUP's journey, our mission to deliver exceptional luxury travel experiences in Egypt, and the passionate team behind every curated adventure."
        keywords="about VANIR GROUP, luxury travel company Egypt, travel agency Cairo, Egypt tour operator, Ahmed Roshdi"
        canonicalPath="/about"
      />
      <SEO
        title="About Us - Our Story & Team"
        description="Learn about VANIR GROUP, Egypt's premier luxury travel agency. Meet our team, discover our mission, and explore our journey since 2018."
        keywords="VANIR GROUP about, Egypt travel agency, luxury travel team, Ahmed Roshdi"
      />
      <Navbar />
      <AboutHero />
      <OurStory />
      <VisionMission />
      <CoreValues />
      <Timeline />
      <TeamSection />
      <AwardsSection />
      <WhyChooseUs />
      <CTABanner />
      <Footer />
      <BackToTop />
    </div>
  );
}
