/*
 * AI Studio Page - Art Deco Black & Gold Design
 * Consistent with site-wide luxury travel aesthetic
 * Distinct mobile-first experience with desktop enhancements
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  Zap,
  Wand2,
  Grid3x3,
  PenTool,
  ArrowRight,
  Play,
  ChevronRight,
  Heart,
  Eye,
  Star,
  Cpu,
  Crown,
  Layers,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import PageMeta from "@/components/PageMeta";
import OptimizedImage from "@/components/OptimizedImage";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

/* ─── Section Title ─── */
function SectionTitle({
  subtitle,
  title,
  description,
  align = "center",
}: {
  subtitle: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`mb-16 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <span className="font-[var(--font-display)] text-[var(--theme-primary)] text-sm tracking-[0.2em] uppercase italic">
        {subtitle}
      </span>
      <h2 className="font-[var(--font-display)] text-white text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-4 leading-tight">
        {title}
      </h2>
      <div
        className={`flex ${align === "center" ? "justify-center" : "justify-start"} mt-4 mb-6`}
      >
        <div className="w-16 h-[1px] bg-[var(--theme-primary)]" />
        <div className="w-2 h-2 bg-[var(--theme-primary)] rotate-45 mx-3 -mt-[3px]" />
        <div className="w-16 h-[1px] bg-[var(--theme-primary)]" />
      </div>
      {description && (
        <p
          className={`text-white/60 max-w-2xl leading-relaxed ${align === "center" ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ─── Hero Section ─── */
function StudioHero() {
  const [promptValue, setPromptValue] = useState("");

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <OptimizedImage
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/egypt-pyramids-hero-iqbfDkZV4VwqjH9bTnSoDx.webp"
          alt="AI Studio Background"
          className="w-full h-full object-cover"
          containerClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-surface)]/85 via-[var(--theme-surface)]/70 to-[var(--theme-surface)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-surface)]/50 via-transparent to-[var(--theme-surface)]/50" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 border border-[var(--theme-primary)]/10 rotate-45 hidden lg:block" />
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-[var(--theme-primary)]/10 rotate-45 hidden lg:block" />
        <div className="absolute top-1/3 right-20 w-2 h-2 bg-[var(--theme-primary)]/30 rotate-45 hidden md:block" />
        <div className="absolute bottom-1/3 left-20 w-2 h-2 bg-[var(--theme-primary)]/30 rotate-45 hidden md:block" />
      </div>

      {/* Content */}
      <div className="relative container px-4 py-24 md:py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/5 px-5 py-2 mb-8">
            <Cpu size={14} className="text-[var(--theme-primary)]" />
            <span className="text-xs text-[var(--theme-primary)] tracking-[0.15em] uppercase font-semibold">
              Powered by Advanced AI
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Title - Desktop */}
          <h1 className="hidden md:block font-[var(--font-display)] text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Create </span>
            <span className="text-[var(--theme-primary)]">Extraordinary</span>
            <br />
            <span className="text-white">Visual </span>
            <span className="text-[var(--theme-primary)]">Experiences</span>
          </h1>

          {/* Title - Mobile */}
          <h1 className="md:hidden font-[var(--font-display)] text-3xl font-bold mb-4 leading-tight">
            <span className="text-[var(--theme-primary)]">AI Studio</span>
            <br />
            <span className="text-white text-2xl">
              Create. Imagine. Inspire.
            </span>
          </h1>

          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-10">
            Transform your imagination into stunning visuals with our AI-powered
            creative tools, designed for the world of luxury travel.
          </p>

          {/* Prompt Bar - Desktop */}
          <div className="hidden md:block w-full max-w-2xl mx-auto mb-10">
            <div className="relative border border-[var(--theme-primary)]/30 bg-[var(--theme-surface)]/80 backdrop-blur-sm hover:border-[var(--theme-primary)]/60 transition-colors duration-300">
              <div className="flex items-center gap-3 p-2">
                <div className="flex items-center gap-2 pl-4">
                  <Sparkles size={18} className="text-[var(--theme-primary)]" />
                </div>
                <input
                  type="text"
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  placeholder="Describe what you want to create..."
                  className="flex-1 bg-transparent text-white placeholder:text-white/25 focus:outline-none text-sm py-3"
                />
                <Link href="/ai-image-generator">
                  <button className="bg-[var(--theme-primary)] text-[var(--theme-surface)] px-6 py-3 font-semibold text-sm flex items-center gap-2 hover:bg-[var(--theme-primary-light)] transition-colors duration-300 tracking-wider uppercase">
                    Generate
                    <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
              {/* Gold corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--theme-primary)]/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[var(--theme-primary)]/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[var(--theme-primary)]/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--theme-primary)]/50" />
            </div>
          </div>

          {/* CTA Button - Mobile */}
          <div className="md:hidden mb-10">
            <Link href="/ai-image-generator">
              <button className="inline-flex items-center gap-2 bg-[var(--theme-primary)] text-[var(--theme-surface)] px-8 py-3 font-semibold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary-light)] transition-colors duration-300">
                <Sparkles size={16} />
                Start Creating
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-12">
            {[
              { label: "Images Created", value: "50K+" },
              { label: "Active Users", value: "12K+" },
              { label: "AI Models", value: "5" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="font-[var(--font-display)] text-xl md:text-2xl font-bold text-[var(--theme-primary)]">
                  {stat.value}
                </div>
                <div className="text-xs text-white/30 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/30 to-transparent" />
    </section>
  );
}

/* ─── Creative Tools Section ─── */
function CreativeTools() {
  const services = [
    {
      id: "image",
      icon: ImageIcon,
      title: "Image Generation",
      description:
        "Create stunning travel photos and artwork with AI-powered generation tools.",
      href: "/ai-image-generator",
      stats: "50K+ generated",
    },
    {
      id: "video",
      icon: Video,
      title: "Video Creation",
      description:
        "Generate engaging cinematic video content for travel marketing.",
      href: "/ai-studio",
      stats: "Coming Soon",
      badge: "SOON",
    },
    {
      id: "blueprints",
      icon: Grid3x3,
      title: "Blueprints",
      description:
        "Pre-built design templates for instant creative inspiration.",
      href: "/ai-studio",
      stats: "120+ templates",
      badge: "NEW",
    },
    {
      id: "upscaler",
      icon: Wand2,
      title: "AI Upscaler",
      description:
        "Enhance image quality up to 4x resolution with intelligent upscaling.",
      href: "/ai-studio",
      stats: "4x resolution",
    },
    {
      id: "canvas",
      icon: PenTool,
      title: "Canvas Editor",
      description:
        "Professional editing tools for fine-tuning your AI creations.",
      href: "/ai-studio",
      stats: "Pro tools",
    },
    {
      id: "flow",
      icon: Zap,
      title: "Flow State",
      description: "Automated creative workflows for batch content generation.",
      href: "/ai-studio",
      stats: "Automation",
      badge: "BETA",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="AI-Powered Tools"
          title="Creative Studio"
          description="A suite of intelligent tools designed to bring your travel vision to life."
        />

        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                custom={i}
              >
                <Link href={service.href}>
                  <div className="group relative bg-[#0F0F0F] border border-white/8 p-8 h-full hover:border-[var(--theme-primary)]/40 transition-all duration-500 cursor-pointer overflow-hidden">
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)]/30 to-transparent group-hover:via-[var(--theme-primary)]/70 transition-all duration-500" />

                    {/* Badge */}
                    {service.badge && (
                      <div className="absolute top-4 right-4">
                        <span
                          className={`text-[10px] tracking-[0.15em] uppercase font-semibold px-3 py-1 ${
                            service.badge === "NEW"
                              ? "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30"
                              : service.badge === "BETA"
                                ? "bg-white/5 text-white/50 border border-white/10"
                                : "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]/70 border border-[var(--theme-primary)]/20"
                          }`}
                        >
                          {service.badge}
                        </span>
                      </div>
                    )}

                    {/* Icon - Diamond style */}
                    <div className="w-16 h-16 border border-[var(--theme-primary)]/30 flex items-center justify-center mb-6 group-hover:bg-[var(--theme-primary)]/10 group-hover:border-[var(--theme-primary)]/60 transition-all duration-500 rotate-45">
                      <Icon
                        size={24}
                        className="text-[var(--theme-primary)] -rotate-45 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <h3 className="font-[var(--font-display)] text-white text-lg font-semibold mb-3 group-hover:text-[var(--theme-primary-light)] transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs text-white/30">
                        {service.stats}
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-white/20 group-hover:text-[var(--theme-primary)] group-hover:translate-x-1 transition-all duration-300"
                      />
                    </div>

                    {/* Corner decoration */}
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b border-r border-[var(--theme-primary)]/15 group-hover:border-[var(--theme-primary)]/40 transition-all duration-500" />

                    {/* Hover glow */}
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--theme-primary)]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: Horizontal scroll cards */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.id} href={service.href}>
                  <div className="snap-start shrink-0 w-[280px] bg-[#0F0F0F] border border-white/8 p-6 relative group active:border-[var(--theme-primary)]/40 transition-colors">
                    {/* Badge */}
                    {service.badge && (
                      <span
                        className={`absolute top-3 right-3 text-[9px] tracking-[0.12em] uppercase font-semibold px-2 py-0.5 ${
                          service.badge === "NEW"
                            ? "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]"
                            : service.badge === "BETA"
                              ? "bg-white/5 text-white/50"
                              : "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]/70"
                        }`}
                      >
                        {service.badge}
                      </span>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 border border-[var(--theme-primary)]/30 flex items-center justify-center shrink-0 rotate-45">
                        <Icon
                          size={18}
                          className="text-[var(--theme-primary)] -rotate-45"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-[var(--font-display)] text-white text-base font-semibold mb-1">
                          {service.title}
                        </h3>
                        <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-[var(--theme-primary)] text-xs">
                          <span>{service.stats}</span>
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Scroll hint */}
          <div className="flex justify-center mt-3">
            <div className="flex gap-1">
              {services.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[var(--theme-primary)]" : "bg-white/15"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Featured Gallery ─── */
function FeaturedGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const galleryImages = [
    {
      title: "Egyptian Elegance",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146353_e679aa8f.jpg",
      category: "Fashion",
      likes: 2847,
    },
    {
      title: "Pharaonic Majesty",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146351_94261003.jpg",
      category: "Historical",
      likes: 3156,
    },
    {
      title: "Ancient Robes",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146347_c499649b.jpg",
      category: "Fashion",
      likes: 1923,
    },
    {
      title: "Winged Amulet",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146345_7d9a08eb.jpg",
      category: "Artifacts",
      likes: 4210,
    },
    {
      title: "Sacred Feather",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146343_62a3eede.jpg",
      category: "Artifacts",
      likes: 1567,
    },
    {
      title: "Museum Grandeur",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146332_57c5eb0f.jpg",
      category: "Architecture",
      likes: 2890,
    },
    {
      title: "Cairo Monument",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146329_babee5c6.jpg",
      category: "Landmarks",
      likes: 1834,
    },
    {
      title: "Nile Cruise Luxury",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000141933_d6652362.jpg",
      category: "Travel",
      likes: 2456,
    },
    {
      title: "Desert Elegance",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146380_72ead6e5.jpg",
      category: "Landscape",
      likes: 3100,
    },
    {
      title: "Golden Sands",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146381_52e9e86e.jpg",
      category: "Landscape",
      likes: 2750,
    },
    {
      title: "Sphinx Wonder",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146382_d69f6fe0.jpg",
      category: "Landmarks",
      likes: 4050,
    },
    {
      title: "Pyramid Majesty",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146383_c6931189.jpg",
      category: "Landmarks",
      likes: 3890,
    },
    {
      title: "Temple Gateway",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146384_fc7c369b.jpg",
      category: "Architecture",
      likes: 2340,
    },
    {
      title: "Luxor Beauty",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146385_28be6b13.jpg",
      category: "Landmarks",
      likes: 3567,
    },
    {
      title: "Valley of Kings",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146386_2a630fe8.jpg",
      category: "Landscape",
      likes: 2890,
    },
    {
      title: "Ancient Wonders",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146387_60cf820d.jpg",
      category: "Historical",
      likes: 3200,
    },
    {
      title: "Cairo Museum",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146388_0b7c2144.jpg",
      category: "Architecture",
      likes: 2670,
    },
    {
      title: "Sunset Reflection",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146392_420db1be.jpg",
      category: "Landscape",
      likes: 3450,
    },
    {
      title: "Nile Serenity",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146393_6f805dc8.jpg",
      category: "Nature",
      likes: 2890,
    },
    {
      title: "Desert Dunes",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146399_bc13e4c6.jpg",
      category: "Landscape",
      likes: 2567,
    },
    {
      title: "Temple Columns",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146400_c39b4aa1.jpg",
      category: "Architecture",
      likes: 2340,
    },
    {
      title: "Pharaoh's Legacy",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146401_60a1fccf.jpg",
      category: "Historical",
      likes: 3100,
    },
    {
      title: "Golden Hour",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146402_fcbb8f49.jpg",
      category: "Landscape",
      likes: 2890,
    },
    {
      title: "Desert Mystique",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146403_2c87a338.jpg",
      category: "Landscape",
      likes: 2456,
    },
  ];

  const categories = [
    "All",
    "Fashion",
    "Historical",
    "Artifacts",
    "Architecture",
    "Landmarks",
    "Landscape",
    "Travel",
    "Nature",
  ];
  const filtered =
    activeFilter === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeFilter);

  return (
    <section className="py-20 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="AI Creations"
          title="Featured Gallery"
          description="Explore stunning AI-generated artwork inspired by Egypt's timeless beauty and rich heritage."
        />

        {/* Filter Tabs - Desktop: inline, Mobile: horizontal scroll */}
        <div className="mb-12">
          {/* Desktop filters */}
          <div className="hidden md:flex items-center justify-center gap-3 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 text-xs font-semibold tracking-wider uppercase border transition-all duration-300 ${
                  activeFilter === cat
                    ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] border-[var(--theme-primary)]"
                    : "bg-transparent text-white/50 border-white/10 hover:border-[var(--theme-primary)]/50 hover:text-[var(--theme-primary)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Mobile filters - horizontal scroll */}
          <div className="md:hidden -mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`shrink-0 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border transition-all duration-300 ${
                    activeFilter === cat
                      ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] border-[var(--theme-primary)]"
                      : "bg-transparent text-white/50 border-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Masonry Grid */}
        <div className="hidden md:block columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {filtered.map((project, idx) => (
            <motion.div
              key={`gallery-${idx}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={idx % 4}
              className="break-inside-avoid"
            >
              <div
                className="relative overflow-hidden group cursor-pointer border border-white/5 hover:border-[var(--theme-primary)]/30 transition-all duration-500"
                onClick={() => setSelectedImage(project.image)}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className={`w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                    idx % 3 === 0 ? "h-72" : idx % 3 === 1 ? "h-56" : "h-64"
                  }`}
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-[var(--theme-primary)] text-[10px] tracking-[0.15em] uppercase font-semibold">
                    {project.category}
                  </span>
                  <h3 className="text-white font-semibold text-sm mt-1">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Heart size={11} /> {project.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={11} /> {(project.likes * 3).toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Corner accent */}
                <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-[var(--theme-primary)]/0 group-hover:border-[var(--theme-primary)]/50 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: 2-column grid with simpler cards */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {filtered.slice(0, 12).map((project, idx) => (
            <motion.div
              key={`mobile-gallery-${idx}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={idx % 2}
            >
              <div
                className="relative overflow-hidden border border-white/5 active:border-[var(--theme-primary)]/30 transition-colors"
                onClick={() => setSelectedImage(project.image)}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                  <p className="text-white text-xs font-semibold truncate">
                    {project.title}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-white/40 mt-0.5">
                    <Heart size={9} /> {project.likes.toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Show more button */}
        {filtered.length > 12 && (
          <div className="md:hidden text-center mt-6">
            <Link href="/gallery">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] text-sm font-semibold tracking-wider uppercase hover:bg-[var(--theme-primary)]/10 transition-colors">
                View All
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        )}

        {/* Desktop: Create yours CTA */}
        <div className="hidden md:flex justify-center mt-12">
          <Link href="/ai-image-generator">
            <button className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--theme-primary)] text-[var(--theme-primary)] text-sm font-semibold tracking-wider uppercase hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all duration-300">
              Create Your Own
              <Sparkles size={14} />
            </button>
          </Link>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Full view"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white text-sm tracking-wider uppercase"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}

/* ─── Featured Videos ─── */
function FeaturedVideos() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const featuredVideos = [
    {
      title: "Desert Expedition",
      video:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146389_965eefc8.mp4",
      thumbnail:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146383_c6931189.jpg",
      category: "Adventure",
    },
    {
      title: "Nile River Journey",
      video:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146394_14d6eaf2.mp4",
      thumbnail:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000141933_d6652362.jpg",
      category: "Travel",
    },
    {
      title: "Ancient Temples",
      video:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146395_32a7e324.mp4",
      thumbnail:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146385_28be6b13.jpg",
      category: "Historical",
    },
    {
      title: "Cairo Nights",
      video:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146397_68e383d6.mp4",
      thumbnail:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/1000146329_babee5c6.jpg",
      category: "Urban",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="Video Showcase"
          title="Featured Videos"
          description="Watch AI-generated cinematic content that captures Egypt's breathtaking beauty."
        />

        {/* Desktop: 2x2 grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {featuredVideos.map((video, idx) => (
            <motion.div
              key={`video-${idx}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={idx}
            >
              <div
                className="group relative overflow-hidden border border-white/5 hover:border-[var(--theme-primary)]/30 transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedVideo(video.video)}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-[var(--theme-primary)] flex items-center justify-center group-hover:bg-[var(--theme-primary)]/10 group-hover:scale-110 transition-all duration-300 rotate-45">
                      <Play
                        size={24}
                        className="text-[var(--theme-primary)] -rotate-45 fill-[var(--theme-primary)]"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-[#0F0F0F]">
                  <span className="text-[var(--theme-primary)] text-[10px] tracking-[0.15em] uppercase font-semibold">
                    {video.category}
                  </span>
                  <h3 className="text-white font-[var(--font-display)] font-semibold mt-1 group-hover:text-[var(--theme-primary-light)] transition-colors">
                    {video.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {featuredVideos.map((video, idx) => (
              <div
                key={`mobile-video-${idx}`}
                className="snap-start shrink-0 w-[280px] border border-white/5 overflow-hidden"
                onClick={() => setSelectedVideo(video.video)}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-[var(--theme-primary)] flex items-center justify-center rotate-45">
                      <Play
                        size={18}
                        className="text-[var(--theme-primary)] -rotate-45 fill-[var(--theme-primary)]"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-[#0F0F0F]">
                  <span className="text-[var(--theme-primary)] text-[9px] tracking-[0.12em] uppercase font-semibold">
                    {video.category}
                  </span>
                  <h3 className="text-white font-semibold text-sm mt-0.5">
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-auto max-h-[85vh] rounded-sm"
            />
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white text-sm tracking-wider uppercase"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    {
      icon: Sparkles,
      step: "01",
      title: "Describe",
      desc: "Enter a detailed description of the image or video you want to create.",
    },
    {
      icon: Cpu,
      step: "02",
      title: "Generate",
      desc: "Our AI processes your prompt and generates high-quality visual content.",
    },
    {
      icon: Wand2,
      step: "03",
      title: "Refine",
      desc: "Fine-tune your creation with editing tools and style adjustments.",
    },
    {
      icon: Layers,
      step: "04",
      title: "Export",
      desc: "Download your creation in high resolution, ready for any platform.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[var(--theme-surface)]">
      <div className="container">
        <SectionTitle
          subtitle="Simple Process"
          title="How It Works"
          description="From idea to creation in four simple steps."
        />

        {/* Desktop: Horizontal steps with connecting line */}
        <div className="hidden md:block relative">
          {/* Connecting line */}
          <div className="absolute top-[52px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/30 to-transparent" />

          <div className="grid grid-cols-4 gap-8">
            {steps.map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                custom={i}
                className="text-center relative"
              >
                <div className="w-[104px] h-[104px] mx-auto mb-6 relative">
                  <div className="w-full h-full border border-[var(--theme-primary)]/30 rotate-45 flex items-center justify-center bg-[var(--theme-surface)]">
                    <Icon
                      size={28}
                      className="text-[var(--theme-primary)] -rotate-45"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-[var(--theme-primary)] text-[var(--theme-surface)] text-[10px] font-bold w-6 h-6 flex items-center justify-center">
                    {step}
                  </div>
                </div>
                <h3 className="font-[var(--font-display)] text-white text-lg font-semibold mb-2">
                  {title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--theme-primary)]/30 via-[var(--theme-primary)]/20 to-transparent" />

          <div className="space-y-8">
            {steps.map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute -left-8 top-1 w-6 h-6 bg-[var(--theme-primary)] flex items-center justify-center">
                  <span className="text-[var(--theme-surface)] text-[9px] font-bold">
                    {step}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-[var(--theme-primary)]/30 rotate-45 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon
                      size={16}
                      className="text-[var(--theme-primary)] -rotate-45"
                    />
                  </div>
                  <div>
                    <h3 className="font-[var(--font-display)] text-white font-semibold mb-1">
                      {title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function StudioCTA() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-16 bg-gradient-to-r from-[var(--theme-primary)]/10 via-[var(--theme-primary)]/5 to-[var(--theme-primary)]/10 border-y border-white/10">
      <div className="container text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="font-[var(--font-display)] text-white text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">
            Join thousands of creators using AI to produce stunning travel
            content. Start your creative journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthenticated ? (
              <a
                href={getLoginUrl()}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary-light)] transition-colors duration-300"
              >
                Get Started Free
                <ChevronRight size={16} />
              </a>
            ) : (
              <Link href="/ai-image-generator">
                <span className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary-light)] transition-colors duration-300">
                  Start Creating
                  <ChevronRight size={16} />
                </span>
              </Link>
            )}
            <Link href="/ai-pricing">
              <span className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--theme-primary)] text-[var(--theme-primary)] font-semibold text-sm tracking-wider uppercase hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-all duration-300">
                View Pricing
                <ChevronRight size={16} />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Main AI Studio Page ─── */
export default function AIStudio() {
  return (
    <div className="min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="AI Studio - Create with Artificial Intelligence"
        description="Transform your imagination into stunning visuals with VANIR GROUP's AI-powered creative studio. Generate images, videos, and more."
        keywords="AI studio, image generation, AI art, travel content, VANIR GROUP"
        canonicalPath="/ai-studio"
      />
      <SEO
        title="AI Studio - Creative Tools"
        description="AI-powered creative tools for stunning travel content. Generate images, videos, and more with VANIR GROUP's AI Studio."
        keywords="AI studio, image generation, travel content, VANIR GROUP"
      />
      <Navbar />
      <StudioHero />
      <CreativeTools />
      <FeaturedGallery />
      <FeaturedVideos />
      <HowItWorks />
      <StudioCTA />
      <Footer />
      <BackToTop />
    </div>
  );
}
