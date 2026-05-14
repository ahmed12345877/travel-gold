/**
 * Shared Marketing Content Generator Component
 * Used by all marketing tools (Social Media, Email, Trip Description, Blog SEO, Ad Copy)
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  Check,
  Heart,
  Trash2,
  Loader2,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  Clock,
  Hash,
  Globe,
  Palette,
  MapPin,
  FileText,
  Star,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";

/* ─── Types ─── */
type ContentType = "social_media" | "email" | "trip_description" | "blog_seo" | "ad_copy";

interface GeneratorConfig {
  type: ContentType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  platforms?: { value: string; label: string; icon?: React.ReactNode }[];
  tones?: { value: string; label: string }[];
  placeholderPrompt: string;
  promptHints: string[];
}

/* ─── Section Title ─── */
function SectionTitle({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--theme-primary)]" />
        <span className="text-[var(--theme-primary)] text-sm tracking-[0.3em] uppercase font-light">{subtitle}</span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--theme-primary)]" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
    </div>
  );
}

/* ─── Tone Options ─── */
const DEFAULT_TONES = [
  { value: "luxurious", label: "Luxurious" },
  { value: "adventurous", label: "Adventurous" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "romantic", label: "Romantic" },
  { value: "cultural", label: "Cultural" },
];

/* ─── Language Options ─── */
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ru", label: "Russian" },
];

/* ─── Egyptian Destinations ─── */
const DESTINATIONS = [
  "Cairo & Pyramids of Giza",
  "Luxor & Valley of the Kings",
  "Aswan & Abu Simbel",
  "Hurghada & Red Sea",
  "Sharm El Sheikh",
  "Alexandria",
  "Siwa Oasis",
  "White Desert",
  "Nile Cruise",
  "Dahab",
  "Marsa Alam",
  "Fayoum",
];

/* ─── Main Component ─── */
export default function MarketingGenerator({ config }: { config: GeneratorConfig }) {
  const { isAuthenticated, user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState(config.platforms?.[0]?.value || "");
  const [tone, setTone] = useState("luxurious");
  const [language, setLanguage] = useState("en");
  const [destination, setDestination] = useState("");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const generateMutation = trpc.marketing.generate.useMutation({
    onSuccess: () => {
      toast.success("Content generated successfully!");
      historyQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate content");
    },
  });

  const historyQuery = trpc.marketing.listContent.useQuery(
    { type: config.type, limit: 10 },
    { enabled: isAuthenticated }
  );

  const toggleFavoriteMutation = trpc.marketing.toggleFavorite.useMutation({
    onSuccess: () => historyQuery.refetch(),
  });

  const deleteMutation = trpc.marketing.deleteContent.useMutation({
    onSuccess: () => {
      toast.success("Content deleted");
      historyQuery.refetch();
    },
  });

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    generateMutation.mutate({
      type: config.type,
      platform: platform || undefined,
      prompt: prompt.trim(),
      language,
      tone,
      destination: destination || undefined,
    });
  }, [prompt, platform, tone, language, destination, config.type, generateMutation]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const result = generateMutation.data;
  const isLoading = generateMutation.isPending;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-400 mb-8">Please login to use the marketing tools.</p>
          <a
            href={getLoginUrl()}
            className="px-8 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8922D] text-black font-bold rounded-lg"
          >
            Login Now
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back link */}
          <Link href="/marketing">
            <button className="flex items-center gap-2 text-gray-400 hover:text-[var(--theme-primary)] transition-colors mb-6 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Marketing Suite
            </button>
          </Link>

          <SectionTitle subtitle={config.subtitle} title={config.title} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ─── Left: Input Panel ─── */}
            <div className="lg:col-span-1">
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 sticky top-28">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  {config.icon}
                  Configuration
                </h3>

                {/* Platform selector */}
                {config.platforms && config.platforms.length > 0 && (
                  <div className="mb-4">
                    <label className="text-gray-400 text-sm mb-2 block">Platform</label>
                    <div className="grid grid-cols-2 gap-2">
                      {config.platforms.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPlatform(p.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                            platform === p.value
                              ? "bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]"
                              : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[var(--theme-primary)]/30"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tone */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" /> Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                      focus:border-[var(--theme-primary)] focus:outline-none"
                  >
                    {(config.tones || DEFAULT_TONES).map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                      focus:border-[var(--theme-primary)] focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Destination (Optional)
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                      focus:border-[var(--theme-primary)] focus:outline-none"
                  >
                    <option value="">Any destination</option>
                    {DESTINATIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Prompt */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Your Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={config.placeholderPrompt}
                    rows={4}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                      focus:border-[var(--theme-primary)] focus:outline-none resize-none placeholder:text-gray-600"
                  />
                  {/* Prompt hints */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {config.promptHints.map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setPrompt(hint)}
                        className="text-xs px-2 py-1 rounded-full bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a]
                          hover:border-[var(--theme-primary)]/30 hover:text-[var(--theme-primary)] transition-colors cursor-pointer"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8922D] text-black font-bold rounded-lg
                    hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all duration-300 disabled:opacity-50
                    disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Content
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* ─── Right: Result & History ─── */}
            <div className="lg:col-span-2">
              {/* Generated Result */}
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-8 mb-6"
                  >
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <div className="w-16 h-16 border-2 border-[var(--theme-primary)]/20 rounded-full animate-spin" />
                        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[var(--theme-primary)] rounded-full animate-spin" />
                      </div>
                      <p className="text-gray-400 mt-6 text-sm">AI is crafting your content...</p>
                      <p className="text-gray-600 mt-1 text-xs">This usually takes 5-15 seconds</p>
                    </div>
                  </motion.div>
                )}

                {result && !isLoading && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#111111] border border-[var(--theme-primary)]/30 rounded-xl p-6 mb-6"
                  >
                    {/* Result Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{result.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {result.platform && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                              {result.platform}
                            </span>
                          )}
                          {result.metadata?.wordCount && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {result.metadata.wordCount} words
                            </span>
                          )}
                          {result.metadata?.readingTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {result.metadata.readingTime} min read
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(result.content)}
                          className="p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400
                            hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]/30 transition-colors"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setPrompt("");
                            generateMutation.reset();
                          }}
                          className="p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400
                            hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]/30 transition-colors"
                          title="New generation"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-[var(--theme-background)] rounded-lg p-5 border border-[#1a1a1a] mb-4">
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                        <Streamdown>{result.content}</Streamdown>
                      </div>
                    </div>

                    {/* Hashtags */}
                    {result.hashtags && result.hashtags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4 text-[var(--theme-primary)]" />
                          <span className="text-sm text-gray-400">Hashtags</span>
                          <button
                            onClick={() => handleCopy(result.hashtags.map((h: string) => `#${h}`).join(" "))}
                            className="text-xs text-[var(--theme-primary)] hover:underline ml-auto"
                          >
                            Copy all
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.hashtags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20
                                cursor-pointer hover:bg-[var(--theme-primary)]/20 transition-colors"
                              onClick={() => handleCopy(`#${tag}`)}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SEO Score (for blog content) */}
                    {result.metadata?.seoScore > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-[var(--theme-background)] rounded-lg border border-[#1a1a1a]">
                        <Star className="w-4 h-4 text-[var(--theme-primary)]" />
                        <span className="text-sm text-gray-400">SEO Score:</span>
                        <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${result.metadata.seoScore}%`,
                              backgroundColor: result.metadata.seoScore > 70 ? "#4ade80" : result.metadata.seoScore > 40 ? "#D4A853" : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white">{result.metadata.seoScore}/100</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {!result && !isLoading && (
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-12 mb-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[var(--theme-primary)]" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Ready to Create</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Configure your settings on the left, enter a prompt, and click Generate to create
                    AI-powered marketing content.
                  </p>
                </div>
              )}

              {/* History Toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-gray-400 hover:text-[var(--theme-primary)] transition-colors mb-4 text-sm"
              >
                <Clock className="w-4 h-4" />
                Previous Generations ({historyQuery.data?.total || 0})
                <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
              </button>

              {/* History List */}
              <AnimatePresence>
                {showHistory && historyQuery.data?.items && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {historyQuery.data.items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No previous generations yet
                      </div>
                    ) : (
                      historyQuery.data.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 hover:border-[var(--theme-primary)]/20 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-sm font-medium truncate">{item.title}</h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                {item.platform && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#1a1a1a]">{item.platform}</span>
                                )}
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => handleCopy(item.content)}
                                className="p-1.5 rounded text-gray-500 hover:text-[var(--theme-primary)] transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => toggleFavoriteMutation.mutate({ id: item.id })}
                                className={`p-1.5 rounded transition-colors ${
                                  item.isFavorite === "yes" ? "text-red-500" : "text-gray-500 hover:text-red-400"
                                }`}
                              >
                                <Heart className="w-3.5 h-3.5" fill={item.isFavorite === "yes" ? "currentColor" : "none"} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete this content?")) {
                                    deleteMutation.mutate({ id: item.id });
                                  }
                                }}
                                className="p-1.5 rounded text-gray-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs line-clamp-3">{item.content}</p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
