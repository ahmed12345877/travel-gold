/*
 * Design: Art Deco Luxe - Black & Gold
 * Vanir Page: Company overview, story, team, values, and global presence
 */
import { motion } from "framer-motion";
import {
  Award,
  Globe,
  Users,
  TrendingUp,
  Shield,
  Heart,
  Star,
  MapPin,
  ArrowRight,
  Building2,
  Briefcase,
  Gem,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import WatermarkImage from "@/components/WatermarkImage";

const CDN =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8";

export default function Vanir() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1 });
  const { ref: storyRef, inView: storyInView } = useInView({ threshold: 0.1 });
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.1 });
  const { ref: valuesRef, inView: valuesInView } = useInView({
    threshold: 0.1,
  });
  const { ref: officesRef, inView: officesInView } = useInView({
    threshold: 0.1,
  });

  const values = [
    {
      icon: Gem,
      title: "Excellence",
      description:
        "We pursue the highest standards in every service, ensuring each traveler receives an exceptional experience.",
    },
    {
      icon: Heart,
      title: "Passion",
      description:
        "Our love for travel and culture drives us to create journeys that inspire and transform.",
    },
    {
      icon: Shield,
      title: "Trust",
      description:
        "Built on decades of reliability, we are trusted by thousands of travelers and partners worldwide.",
    },
    {
      icon: Globe,
      title: "Heritage",
      description:
        "We blend Egypt's rich cultural heritage with modern luxury to create truly unique experiences.",
    },
  ];

  const milestones = [
    { year: "1995", event: "Founded in Cairo as a boutique travel agency" },
    { year: "2002", event: "Expanded to Luxor and Sharm El Sheikh offices" },
    { year: "2008", event: "Launched luxury Nile cruise partnerships" },
    { year: "2014", event: "Opened Dubai and Istanbul branches" },
    { year: "2019", event: "Reached 50,000+ satisfied travelers milestone" },
    { year: "2023", event: "Launched AI-powered travel planning platform" },
    { year: "2025", event: "Expanded to 15+ international destinations" },
  ];

  const offices = [
    {
      city: "Cairo",
      country: "Egypt",
      role: "Global Headquarters",
      flag: "🇪🇬",
    },
    {
      city: "Luxor",
      country: "Egypt",
      role: "Upper Egypt Operations",
      flag: "🇪🇬",
    },
    {
      city: "Sharm El Sheikh",
      country: "Egypt",
      role: "Red Sea Division",
      flag: "🇪🇬",
    },
    { city: "Dubai", country: "UAE", role: "Gulf Region Office", flag: "🇦🇪" },
    {
      city: "Istanbul",
      country: "Turkey",
      role: "Europe & Turkey Office",
      flag: "🇹🇷",
    },
    {
      city: "Riyadh",
      country: "Saudi Arabia",
      role: "KSA Operations",
      flag: "🇸🇦",
    },
  ];

  const affiliates = [
    {
      name: "VANIR Hotels & Resorts",
      desc: "Luxury hospitality management",
      icon: Building2,
    },
    {
      name: "VANIR Aviation",
      desc: "Private jet charter services",
      icon: Briefcase,
    },
    {
      name: "VANIR Events",
      desc: "MICE & corporate event planning",
      icon: Users,
    },
    {
      name: "VANIR Digital",
      desc: "AI-powered travel technology",
      icon: TrendingUp,
    },
  ];

  return (
    <>
      <Navbar />
      <PageMeta
        title="VANIR GROUP - Our Story, Values & Global Presence"
        description="Discover VANIR GROUP's journey from a Cairo boutique agency to a leading luxury travel company. Explore our values, global offices, affiliated companies, and vision."
        keywords="VANIR GROUP company, luxury travel Egypt, travel agency Cairo, international travel company, Egypt tourism leader"
        canonicalPath="/vanir"
      />

      <div className="min-h-screen bg-[var(--theme-background)]">
        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-28 pb-24 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={`${CDN}/luxury-agency_f12d8ad7.jpg`}
              alt="VANIR GROUP luxury travel"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-background)]/85 via-[var(--theme-background)]/60 to-[var(--theme-background)]" />
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Since 1995
              </span>
              <h1 className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                About{" "}
                <span className="text-[var(--theme-primary)]">VANIR GROUP</span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl">
                From a boutique Cairo agency to a leading luxury travel company
                — crafting extraordinary journeys across Egypt and the world for
                nearly three decades.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story */}
        <section ref={storyRef} className="py-20 bg-[var(--theme-background)]">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={storyInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7 }}
                className="lg:w-1/2"
              >
                <WatermarkImage
                  src={`${CDN}/office-meeting_d934f6c0.png`}
                  alt="VANIR GROUP team"
                  className="h-[400px] lg:h-[500px]"
                  watermarkPosition="bottom-right"
                  watermarkOpacity={0.25}
                  watermarkSize="h-7"
                  loading="lazy"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-background)]/40 to-transparent" />
                </WatermarkImage>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={storyInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:w-1/2"
              >
                <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                  Our Story
                </span>
                <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-white mb-6">
                  A Legacy of Luxury Travel
                </h2>
                <div className="space-y-4 text-white/60 text-sm leading-relaxed">
                  <p>
                    Founded in 1995 in the heart of Cairo, VANIR GROUP began as
                    a small travel agency with a big vision: to showcase Egypt's
                    timeless wonders through the lens of luxury and authentic
                    cultural immersion.
                  </p>
                  <p>
                    Over nearly three decades, we have grown from a local
                    operation into a regional powerhouse with offices across
                    Egypt, the UAE, Turkey, and Saudi Arabia. Our team of over
                    200 travel professionals speaks 8 languages and serves
                    travelers from more than 50 countries.
                  </p>
                  <p>
                    Today, VANIR GROUP is recognized as one of the Middle East's
                    premier luxury travel companies, combining cutting-edge
                    technology with deep cultural expertise to create journeys
                    that are as enriching as they are unforgettable.
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 mt-8">
                  {[
                    { value: "200+", label: "Team Members" },
                    { value: "8", label: "Languages" },
                    { value: "50+", label: "Countries Served" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <span className="font-[var(--font-display)] text-2xl font-bold text-[var(--theme-primary)]">
                        {stat.value}
                      </span>
                      <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section
          ref={statsRef}
          className="py-16 bg-[var(--theme-background)] border-y border-white/5"
        >
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "30+", label: "Years of Excellence", icon: Award },
                { value: "50,000+", label: "Happy Travelers", icon: Users },
                { value: "15+", label: "Destinations", icon: MapPin },
                { value: "4.8", label: "Average Rating", icon: Star },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="text-center"
                  >
                    <Icon
                      size={24}
                      className="text-[var(--theme-primary)] mx-auto mb-3"
                    />
                    <span className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-white block">
                      {stat.value}
                    </span>
                    <p className="text-white/40 text-sm mt-2">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section ref={valuesRef} className="py-20 bg-[var(--theme-background)]">
          <div className="container">
            <div className="text-center mb-12">
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                What Drives Us
              </span>
              <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-white">
                Our Core Values
              </h2>
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group p-6 border border-white/8 hover:border-[var(--theme-primary)]/30 transition-all duration-500 text-center"
                  >
                    <div className="inline-flex p-3 border border-[var(--theme-primary)]/30 mb-4 group-hover:bg-[var(--theme-primary)]/10 transition-colors">
                      <Icon size={24} className="text-[var(--theme-primary)]" />
                    </div>
                    <h3 className="font-[var(--font-display)] text-lg font-semibold text-white mb-2 group-hover:text-[var(--theme-primary)] transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-white/40 text-sm">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-[var(--theme-background)] border-t border-white/5">
          <div className="container">
            <div className="text-center mb-12">
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Our Journey
              </span>
              <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-white">
                Key Milestones
              </h2>
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
            </div>

            <div className="max-w-3xl mx-auto">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-6 mb-8 last:mb-0"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-[var(--theme-primary)] rounded-full shrink-0" />
                    {i < milestones.length - 1 && (
                      <div className="w-px h-full bg-[var(--theme-primary)]/20 mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <span className="font-[var(--font-display)] text-[var(--theme-primary)] text-lg font-bold">
                      {m.year}
                    </span>
                    <p className="text-white/60 text-sm mt-1">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Offices */}
        <section
          ref={officesRef}
          className="py-20 bg-[var(--theme-background)] border-t border-white/5"
        >
          <div className="container">
            <div className="text-center mb-12">
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Where We Are
              </span>
              <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-white">
                Global Offices
              </h2>
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {offices.map((office, i) => (
                <motion.div
                  key={office.city}
                  initial={{ opacity: 0, y: 20 }}
                  animate={officesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group flex items-center gap-4 p-5 border border-white/8 hover:border-[var(--theme-primary)]/30 transition-all duration-500"
                >
                  <span className="text-3xl">{office.flag}</span>
                  <div>
                    <h3 className="font-[var(--font-display)] text-lg font-semibold text-white group-hover:text-[var(--theme-primary)] transition-colors">
                      {office.city}
                    </h3>
                    <p className="text-white/40 text-xs">{office.country}</p>
                    <p className="text-[var(--theme-primary)]/60 text-xs mt-1">
                      {office.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Affiliated Companies */}
        <section className="py-20 bg-[var(--theme-background)] border-t border-white/5">
          <div className="container">
            <div className="text-center mb-12">
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Our Family
              </span>
              <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-white">
                Affiliated Companies
              </h2>
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {affiliates.map((aff, i) => {
                const Icon = aff.icon;
                return (
                  <motion.div
                    key={aff.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group p-6 border border-white/8 hover:border-[var(--theme-primary)]/30 transition-all duration-500 text-center"
                  >
                    <div className="inline-flex p-3 border border-[var(--theme-primary)]/20 mb-4">
                      <Icon size={24} className="text-[var(--theme-primary)]" />
                    </div>
                    <h3 className="font-[var(--font-display)] text-base font-semibold text-white mb-1 group-hover:text-[var(--theme-primary)] transition-colors">
                      {aff.name}
                    </h3>
                    <p className="text-white/40 text-xs">{aff.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[var(--theme-background)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 35px, #D4A853 35px, #D4A853 36px)",
              }}
            />
          </div>
          <div className="container relative z-10 text-center">
            <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
              Join Our Journey
            </span>
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-white mb-4">
              Experience the VANIR Difference
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8">
              Whether you&apos;re planning a dream vacation or a corporate
              event, our team is ready to make it extraordinary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/booking"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-background)] font-semibold hover:bg-[var(--theme-primary-light)] transition-colors"
              >
                Start Planning
                <ArrowRight size={16} />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-semibold hover:bg-[var(--theme-primary)] hover:text-[var(--theme-background)] transition-all"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
