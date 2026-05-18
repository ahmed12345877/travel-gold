/*
 * AI Dashboard - Ultra Modern Futuristic Design
 * Features: Glassmorphism, animated stats, gradient cards,
 * modern charts, activity timeline with glow effects
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
} from "recharts";
import {
  Download,
  Zap,
  Image as ImageIcon,
  Video,
  TrendingUp,
  Calendar,
  ArrowRight,
  Crown,
  Sparkles,
  Activity,
  Clock,
  BarChart3,
  Eye,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";

/* ─── Inject styles ─── */
const DASH_STYLE_ID = "ai-dash-style";
function injectDashStyles() {
  if (document.getElementById(DASH_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = DASH_STYLE_ID;
  style.textContent = `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(212,168,83,0.1); }
      50% { box-shadow: 0 0 40px rgba(212,168,83,0.2); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .dash-glass {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .dash-glass-gold {
      background: rgba(212,168,83,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(212,168,83,0.15);
    }
    .stat-glow {
      animation: glowPulse 3s ease-in-out infinite;
    }
    .gradient-text {
      background: linear-gradient(135deg, #D4A853, #E5B86B, #D4A853);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 4s ease infinite;
    }
    .timeline-dot::before {
      content: "";
      position: absolute;
      left: -1px;
      top: 12px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #D4A853;
      box-shadow: 0 0 10px rgba(212,168,83,0.5);
    }
    .timeline-dot::after {
      content: "";
      position: absolute;
      left: 2px;
      top: 24px;
      width: 2px;
      height: calc(100% - 12px);
      background: linear-gradient(to bottom, rgba(212,168,83,0.3), transparent);
    }
  `;
  document.head.appendChild(style);
}

export default function AIDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    injectDashStyles();
  }, []);

  const { data: subscription } = trpc.aiStudio.getSubscription.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    },
  );
  const { data: credits } = trpc.aiStudio.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: stats } = trpc.aiStudio.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: usageHistory } = trpc.aiStudio.getUsageHistory.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated },
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050508] text-white">
        <Navbar />
        <div className="pt-32 pb-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-full dash-glass-gold flex items-center justify-center mx-auto mb-6">
              <Cpu size={32} className="text-[var(--theme-primary)]" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Sign In Required</h1>
            <p className="text-white/30 mb-8 max-w-md mx-auto">
              Access your AI Studio dashboard to track generations, manage
              credits, and view analytics
            </p>
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-[var(--theme-primary)] to-[#E5B86B] text-[#0a0a10] rounded-xl px-8 py-3 font-semibold inline-flex items-center gap-2"
            >
              Sign In <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const creditPlanMap: Record<string, number> = {
    free: 10,
    pro: 100,
    enterprise: 1000,
  };
  const monthlyAllowance = creditPlanMap[subscription?.plan || "free"] || 10;
  const currentBalance = credits?.balance
    ? parseFloat(credits.balance.toString())
    : 0;
  const creditsUsed = Math.max(0, monthlyAllowance - currentBalance);
  const usagePercent =
    monthlyAllowance > 0 ? (creditsUsed / monthlyAllowance) * 100 : 0;

  const usageByType = [
    { name: "Images", value: stats?.byType?.image || 0, color: "#D4A853" },
    { name: "Videos", value: stats?.byType?.video || 0, color: "#8B5CF6" },
    { name: "Edits", value: stats?.byType?.edit || 0, color: "#06B6D4" },
  ];

  // Mock area chart data
  const areaData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    credits: Math.floor(Math.random() * 5 + 1),
    generations: Math.floor(Math.random() * 3 + 1),
  }));

  const statusColors: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400 border-green-500/20",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
    failed: "bg-red-500/20 text-red-400 border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-hidden">
      <Navbar />
      <PageMeta
        title="AI Dashboard - Your Creative Analytics"
        description="Track your AI generation stats, manage credits, and view analytics."
        keywords="AI dashboard, AI analytics, VANIR AI studio"
        canonicalPath="/ai-dashboard"
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[var(--theme-primary)]/3 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-purple-500/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <span className="text-xs dash-glass px-3 py-1 rounded-full text-white/30">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-white/30">
                Welcome back,{" "}
                <span className="text-[var(--theme-primary)]">
                  {user?.name}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="dash-glass rounded-xl p-1 flex gap-1">
                {(["week", "month", "all"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      timeRange === range
                        ? "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    {range === "week"
                      ? "7D"
                      : range === "month"
                        ? "30D"
                        : "All"}
                  </button>
                ))}
              </div>

              <Link href="/ai-image-generator">
                <button className="bg-gradient-to-r from-[var(--theme-primary)] to-[#E5B86B] text-[#0a0a10] rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
                  <Sparkles size={14} />
                  Create
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Credits Available",
                value: Math.floor(currentBalance),
                icon: <Zap size={18} />,
                color: "#D4A853",
                sub: `${monthlyAllowance} monthly`,
                glow: true,
              },
              {
                label: "Current Plan",
                value: subscription?.plan || "Free",
                icon: <Crown size={18} />,
                color: "#8B5CF6",
                sub: subscription?.status === "active" ? "Active" : "Inactive",
                isText: true,
              },
              {
                label: "Total Generations",
                value: stats?.totalGenerations || 0,
                icon: <ImageIcon size={18} />,
                color: "#06B6D4",
                sub: `${stats?.byType?.image || 0} images, ${stats?.byType?.video || 0} videos`,
              },
              {
                label: "Credits Used",
                value: Math.floor(stats?.totalCost || 0),
                icon: <TrendingUp size={18} />,
                color: "#10B981",
                sub: "all time",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`dash-glass rounded-2xl p-5 relative overflow-hidden ${stat.glow ? "stat-glow" : ""}`}
              >
                {/* Background accent */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-10"
                  style={{ background: stat.color }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/30">{stat.label}</span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${stat.color}15`,
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </div>
                  </div>

                  <div
                    className={`text-2xl font-bold mb-1 ${stat.isText ? "capitalize" : ""}`}
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <p className="text-xs text-white/20">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-4 mb-8">
            {/* Credits Usage Ring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="dash-glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/50">
                  Monthly Usage
                </h3>
                <span className="text-xs text-white/20">
                  {Math.floor(usagePercent)}%
                </span>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="relative w-36 h-36">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#creditGrad)"
                      strokeWidth="10"
                      strokeDasharray={`${Math.min(usagePercent, 100) * 3.14} 314`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="creditGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#D4A853" />
                        <stop offset="100%" stopColor="#E5B86B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {Math.floor(creditsUsed)}
                    </span>
                    <span className="text-xs text-white/20">
                      of {monthlyAllowance}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-white/30">Remaining</span>
                <span className="text-xs font-semibold text-[var(--theme-primary)]">
                  {Math.floor(currentBalance)}
                </span>
              </div>
            </motion.div>

            {/* Usage by Type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="dash-glass rounded-2xl p-6"
            >
              <h3 className="text-sm font-medium text-white/50 mb-4">
                By Type
              </h3>

              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={
                      usageByType.filter((d) => d.value > 0).length > 0
                        ? usageByType
                        : [
                            {
                              name: "No data",
                              value: 1,
                              color: "rgba(255,255,255,0.05)",
                            },
                          ]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {usageByType.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-4">
                {usageByType.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span className="text-xs text-white/40">{item.name}</span>
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="dash-glass rounded-2xl p-6"
            >
              <h3 className="text-sm font-medium text-white/50 mb-4">
                Weekly Activity
              </h3>

              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A853" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#D4A853" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.2)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <ReTooltip
                    contentStyle={{
                      background: "rgba(10,10,16,0.9)",
                      border: "1px solid rgba(212,168,83,0.2)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="credits"
                    stroke="#D4A853"
                    fill="url(#areaGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="dash-glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[var(--theme-primary)]" />
                <h3 className="text-sm font-medium text-white/50">
                  Recent Activity
                </h3>
              </div>
              <span className="text-xs text-white/20">
                {(usageHistory || []).length} total
              </span>
            </div>

            {(usageHistory || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full dash-glass flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} className="text-white/10" />
                </div>
                <p className="text-white/20 text-sm mb-4">No activity yet</p>
                <Link href="/ai-image-generator">
                  <button className="text-xs text-[var(--theme-primary)] flex items-center gap-1 mx-auto">
                    Create your first image <ArrowRight size={12} />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/20">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/20">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/20">
                        Credits
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/20">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usageHistory || [])
                      .slice(0, 10)
                      .map((item: any, idx: number) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-white/3 hover:bg-white/2 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-white/15" />
                              <span className="text-xs text-white/40">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {item.type === "image" ? (
                                <ImageIcon
                                  size={14}
                                  className="text-[var(--theme-primary)]"
                                />
                              ) : (
                                <Video size={14} className="text-purple-400" />
                              )}
                              <span className="text-xs text-white/60 capitalize">
                                {item.type}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-semibold text-[var(--theme-primary)]">
                              {parseFloat(item.creditsCost?.toString() || "0")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${statusColors[item.status] || statusColors.pending}`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              {
                label: "Generate Image",
                icon: <ImageIcon size={18} />,
                href: "/ai-image-generator",
                color: "#D4A853",
              },
              {
                label: "AI Studio",
                icon: <Sparkles size={18} />,
                href: "/ai-studio",
                color: "#8B5CF6",
              },
              {
                label: "View Plans",
                icon: <Crown size={18} />,
                href: "/ai-pricing",
                color: "#06B6D4",
              },
              {
                label: "Back to Home",
                icon: <ArrowRight size={18} />,
                href: "/",
                color: "#10B981",
              },
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <Link href={action.href}>
                  <div className="dash-glass rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all group flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${action.color}15`,
                        color: action.color,
                      }}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-white/10 group-hover:text-white/30 transition-colors"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
