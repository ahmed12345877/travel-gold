/**
 * Marketing Suite - Landing page for tourism marketing tools
 * Design: Art Deco Black & Gold consistent with site theme
 */
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  FileText,
  PenTool,
  Calendar,
  BarChart3,
  Megaphone,
  Globe,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Copy,
  Languages,
  Layout,
  ChevronRight,
} from "lucide-react";

/* ─── Section Title (consistent with other pages) ─── */
function SectionTitle({ subtitle, title, description }: { subtitle: string; title: string; description?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--theme-primary)]" />
        <span className="text-[var(--theme-primary)] text-sm tracking-[0.3em] uppercase font-light">{subtitle}</span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--theme-primary)]" />
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">{description}</p>
      )}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="h-px w-16 bg-[var(--theme-primary)]/30" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-3 h-3 border border-[var(--theme-primary)] rotate-45"
        />
        <div className="h-px w-16 bg-[var(--theme-primary)]/30" />
      </div>
    </motion.div>
  );
}

/* ─── Tool Card ─── */
const TOOLS = [
  {
    icon: Instagram,
    title: "Social Media Generator",
    description: "Create engaging posts for Instagram, Facebook, Twitter, LinkedIn & TikTok optimized for each platform.",
    href: "/marketing/social-media",
    color: "#E1306C",
    platforms: ["Instagram", "Facebook", "Twitter", "LinkedIn", "TikTok"],
  },
  {
    icon: Mail,
    title: "Email Campaign Builder",
    description: "Design compelling email campaigns with subject lines, preview text, and persuasive copy that drives bookings.",
    href: "/marketing/email",
    color: "#D4A853",
    platforms: ["Welcome", "Promo", "Newsletter", "Follow-up"],
  },
  {
    icon: FileText,
    title: "Trip Description Writer",
    description: "Generate vivid, immersive trip descriptions in multiple languages that transport readers to the destination.",
    href: "/marketing/trip-description",
    color: "#4ECDC4",
    platforms: ["English", "Arabic", "French", "German", "Spanish"],
  },
  {
    icon: PenTool,
    title: "SEO Blog Generator",
    description: "Create SEO-optimized blog articles about Egyptian travel, culture, and tourism that rank on Google.",
    href: "/marketing/blog-seo",
    color: "#FF6B6B",
    platforms: ["Articles", "Guides", "Lists", "Reviews"],
  },
  {
    icon: Megaphone,
    title: "Ad Copy Creator",
    description: "Write compelling ad copy for Google Ads, Facebook Ads, and Display campaigns with high conversion rates.",
    href: "/marketing/ad-copy",
    color: "#45B7D1",
    platforms: ["Google Ads", "Facebook Ads", "Display"],
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Plan and schedule your marketing content with a visual calendar. Track status and never miss a posting date.",
    href: "/marketing/calendar",
    color: "#96CEB4",
    platforms: ["Schedule", "Track", "Organize", "Plan"],
  },
];

function ToolCard({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
  const Icon = tool.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={tool.href}>
        <div className="group relative bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 h-full cursor-pointer
          hover:border-[var(--theme-primary)]/50 transition-all duration-500 overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[var(--theme-primary)]/20 group-hover:border-[var(--theme-primary)]/60 transition-colors duration-500 rounded-tl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[var(--theme-primary)]/20 group-hover:border-[var(--theme-primary)]/60 transition-colors duration-500 rounded-br-xl" />

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Icon */}
          <div className="relative mb-5">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundColor: `${tool.color}15`, border: `1px solid ${tool.color}30` }}
            >
              <Icon className="w-7 h-7" style={{ color: tool.color }} />
            </div>
          </div>

          {/* Content */}
          <div className="relative">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--theme-primary)] transition-colors duration-300">
              {tool.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {tool.description}
            </p>

            {/* Platform tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tool.platforms.map((p) => (
                <span
                  key={p}
                  className="text-xs px-2 py-1 rounded-full bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a]"
                >
                  {p}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-[var(--theme-primary)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Start Creating</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Feature Highlights ─── */
const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Content",
    description: "Advanced AI generates professional marketing content tailored for the tourism industry.",
  },
  {
    icon: Languages,
    title: "Multi-Language Support",
    description: "Generate content in 10+ languages to reach international travelers worldwide.",
  },
  {
    icon: Target,
    title: "Platform Optimized",
    description: "Content automatically formatted and optimized for each social media platform.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get professional marketing content in seconds, not hours. Save time and resources.",
  },
  {
    icon: TrendingUp,
    title: "SEO Optimized",
    description: "Built-in SEO best practices ensure your content ranks well on search engines.",
  },
  {
    icon: Copy,
    title: "One-Click Copy",
    description: "Copy generated content directly to clipboard. Ready to paste and publish.",
  },
];

/* ─── Stats Section ─── */
function StatsSection() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = trpc.marketing.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || !stats) return null;

  const statItems = [
    { label: "Total Content", value: stats.totalContent, icon: Layout },
    { label: "Social Posts", value: stats.socialMedia, icon: Instagram },
    { label: "Emails", value: stats.emails, icon: Mail },
    { label: "Blog Articles", value: stats.blogPosts, icon: FileText },
    { label: "Calendar Items", value: stats.calendarEntries, icon: Calendar },
  ];

  return (
    <section className="py-16 bg-[var(--theme-background)]">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          subtitle="Your Stats"
          title="Content Dashboard"
          description="Track your marketing content creation progress"
        />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 text-center"
              >
                <Icon className="w-6 h-6 text-[var(--theme-primary)] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function MarketingSuite() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <PageMeta
        title="Marketing Suite | VANIR GROUP"
        description="Professional marketing tools for tourism businesses. Generate social media content, email campaigns, blog posts, and travel descriptions powered by AI."
        keywords="marketing tools, social media generator, email marketing, tourism marketing, content creation"
        canonicalPath="/marketing"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background image + overlay */}
        <div className="absolute inset-0">
          <img src="/manus-storage/hero-marketing_8b0cdcda.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-background)]/90 via-[var(--theme-background)]/80 to-[var(--theme-background)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A853' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--theme-primary)]" />
              <span className="text-[var(--theme-primary)] text-sm tracking-[0.3em] uppercase font-light">Marketing Suite</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--theme-primary)]" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              AI-Powered Marketing
              <br />
              <span className="text-[var(--theme-primary)]">for Tourism Companies</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              Generate professional social media posts, email campaigns, trip descriptions,
              SEO blog articles, and ad copy — all powered by AI and optimized for the tourism industry.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/marketing/social-media">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8922D] text-black font-bold rounded-lg
                      hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] transition-shadow duration-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Start Creating Content
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8922D] text-black font-bold rounded-lg
                      hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] transition-shadow duration-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Login to Get Started
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </a>
              )}
              <Link href="#tools">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-medium rounded-lg
                    hover:border-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5 transition-all duration-300"
                >
                  Explore Tools
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-10 w-20 h-20 border border-[var(--theme-primary)]/10 rotate-45 hidden lg:block"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 left-10 w-16 h-16 border border-[var(--theme-primary)]/10 rotate-45 hidden lg:block"
          />
        </div>
      </section>

      {/* Stats (only for authenticated users) */}
      <StatsSection />

      {/* Tools Grid */}
      <section id="tools" className="py-20 bg-[var(--theme-background)]">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle
            subtitle="Marketing Tools"
            title="Everything You Need"
            description="Powerful AI tools designed specifically for tourism marketing professionals"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool, i) => (
              <ToolCard key={tool.title} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#080808]">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle
            subtitle="Why Choose Us"
            title="Built for Tourism"
            description="Our AI understands the tourism industry and creates content that converts"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[var(--theme-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[var(--theme-background)]">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle
            subtitle="How It Works"
            title="Three Simple Steps"
            description="Create professional marketing content in minutes"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Choose Your Tool", desc: "Select from social media, email, blog, trip descriptions, or ad copy generators." },
              { step: "02", title: "Describe Your Need", desc: "Enter your destination, tone, language, and any specific requirements." },
              { step: "03", title: "Generate & Publish", desc: "Get AI-generated content instantly. Copy, edit, and publish across your channels." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="text-6xl font-bold text-[var(--theme-primary)]/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-[var(--theme-primary)]/20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-[var(--theme-background)] to-[#111111]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[var(--theme-primary)]/20 rounded-2xl p-10 md:p-16"
          >
            <Globe className="w-12 h-12 text-[var(--theme-primary)] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join tourism companies worldwide using AI to create compelling marketing content
              that drives bookings and grows their business.
            </p>
            {isAuthenticated ? (
              <Link href="/marketing/social-media">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8922D] text-black font-bold rounded-lg text-lg
                    hover:shadow-[0_0_40px_rgba(212,168,83,0.3)] transition-shadow duration-300"
                >
                  Start Creating Now
                </motion.button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8922D] text-black font-bold rounded-lg text-lg
                    hover:shadow-[0_0_40px_rgba(212,168,83,0.3)] transition-shadow duration-300"
                >
                  Get Started Free
                </motion.button>
              </a>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
