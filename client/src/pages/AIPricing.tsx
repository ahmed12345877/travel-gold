/*
 * AI Pricing - Elegant Modern Design
 * Features: Glassmorphism cards, subtle glow effects, refined animations,
 * gold accent particles, comparison table, smooth transitions
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Shield,
  Infinity,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  Palette,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import AIStudioSidebar from "@/components/AIStudioSidebar";
import PageMeta from "@/components/PageMeta";
import {
  GoldDustParticles,
  AmbientGlow,
  GridPattern,
} from "@/components/ElegantEffects";

/* ─── Plan Data ─── */
const PLANS = [
  {
    id: "free" as const,
    name: "Starter",
    tagline: "Perfect for exploring",
    icon: Sparkles,
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: "10",
    creditsLabel: "credits / month",
    features: [
      "10 AI image generations",
      "Basic DALL-E 3 access",
      "Nano Banana model",
      "Standard quality output",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
    gradient: "from-white/[0.03] to-white/[0.01]",
    borderColor: "border-white/[0.08]",
    iconColor: "text-white/60",
  },
  {
    id: "pro" as const,
    name: "Professional",
    tagline: "For serious creators",
    icon: Crown,
    monthlyPrice: 29,
    yearlyPrice: 290,
    credits: "500",
    creditsLabel: "credits / month",
    features: [
      "500 AI image generations",
      "All 4 AI models unlocked",
      "4K Studio quality (Pro model)",
      "Priority generation queue",
      "Commercial usage rights",
      "Priority email support",
      "Marketing Suite access",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    gradient:
      "from-[var(--theme-primary)]/[0.08] to-[var(--theme-primary)]/[0.02]",
    borderColor: "border-[var(--theme-primary)]/30",
    iconColor: "text-[var(--theme-primary)]",
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    tagline: "For teams & agencies",
    icon: Shield,
    monthlyPrice: -1,
    yearlyPrice: -1,
    credits: "Unlimited",
    creditsLabel: "generations",
    features: [
      "Unlimited AI generations",
      "All models + early access",
      "API access & webhooks",
      "Dedicated account manager",
      "Custom integrations",
      "Team collaboration tools",
      "SLA guarantee",
      "White-label options",
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-white/[0.04] to-white/[0.01]",
    borderColor: "border-white/[0.08]",
    iconColor: "text-purple-400",
  },
];

const FAQ_DATA = [
  {
    q: "Can I change my plan anytime?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any remaining balance.",
  },
  {
    q: "What happens to unused credits?",
    a: "Credits reset monthly. We recommend using your credits within the billing period as they do not carry over.",
  },
  {
    q: "Which AI model should I use?",
    a: "DALL-E 3 excels at prompt following and artistic styles. Nano Banana is fastest and cheapest. Nano Banana Pro delivers 4K studio quality. Nano Banana 2 offers the best value with unique aspect ratios.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "All users start with the Free plan (10 credits/month). You can upgrade anytime, and we offer a 7-day money-back guarantee on all paid plans.",
  },
];

export default function AIPricing() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: subscription } = trpc.aiStudio.getSubscription.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    },
  );

  const upgradeMutation = trpc.aiStudio.upgradePlan.useMutation();

  const handleUpgrade = async (plan: "free" | "pro" | "enterprise") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    try {
      await upgradeMutation.mutateAsync({ plan });
    } catch (error) {
      console.error("Error upgrading plan:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex">
      <PageMeta
        title="AI Pricing - Choose Your Creative Plan"
        description="Select the perfect AI plan for your creative needs. From free starter to unlimited enterprise."
        canonicalPath="/ai-pricing"
      />
      <AIStudioSidebar />

      <div className="flex-1 ml-16 overflow-hidden">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-28 pb-20 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <img
              src="/manus-storage/hero-ai-pricing_ddfd6c02.webp"
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/60 via-[#050508]/80 to-[#050508]" />
          </div>
          <GridPattern />
          <GoldDustParticles count={15} />
          <AmbientGlow position="top-right" size="lg" />
          <AmbientGlow position="bottom-left" size="md" />

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] px-5 py-2.5 rounded-full mb-8">
                <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                <span className="text-white/60 text-sm font-medium">
                  Simple, transparent pricing
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
                <span className="text-white">Invest in Your</span>{" "}
                <span className="bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary-light)] to-[var(--theme-primary)] bg-clip-text text-transparent">
                  Creative Vision
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                Unlock the full power of AI-driven image generation with plans
                designed for every creator.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 inline-flex items-center bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-full p-1.5"
            >
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "bg-[var(--theme-primary)] text-[var(--theme-background)] shadow-lg shadow-[var(--theme-primary)]/20"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative ${
                  billingCycle === "yearly"
                    ? "bg-[var(--theme-primary)] text-[var(--theme-background)] shadow-lg shadow-[var(--theme-primary)]/20"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  -17%
                </span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="relative pb-24 px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {PLANS.map((plan, idx) => {
                const Icon = plan.icon;
                const price =
                  billingCycle === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice;
                const isCurrent = subscription?.plan === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`relative rounded-2xl border bg-gradient-to-br ${plan.gradient} ${plan.borderColor} p-8 backdrop-blur-sm transition-all duration-500 hover:translate-y-[-4px] ${
                      plan.popular
                        ? "md:scale-[1.03] md:z-10 shadow-xl shadow-[var(--theme-primary)]/10"
                        : "hover:border-white/15"
                    }`}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] text-[var(--theme-background)] px-5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-[var(--theme-primary)]/30">
                          Most Popular
                        </div>
                      </div>
                    )}

                    {/* Plan icon & name */}
                    <div className="mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4 ${plan.popular ? "border-[var(--theme-primary)]/30" : ""}`}
                      >
                        <Icon size={22} className={plan.iconColor} />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {plan.name}
                      </h3>
                      <p className="text-white/40 text-sm mt-1">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-white/[0.06]">
                      {price >= 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">
                            ${price}
                          </span>
                          <span className="text-white/40 text-sm">
                            /{billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-white">
                          Custom
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${plan.popular ? "bg-[var(--theme-primary)]" : "bg-white/30"}`}
                        />
                        <span className="text-white/50 text-sm">
                          {plan.credits} {plan.creditsLabel}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              plan.popular
                                ? "bg-[var(--theme-primary)]/15"
                                : "bg-white/[0.06]"
                            }`}
                          >
                            <Check
                              size={12}
                              className={
                                plan.popular
                                  ? "text-[var(--theme-primary)]"
                                  : "text-white/50"
                              }
                            />
                          </div>
                          <span className="text-sm text-white/60 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl text-sm font-semibold bg-white/[0.05] text-white/40 border border-white/[0.08] cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : plan.popular ? (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--theme-primary)] to-[#E5B86B] text-[var(--theme-background)] hover:shadow-lg hover:shadow-[var(--theme-primary)]/30 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {plan.cta}
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          plan.id === "enterprise"
                            ? undefined
                            : handleUpgrade(plan.id)
                        }
                        className="w-full py-3 rounded-xl text-sm font-semibold border border-white/[0.12] text-white/70 hover:border-[var(--theme-primary)]/30 hover:text-[var(--theme-primary)] transition-all duration-300"
                      >
                        {plan.cta}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Model Comparison */}
        <section className="relative pb-24 px-4 sm:px-6 lg:px-8">
          <AmbientGlow position="center" size="lg" />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                AI Models Included
              </h2>
              <p className="text-white/40 max-w-xl mx-auto">
                Each plan gives you access to powerful AI models optimized for
                different creative needs.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: "🎨",
                  name: "DALL-E 3",
                  desc: "Premium quality, artistic styles",
                  cost: "2-3 credits",
                  color: "#D4A853",
                },
                {
                  icon: "🍌",
                  name: "Nano Banana",
                  desc: "Fast, text-in-image, lowest cost",
                  cost: "1 credit",
                  color: "#4ECDC4",
                },
                {
                  icon: "🌟",
                  name: "Nano Banana Pro",
                  desc: "4K studio, complex layouts",
                  cost: "3 credits",
                  color: "#A855F7",
                },
                {
                  icon: "⚡",
                  name: "Nano Banana 2",
                  desc: "Best value, unique ratios",
                  cost: "2 credits",
                  color: "#F97316",
                },
              ].map((model, i) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 hover:border-white/[0.12] transition-all duration-300 group"
                >
                  <div className="text-3xl mb-3">{model.icon}</div>
                  <h3 className="text-white font-semibold mb-1">
                    {model.name}
                  </h3>
                  <p className="text-white/40 text-xs mb-3">{model.desc}</p>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${model.color}15`,
                      color: model.color,
                    }}
                  >
                    {model.cost}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-white/40">
                Everything you need to know about our plans.
              </p>
            </motion.div>

            <div className="space-y-3">
              {FAQ_DATA.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-white/80 font-medium text-sm pr-4">
                      {faq.q}
                    </span>
                    {openFaq === idx ? (
                      <ChevronUp
                        size={18}
                        className="text-[var(--theme-primary)] flex-shrink-0"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="text-white/30 flex-shrink-0"
                      />
                    )}
                  </button>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-white/50 text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[var(--theme-primary)]/20 bg-gradient-to-br from-[var(--theme-primary)]/[0.06] to-transparent backdrop-blur-sm p-10 md:p-14 text-center relative overflow-hidden"
            >
              <GoldDustParticles count={10} />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Create Something Amazing?
                </h2>
                <p className="text-white/50 max-w-xl mx-auto mb-8">
                  Start with our free plan and upgrade anytime. No credit card
                  required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() =>
                      !isAuthenticated
                        ? (window.location.href = getLoginUrl())
                        : handleUpgrade("pro")
                    }
                    className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--theme-primary)] to-[#E5B86B] text-[var(--theme-background)] hover:shadow-lg hover:shadow-[var(--theme-primary)]/30 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Get Started Now
                    <ArrowRight size={16} />
                  </button>
                  <a
                    href="/ai-image-generator"
                    className="px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/[0.12] text-white/70 hover:border-[var(--theme-primary)]/30 hover:text-[var(--theme-primary)] transition-all duration-300"
                  >
                    Try Free First
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
