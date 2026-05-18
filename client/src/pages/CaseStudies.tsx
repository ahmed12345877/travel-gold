/**
 * Case Studies & Success Stories Page
 * Design: Art Deco Luxe - Black & Gold
 * Features: Hero, category filters, detailed case study cards with expandable view,
 *           timeline, metrics visualization, client testimonials, CTA
 */
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  Users,
  Globe,
  Star,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  MapPin,
  Target,
  CheckCircle,
  Quote,
  ArrowRight,
  Briefcase,
  Building2,
  Plane,
  Palette,
  BarChart3,
  Clock,
  Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PageMeta from "@/components/PageMeta";

/* ─── CDN URLs ─── */
const CDN =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8";
const LOGO_URL = `${CDN}/vanir-logo-white_74cd1f52.png`;

/* ─── Types ─── */
interface CaseStudy {
  id: string;
  title: string;
  titleAr: string;
  client: string;
  category: string;
  image: string;
  year: string;
  duration: string;
  location: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: { label: string; value: string; icon: React.ReactNode }[];
  testimonial: { text: string; author: string; role: string };
  tags: string[];
  featured: boolean;
}

/* ─── Categories ─── */
const categories = [
  {
    id: "all",
    label: "All Projects",
    labelAr: "جميع المشاريع",
    icon: <Globe size={16} />,
  },
  {
    id: "tourism",
    label: "Tourism",
    labelAr: "سياحة",
    icon: <Plane size={16} />,
  },
  {
    id: "branding",
    label: "Branding",
    labelAr: "هوية بصرية",
    icon: <Palette size={16} />,
  },
  {
    id: "investment",
    label: "Investment",
    labelAr: "استثمار",
    icon: <TrendingUp size={16} />,
  },
  {
    id: "events",
    label: "Events",
    labelAr: "فعاليات",
    icon: <Building2 size={16} />,
  },
  {
    id: "corporate",
    label: "Corporate",
    labelAr: "شركات",
    icon: <Briefcase size={16} />,
  },
];

/* ─── Case Studies Data ─── */
const caseStudies: CaseStudy[] = [
  {
    id: "luxury-nile-cruise",
    title: "Luxury Nile Cruise Experience",
    titleAr: "تجربة رحلات النيل الفاخرة",
    client: "Royal Nile Cruises",
    category: "tourism",
    image: `${CDN}/case-study-luxury-nile_69235e18.jpg`,
    year: "2024",
    duration: "6 months",
    location: "Luxor - Aswan, Egypt",
    summary:
      "Designed and launched a premium Nile cruise package that redefined luxury river travel in Egypt, combining ancient heritage with five-star hospitality.",
    challenge:
      "The client needed to differentiate their cruise offerings in an increasingly competitive market. Existing packages lacked the premium positioning needed to attract high-net-worth international travelers.",
    solution:
      "We developed an exclusive luxury cruise experience featuring private guided tours of temples, gourmet Egyptian cuisine by award-winning chefs, and personalized concierge services. The marketing strategy targeted affluent travelers through partnerships with luxury travel agencies worldwide.",
    results: [
      "Revenue increased by 340% in the first year",
      "Average booking value rose from $2,500 to $8,500 per person",
      "Featured in Condé Nast Traveler's Top 10 River Cruises",
      "Customer satisfaction rating of 4.9/5 across 500+ reviews",
      "Expanded fleet from 2 to 5 luxury vessels",
    ],
    metrics: [
      {
        label: "Revenue Growth",
        value: "340%",
        icon: <TrendingUp size={20} />,
      },
      { label: "Guests Served", value: "2,500+", icon: <Users size={20} /> },
      { label: "Satisfaction", value: "4.9/5", icon: <Star size={20} /> },
      { label: "Awards Won", value: "3", icon: <Award size={20} /> },
    ],
    testimonial: {
      text: "VANIR GROUP transformed our cruise business from a standard offering to the most sought-after luxury experience on the Nile. Their strategic vision and attention to detail exceeded every expectation.",
      author: "Mohamed Hassan",
      role: "CEO, Royal Nile Cruises",
    },
    tags: [
      "Luxury Travel",
      "Nile Cruise",
      "Tourism Strategy",
      "Brand Positioning",
    ],
    featured: true,
  },
  {
    id: "resort-development",
    title: "El Gouna Luxury Resort Branding",
    titleAr: "تطوير هوية منتجع الجونة الفاخر",
    client: "Oasis Resorts International",
    category: "branding",
    image: `${CDN}/case-study-resort_5c45444e.png`,
    year: "2023",
    duration: "8 months",
    location: "El Gouna, Red Sea",
    summary:
      "Complete brand identity overhaul for a premium Red Sea resort, creating a cohesive visual language that elevated the property's international appeal.",
    challenge:
      "The resort had a dated brand identity that failed to communicate its luxury positioning. International guests often overlooked it in favor of better-branded competitors despite superior facilities.",
    solution:
      "We conducted extensive market research and developed a comprehensive brand strategy including new visual identity, photography direction, digital presence, and guest experience touchpoints. Every element was designed to reflect Egyptian elegance with modern luxury.",
    results: [
      "International bookings increased by 185%",
      "Brand recognition improved by 220% in target markets",
      "Social media following grew from 15K to 120K",
      "Won 'Best Resort Branding' at Middle East Hospitality Awards",
      "Average room rate increased by 45%",
    ],
    metrics: [
      {
        label: "Bookings Growth",
        value: "185%",
        icon: <TrendingUp size={20} />,
      },
      {
        label: "Brand Recognition",
        value: "220%",
        icon: <BarChart3 size={20} />,
      },
      { label: "Social Growth", value: "8x", icon: <Heart size={20} /> },
      { label: "Rate Increase", value: "45%", icon: <Award size={20} /> },
    ],
    testimonial: {
      text: "The rebranding by VANIR GROUP was nothing short of revolutionary. Our resort went from being a hidden gem to a must-visit destination. The ROI has been extraordinary.",
      author: "Sarah El-Masry",
      role: "Marketing Director, Oasis Resorts",
    },
    tags: [
      "Brand Identity",
      "Resort Marketing",
      "Visual Design",
      "Hospitality",
    ],
    featured: true,
  },
  {
    id: "heritage-tourism",
    title: "Abu Simbel Heritage Tourism Campaign",
    titleAr: "حملة السياحة التراثية لأبو سمبل",
    client: "Egypt Tourism Authority",
    category: "tourism",
    image: `${CDN}/case-study-abu-simbel_00331caa.jpg`,
    year: "2024",
    duration: "4 months",
    location: "Abu Simbel, Aswan",
    summary:
      "Launched a digital-first tourism campaign that brought global attention to Abu Simbel's magnificent temples, resulting in record visitor numbers.",
    challenge:
      "Despite being one of Egypt's most impressive archaeological sites, Abu Simbel received significantly fewer visitors than Luxor and Giza due to its remote location and lack of modern marketing.",
    solution:
      "We created an immersive digital campaign featuring 360-degree virtual tours, influencer partnerships, and a storytelling approach that connected ancient history with modern travel aspirations. We also developed convenient travel packages that solved the accessibility challenge.",
    results: [
      "Visitor numbers increased by 150% year-over-year",
      "Campaign reached 50M+ impressions across digital platforms",
      "Generated $12M in direct tourism revenue",
      "Established 15 new tour operator partnerships",
      "Won 'Best Digital Tourism Campaign' at World Travel Awards",
    ],
    metrics: [
      { label: "Visitor Growth", value: "150%", icon: <Users size={20} /> },
      { label: "Impressions", value: "50M+", icon: <Globe size={20} /> },
      { label: "Revenue", value: "$12M", icon: <TrendingUp size={20} /> },
      { label: "Partnerships", value: "15+", icon: <Building2 size={20} /> },
    ],
    testimonial: {
      text: "VANIR GROUP's campaign single-handedly changed the perception of Abu Simbel from 'too far to visit' to 'a must-see destination.' Their creative approach was brilliant.",
      author: "Dr. Ahmed Fathy",
      role: "Director, Egypt Tourism Authority",
    },
    tags: [
      "Digital Marketing",
      "Heritage Tourism",
      "Campaign Strategy",
      "Content Creation",
    ],
    featured: false,
  },
  {
    id: "investment-summit",
    title: "Egypt Investment Summit 2024",
    titleAr: "قمة الاستثمار المصرية 2024",
    client: "Cairo Chamber of Commerce",
    category: "events",
    image: `${CDN}/case-study-conference_79e4d122.jpg`,
    year: "2024",
    duration: "3 months",
    location: "Cairo, Egypt",
    summary:
      "Organized and managed a premier investment summit that attracted 500+ international investors and generated over $200M in investment commitments.",
    challenge:
      "Egypt needed a world-class investment event that could compete with Dubai and Riyadh summits. The event had to showcase Egypt's investment potential while providing a premium networking experience.",
    solution:
      "We designed a three-day summit with curated matchmaking sessions, keynote speakers from Fortune 500 companies, exclusive site visits to investment zones, and a gala dinner at the Pyramids. Every detail reflected Egyptian hospitality at its finest.",
    results: [
      "500+ international investors attended from 35 countries",
      "$200M+ in investment commitments signed",
      "98% attendee satisfaction rate",
      "150+ media mentions in international press",
      "Secured as annual recurring event",
    ],
    metrics: [
      { label: "Investors", value: "500+", icon: <Users size={20} /> },
      { label: "Investments", value: "$200M+", icon: <TrendingUp size={20} /> },
      { label: "Countries", value: "35", icon: <Globe size={20} /> },
      { label: "Satisfaction", value: "98%", icon: <Star size={20} /> },
    ],
    testimonial: {
      text: "The summit organized by VANIR GROUP was the most professionally executed investment event I've attended in the MENA region. It opened doors we never thought possible.",
      author: "James Mitchell",
      role: "VP Investments, Goldman Sachs MENA",
    },
    tags: ["Event Management", "Investment", "B2B Networking", "Conference"],
    featured: true,
  },
  {
    id: "corporate-retreat",
    title: "Fortune 500 Corporate Retreat Program",
    titleAr: "برنامج الخلوات المؤسسية لشركات Fortune 500",
    client: "Multiple Fortune 500 Clients",
    category: "corporate",
    image: `${CDN}/case-study-business_efc8258e.jpeg`,
    year: "2023-2024",
    duration: "Ongoing",
    location: "Multiple Locations, Egypt",
    summary:
      "Developed a premium corporate retreat program that positions Egypt as the ultimate destination for executive team building and strategic planning sessions.",
    challenge:
      "International corporations typically chose European or Asian destinations for retreats. Egypt was not on their radar despite offering unique venues, rich culture, and competitive pricing.",
    solution:
      "We created bespoke retreat packages combining luxury accommodations, cultural immersion experiences, and professional facilitation services. Venues ranged from Nile-side palaces to desert camps under the stars, each tailored to the client's objectives.",
    results: [
      "Served 25+ Fortune 500 companies",
      "95% rebooking rate for annual retreats",
      "Average program value of $150K per retreat",
      "Expanded to offer year-round programming",
      "Created 200+ local jobs in hospitality sector",
    ],
    metrics: [
      { label: "F500 Clients", value: "25+", icon: <Building2 size={20} /> },
      { label: "Rebooking Rate", value: "95%", icon: <Heart size={20} /> },
      { label: "Avg. Value", value: "$150K", icon: <TrendingUp size={20} /> },
      { label: "Jobs Created", value: "200+", icon: <Users size={20} /> },
    ],
    testimonial: {
      text: "Our team retreat in Egypt organized by VANIR GROUP was transformative. The blend of ancient wisdom, luxury, and professional facilitation created an experience our executives still talk about.",
      author: "Lisa Chen",
      role: "CHRO, Tech Fortune 500",
    },
    tags: [
      "Corporate Retreats",
      "Team Building",
      "Executive Programs",
      "Luxury Events",
    ],
    featured: false,
  },
  {
    id: "nile-fleet-expansion",
    title: "Nile Cruise Fleet Modernization",
    titleAr: "تحديث أسطول رحلات النيل",
    client: "Pharaoh Cruise Lines",
    category: "investment",
    image: `${CDN}/case-study-nile-cruise_b973969b.jpg`,
    year: "2023",
    duration: "12 months",
    location: "Cairo - Aswan, Egypt",
    summary:
      "Managed a $50M fleet modernization project that transformed aging vessels into world-class luxury cruise ships, attracting international investment.",
    challenge:
      "The client's fleet of 8 cruise ships needed complete modernization to meet international luxury standards. Securing financing and managing the renovation while maintaining operations was a complex challenge.",
    solution:
      "We developed a phased renovation plan, secured international investment partners, and managed the entire project from design to delivery. Each ship was reimagined with contemporary luxury interiors while preserving Egyptian design elements.",
    results: [
      "Secured $50M in international investment",
      "Renovated 8 cruise ships in 12 months",
      "Occupancy rates jumped from 45% to 92%",
      "Revenue per available cabin doubled",
      "Named 'Best Fleet Renovation' by Cruise Industry News",
    ],
    metrics: [
      { label: "Investment", value: "$50M", icon: <TrendingUp size={20} /> },
      { label: "Ships Renovated", value: "8", icon: <Plane size={20} /> },
      { label: "Occupancy", value: "92%", icon: <BarChart3 size={20} /> },
      { label: "Revenue Growth", value: "2x", icon: <Award size={20} /> },
    ],
    testimonial: {
      text: "VANIR GROUP didn't just renovate our ships—they reimagined the entire Nile cruise experience. The investment they secured and the vision they delivered exceeded our wildest dreams.",
      author: "Karim Abdel-Nour",
      role: "Chairman, Pharaoh Cruise Lines",
    },
    tags: [
      "Investment Management",
      "Fleet Modernization",
      "Luxury Hospitality",
      "Project Management",
    ],
    featured: false,
  },
];

/* ─── Stats ─── */
const overallStats = [
  {
    label: "Projects Completed",
    value: "150+",
    icon: <CheckCircle size={24} />,
  },
  { label: "Client Satisfaction", value: "98%", icon: <Star size={24} /> },
  {
    label: "Revenue Generated",
    value: "$500M+",
    icon: <TrendingUp size={24} />,
  },
  { label: "Countries Reached", value: "45+", icon: <Globe size={24} /> },
];

/* ─── Component ─── */
export default function CaseStudies() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null);

  const filteredStudies = useMemo(() => {
    if (activeCategory === "all") return caseStudies;
    return caseStudies.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const selectedStudy = caseStudies.find((s) => s.id === expandedStudy);

  return (
    <div className="min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="Case Studies & Success Stories"
        description="Explore VANIR GROUP's case studies showcasing successful luxury travel experiences. Real stories from corporate retreats, honeymoons, and cultural expeditions in Egypt."
        keywords="travel case studies, luxury tour success stories, Egypt corporate retreat, honeymoon Egypt, cultural expedition Egypt"
        canonicalPath="/case-studies"
      />
      <SEO
        title="Case Studies & Success Stories"
        description="Explore VANIR GROUP's portfolio of successful tourism, branding, and investment projects across Egypt. Real results, real impact."
        keywords="case studies, success stories, Egypt tourism projects, VANIR GROUP portfolio"
      />
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-surface)] via-[var(--theme-surface)]/95 to-[var(--theme-surface)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A853' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container relative z-10">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-[var(--theme-primary)]/60 mb-8"
          >
            <a
              href="/"
              className="hover:text-[var(--theme-primary)] transition-colors"
            >
              Home
            </a>
            <ChevronRight size={14} />
            <span className="text-[var(--theme-primary)]">Case Studies</span>
          </motion.div>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/5 text-[var(--theme-primary)] text-sm font-medium tracking-wider uppercase mb-6"
            >
              <Award size={14} />
              Our Portfolio
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Case Studies &{" "}
              <span className="text-[var(--theme-primary)]">
                Success Stories
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl"
            >
              Discover how we've helped businesses and organizations achieve
              extraordinary results across tourism, branding, investment, and
              corporate sectors in Egypt and beyond.
            </motion.p>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-white/8"
          >
            {overallStats.map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="text-[var(--theme-primary)]">
                    {stat.icon}
                  </span>
                  <span className="font-[var(--font-display)] text-2xl md:text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-white/50 tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Category Filters ─── */}
      <section className="sticky top-[72px] z-30 bg-[var(--theme-surface)]/95 backdrop-blur-md border-y border-white/8 py-4">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => {
              const count =
                cat.id === "all"
                  ? caseStudies.length
                  : caseStudies.filter((s) => s.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-300 border ${
                    activeCategory === cat.id
                      ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] border-[var(--theme-primary)]"
                      : "bg-transparent text-white/70 border-white/10 hover:border-[var(--theme-primary)]/50 hover:text-white"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeCategory === cat.id
                        ? "bg-[var(--theme-surface)]/20 text-[var(--theme-surface)]"
                        : "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Case Studies Grid ─── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {filteredStudies.map((study, index) => (
                <motion.article
                  key={study.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`group relative bg-[var(--theme-surface)] border border-white/8 hover:border-[var(--theme-primary)]/40 transition-all duration-500 overflow-hidden ${
                    study.featured ? "md:col-span-2" : ""
                  }`}
                >
                  <div className={`${study.featured ? "md:flex" : ""}`}>
                    {/* Image */}
                    <div
                      className={`relative overflow-hidden ${study.featured ? "md:w-1/2" : "h-64"}`}
                    >
                      <img
                        src={study.image}
                        alt={study.title}
                        loading="lazy"
                        className="w-full h-full min-h-[256px] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/80 via-transparent to-transparent" />

                      {/* Category badge */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] text-xs font-bold tracking-wider uppercase">
                          {
                            categories.find((c) => c.id === study.category)
                              ?.label
                          }
                        </span>
                        {study.featured && (
                          <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-[var(--theme-primary)] text-xs font-bold tracking-wider uppercase border border-[var(--theme-primary)]/30">
                            <Star size={10} className="inline mr-1" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Year */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/70 text-sm">
                        <Calendar size={14} />
                        {study.year}
                        <span className="mx-1 text-[var(--theme-primary)]/40">
                          |
                        </span>
                        <MapPin size={14} />
                        {study.location}
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className={`p-6 md:p-8 ${study.featured ? "md:w-1/2 flex flex-col justify-center" : ""}`}
                    >
                      <h2 className="font-[var(--font-display)] text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-[var(--theme-primary)] transition-colors duration-300">
                        {study.title}
                      </h2>
                      <p className="text-sm text-[var(--theme-primary)]/70 mb-4 font-medium">
                        Client: {study.client}
                      </p>
                      <p className="text-white/60 text-sm leading-relaxed mb-6 line-clamp-3">
                        {study.summary}
                      </p>

                      {/* Quick metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {study.metrics.slice(0, 2).map((metric, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-3 bg-[var(--theme-primary)]/5 border border-white/5"
                          >
                            <span className="text-[var(--theme-primary)]">
                              {metric.icon}
                            </span>
                            <div>
                              <p className="text-white font-bold text-sm">
                                {metric.value}
                              </p>
                              <p className="text-white/40 text-xs">
                                {metric.label}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {study.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 text-xs text-[var(--theme-primary)]/70 border border-white/8 bg-[var(--theme-primary)]/5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* View details button */}
                      <button
                        onClick={() => setExpandedStudy(study.id)}
                        className="inline-flex items-center gap-2 text-[var(--theme-primary)] text-sm font-medium tracking-wide hover:gap-3 transition-all duration-300 group/btn"
                      >
                        View Full Case Study
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover/btn:translate-x-1"
                        />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredStudies.length === 0 && (
            <div className="text-center py-20">
              <Briefcase
                size={48}
                className="mx-auto text-[var(--theme-primary)]/30 mb-4"
              />
              <p className="text-white/50 text-lg">
                No case studies found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Expanded Case Study Modal ─── */}
      <AnimatePresence>
        {selectedStudy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--theme-surface)]/95 backdrop-blur-sm overflow-y-auto"
            onClick={() => setExpandedStudy(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-5xl mx-auto my-8 md:my-16 bg-[var(--theme-surface)] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Image */}
              <div className="relative h-64 md:h-96 overflow-hidden">
                <img
                  src={selectedStudy.image}
                  alt={selectedStudy.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/40 to-transparent" />

                {/* Close button */}
                <button
                  onClick={() => setExpandedStudy(null)}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-[var(--theme-surface)]/60 backdrop-blur-sm text-white hover:text-[var(--theme-primary)] hover:bg-[var(--theme-surface)]/80 transition-all border border-white/10"
                >
                  <X size={20} />
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-6 left-6 md:left-10 right-6 md:right-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] text-xs font-bold tracking-wider uppercase">
                      {
                        categories.find((c) => c.id === selectedStudy.category)
                          ?.label
                      }
                    </span>
                    <span className="text-white/60 text-sm flex items-center gap-1">
                      <Calendar size={14} /> {selectedStudy.year}
                    </span>
                    <span className="text-white/60 text-sm flex items-center gap-1">
                      <Clock size={14} /> {selectedStudy.duration}
                    </span>
                  </div>
                  <h2 className="font-[var(--font-display)] text-2xl md:text-4xl font-bold text-white">
                    {selectedStudy.title}
                  </h2>
                  <p className="text-[var(--theme-primary)]/80 mt-2">
                    Client: {selectedStudy.client} | {selectedStudy.location}
                  </p>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-10">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 -mt-2">
                  {selectedStudy.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="text-center p-5 bg-[var(--theme-primary)]/5 border border-white/8"
                    >
                      <span className="text-[var(--theme-primary)] flex justify-center mb-2">
                        {metric.icon}
                      </span>
                      <p className="font-[var(--font-display)] text-2xl font-bold text-white">
                        {metric.value}
                      </p>
                      <p className="text-white/50 text-xs mt-1 tracking-wide">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Challenge → Solution → Results */}
                <div className="space-y-10">
                  {/* The Challenge */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400">
                        <Target size={20} />
                      </div>
                      <h3 className="font-[var(--font-display)] text-xl font-bold text-white">
                        The Challenge
                      </h3>
                    </div>
                    <p className="text-white/60 leading-relaxed pl-[52px]">
                      {selectedStudy.challenge}
                    </p>
                  </div>

                  {/* The Solution */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-[var(--theme-primary)]/10 border border-white/10 text-[var(--theme-primary)]">
                        <CheckCircle size={20} />
                      </div>
                      <h3 className="font-[var(--font-display)] text-xl font-bold text-white">
                        Our Solution
                      </h3>
                    </div>
                    <p className="text-white/60 leading-relaxed pl-[52px]">
                      {selectedStudy.solution}
                    </p>
                  </div>

                  {/* The Results */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-green-500/10 border border-green-500/20 text-green-400">
                        <TrendingUp size={20} />
                      </div>
                      <h3 className="font-[var(--font-display)] text-xl font-bold text-white">
                        Key Results
                      </h3>
                    </div>
                    <ul className="space-y-3 pl-[52px]">
                      {selectedStudy.results.map((result, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-white/60"
                        >
                          <CheckCircle
                            size={16}
                            className="text-[var(--theme-primary)] mt-0.5 shrink-0"
                          />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Client Testimonial */}
                <div className="mt-12 p-6 md:p-8 bg-[var(--theme-primary)]/5 border border-white/10 relative">
                  <Quote
                    size={40}
                    className="absolute top-4 right-4 text-[var(--theme-primary)]/10"
                  />
                  <p className="text-white/80 text-lg leading-relaxed italic mb-6">
                    "{selectedStudy.testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)] font-bold text-lg">
                      {selectedStudy.testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold">
                        {selectedStudy.testimonial.author}
                      </p>
                      <p className="text-[var(--theme-primary)]/70 text-sm">
                        {selectedStudy.testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8">
                  {selectedStudy.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-xs text-[var(--theme-primary)]/70 border border-white/8 bg-[var(--theme-primary)]/5 tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-10 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-white/50 text-sm">
                    Interested in similar results for your business?
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-bold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary-light)] transition-colors"
                  >
                    Start Your Project
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CTA Section ─── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary)]/10 via-[var(--theme-surface)] to-[var(--theme-primary)]/10" />
        <div className="absolute inset-0 border-y border-white/10" />

        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Write Your{" "}
              <span className="text-[var(--theme-primary)]">
                Success Story?
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Let's discuss how VANIR GROUP can help your business achieve
              extraordinary results. Every great project starts with a
              conversation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-bold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary-light)] transition-all duration-300"
              >
                Get In Touch
                <ArrowRight size={16} />
              </a>
              <a
                href="/booking"
                className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--theme-primary)]/50 text-white font-bold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary)]/10 transition-all duration-300"
              >
                Book a Consultation
              </a>
            </div>
          </motion.div>

          {/* Watermark */}
          <img
            src={LOGO_URL}
            alt="VANIR GROUP Logo"
            loading="lazy"
            className="absolute bottom-6 right-6 h-16 opacity-10 pointer-events-none"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
