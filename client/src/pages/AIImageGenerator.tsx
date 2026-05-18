/**
 * AI Image Generator - Ultra Modern Futuristic Design
 * Features: Animated rainbow gradient border on prompt, glassmorphism,
 * particle effects, modern image display with lightbox
 * Supports 4 AI Models: DALL-E 3, Nano Banana, Nano Banana Pro, Nano Banana 2
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Download,
  Loader2,
  Sparkles,
  Zap,
  Wand2,
  X,
  Maximize2,
  Copy,
  Share2,
  ChevronDown,
  Image as ImageIcon,
  RefreshCw,
  Settings2,
  Layers,
  Palette,
  ArrowRight,
  FileImage,
  Coins,
  Info,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import PageMeta from "@/components/PageMeta";
import { GoldDustParticles, AmbientGlow } from "@/components/ElegantEffects";
import { toast } from "sonner";

/* ─── Elegant Gold Border CSS (injected once) ─── */
const STYLE_ID = "ai-elegant-style";
function injectRainbowStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes goldFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.005); }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .gold-border {
      position: relative;
      z-index: 0;
    }
    .gold-border::before {
      content: "";
      position: absolute;
      inset: -1.5px;
      z-index: -1;
      border-radius: inherit;
      background: linear-gradient(
        135deg,
        #D4A853, #F5E6B8, #D4A853, #B8860B, #D4A853, #F5E6B8, #D4A853
      );
      background-size: 300% 300%;
      animation: goldFlow 6s ease infinite;
      filter: blur(2px);
      opacity: 0.6;
    }
    .gold-border::after {
      content: "";
      position: absolute;
      inset: -1px;
      z-index: -1;
      border-radius: inherit;
      background: linear-gradient(
        135deg,
        #D4A853, #F5E6B8, #D4A853, #B8860B, #D4A853
      );
      background-size: 300% 300%;
      animation: goldFlow 6s ease infinite;
      opacity: 0.8;
    }
    .shimmer-overlay {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: inherit;
    }
    .shimmer-overlay::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(212,168,83,0.04) 50%,
        transparent 100%
      );
      animation: shimmer 4s ease-in-out infinite;
    }
    .glass-card {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .glass-card-hover:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(212,168,83,0.3);
    }
    .generating-pulse {
      animation: pulseGlow 2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

/* Floating particles replaced by shared GoldDustParticles component */

/* ─── Prompt Suggestions ─── */
const PROMPT_SUGGESTIONS = [
  "A luxury Nile cruise at sunset with golden reflections on water",
  "Ancient Egyptian temple illuminated by moonlight, cinematic style",
  "Crystal clear Red Sea underwater coral reef with tropical fish",
  "Aerial view of the Pyramids of Giza at golden hour",
  "A modern luxury resort in Sharm El Sheikh with infinity pool",
  "Traditional Egyptian market at night with warm lantern lighting",
];

/* ─── Model Type ─── */
type ModelId = "dall-e-3" | "nano-banana" | "nano-banana-pro" | "nano-banana-2";

/* ─── AI Models ─── */
const AI_MODELS: Array<{
  id: ModelId;
  name: string;
  provider: string;
  icon: string;
  description: string;
  badge: string;
  badgeColor: string;
  creditCost: string;
  costLabel: string;
}> = [
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    provider: "OpenAI",
    icon: "🎨",
    description: "High-quality, excellent prompt following",
    badge: "Premium",
    badgeColor: "#D4A853",
    creditCost: "2-3",
    costLabel: "credits",
  },
  {
    id: "nano-banana",
    name: "Nano Banana",
    provider: "Gemini 2.5 Flash",
    icon: "🍌",
    description: "Fast generation, text in images, lowest cost",
    badge: "Fast",
    badgeColor: "#4ECDC4",
    creditCost: "1",
    costLabel: "credit",
  },
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    provider: "Gemini 3 Pro",
    icon: "🌟",
    description: "4K studio quality, complex layouts, precise text",
    badge: "4K Studio",
    badgeColor: "#A855F7",
    creditCost: "3",
    costLabel: "credits",
  },
  {
    id: "nano-banana-2",
    name: "Nano Banana 2",
    provider: "Gemini 3.1 Flash",
    icon: "⚡",
    description: "Production-scale, 0.5K-4K, extra aspect ratios",
    badge: "New",
    badgeColor: "#3B82F6",
    creditCost: "2",
    costLabel: "credits",
  },
];

/* ─── Size Options per model ─── */
const DALLE_SIZE_OPTIONS = [
  { value: "1024x1024", label: "Square", ratio: "1:1", credits: 2, icon: "⬜" },
  {
    value: "1792x1024",
    label: "Landscape",
    ratio: "16:9",
    credits: 3,
    icon: "▬",
  },
  {
    value: "1024x1792",
    label: "Portrait",
    ratio: "9:16",
    credits: 3,
    icon: "▮",
  },
];

const NANO_BANANA_SIZE_OPTIONS = [
  { value: "1:1", label: "Square", ratio: "1:1", credits: 1, icon: "⬜" },
  { value: "16:9", label: "Landscape", ratio: "16:9", credits: 1, icon: "▬" },
  { value: "9:16", label: "Portrait", ratio: "9:16", credits: 1, icon: "▮" },
  { value: "4:3", label: "Standard", ratio: "4:3", credits: 1, icon: "📐" },
  { value: "3:4", label: "Tall", ratio: "3:4", credits: 1, icon: "📏" },
];

const NANO_BANANA_PRO_SIZE_OPTIONS = [
  { value: "1:1", label: "Square", ratio: "1:1", credits: 3, icon: "⬜" },
  { value: "16:9", label: "Landscape", ratio: "16:9", credits: 3, icon: "▬" },
  { value: "9:16", label: "Portrait", ratio: "9:16", credits: 3, icon: "▮" },
  { value: "4:3", label: "Standard", ratio: "4:3", credits: 3, icon: "📐" },
  { value: "3:4", label: "Tall", ratio: "3:4", credits: 3, icon: "📏" },
];

const NANO_BANANA_2_SIZE_OPTIONS = [
  { value: "1:1", label: "Square", ratio: "1:1", credits: 2, icon: "⬜" },
  { value: "16:9", label: "Landscape", ratio: "16:9", credits: 2, icon: "▬" },
  { value: "9:16", label: "Portrait", ratio: "9:16", credits: 2, icon: "▮" },
  { value: "4:3", label: "Standard", ratio: "4:3", credits: 2, icon: "📐" },
  { value: "3:4", label: "Tall", ratio: "3:4", credits: 2, icon: "📏" },
  { value: "1:4", label: "Ultra Tall", ratio: "1:4", credits: 2, icon: "📱" },
  { value: "4:1", label: "Ultra Wide", ratio: "4:1", credits: 2, icon: "🖥️" },
];

/** Get size options for a given model */
function getSizeOptions(model: ModelId) {
  switch (model) {
    case "dall-e-3":
      return DALLE_SIZE_OPTIONS;
    case "nano-banana":
      return NANO_BANANA_SIZE_OPTIONS;
    case "nano-banana-pro":
      return NANO_BANANA_PRO_SIZE_OPTIONS;
    case "nano-banana-2":
      return NANO_BANANA_2_SIZE_OPTIONS;
  }
}

/** Get credit cost for a given model and size */
function getCreditCost(
  model: ModelId,
  imageSize: string,
  aspectRatio: string,
): number {
  if (model === "dall-e-3") {
    return DALLE_SIZE_OPTIONS.find((s) => s.value === imageSize)?.credits || 2;
  }
  const options = getSizeOptions(model);
  return (
    options.find((s) => s.value === aspectRatio)?.credits ||
    (model === "nano-banana-pro" ? 3 : model === "nano-banana-2" ? 2 : 1)
  );
}

/** Check if model is a Gemini/Nano Banana model */
function isGeminiModel(model: ModelId): boolean {
  return model !== "dall-e-3";
}

/** Get display name for revised prompt label */
function getModelLabel(model: ModelId): string {
  switch (model) {
    case "dall-e-3":
      return "DALL-E 3";
    case "nano-banana":
      return "Nano Banana";
    case "nano-banana-pro":
      return "Nano Banana Pro";
    case "nano-banana-2":
      return "Nano Banana 2";
  }
}

/* ─── Style Presets (maps to DALL-E 3 style + prompt prefix) ─── */
const STYLE_PRESETS = [
  {
    id: "vivid",
    label: "Vivid",
    color: "#D4A853",
    dalleStyle: "vivid" as const,
    prefix: "",
  },
  {
    id: "natural",
    label: "Natural",
    color: "#4ECDC4",
    dalleStyle: "natural" as const,
    prefix: "",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    color: "#C9A96E",
    dalleStyle: "vivid" as const,
    prefix: "cinematic photography style, ",
  },
  {
    id: "artistic",
    label: "Artistic",
    color: "#FF6B6B",
    dalleStyle: "vivid" as const,
    prefix: "artistic painting style, ",
  },
  {
    id: "vintage",
    label: "Vintage",
    color: "#8B7355",
    dalleStyle: "natural" as const,
    prefix: "vintage film photography style, ",
  },
  {
    id: "dramatic",
    label: "Dramatic",
    color: "#F38181",
    dalleStyle: "vivid" as const,
    prefix: "dramatic lighting, high contrast, ",
  },
];

export default function AIImageGenerator() {
  const { isAuthenticated, user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>("dall-e-3");
  const [imageSize, setImageSize] = useState("1024x1024");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [selectedStyle, setSelectedStyle] = useState("vivid");
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    injectRainbowStyles();
  }, []);

  // Fetch user credits
  const { data: credits } = trpc.aiStudio.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch subscription
  const { data: subscription } = trpc.aiStudio.getSubscription.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    },
  );

  // Real image generation mutation
  const generateMutation = trpc.aiStudio.generateImage.useMutation();
  const utils = trpc.useUtils();

  const currentSizeOptions = getSizeOptions(selectedModel);
  const currentCost = getCreditCost(selectedModel, imageSize, aspectRatio);
  const currentStylePreset = STYLE_PRESETS.find((s) => s.id === selectedStyle);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg" | "webp">(
    "png",
  );
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showLightboxFormatMenu, setShowLightboxFormatMenu] = useState(false);

  const FORMAT_OPTIONS = [
    { value: "png" as const, label: "PNG", desc: "Lossless, best quality" },
    {
      value: "jpg" as const,
      label: "JPG",
      desc: "Smaller size, great quality",
    },
    { value: "webp" as const, label: "WebP", desc: "Modern, smallest size" },
  ];

  /** Download image via server proxy with format conversion */
  const handleDownloadImage = async (
    url: string,
    format?: "png" | "jpg" | "webp",
  ) => {
    if (isDownloading) return;
    setIsDownloading(true);
    setShowFormatMenu(false);
    setShowLightboxFormatMenu(false);
    const fmt = format || downloadFormat;
    try {
      const baseName = `vanir-ai-${Date.now()}`;
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(baseName)}&format=${fmt}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${baseName}.${fmt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success(`Image downloaded as ${fmt.toUpperCase()}!`);
    } catch {
      toast.error("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!credits || parseFloat(credits.balance.toString()) < currentCost) {
      toast.error("Insufficient credits. Please upgrade your plan.");
      return;
    }

    setIsGenerating(true);
    setRevisedPrompt(null);
    try {
      // Build the final prompt with style prefix
      const stylePrefix = currentStylePreset?.prefix || "";
      const finalPrompt = stylePrefix + prompt.trim();

      const isGemini = isGeminiModel(selectedModel);

      const result = await generateMutation.mutateAsync({
        prompt: finalPrompt,
        model: selectedModel,
        size: !isGemini
          ? (imageSize as "1024x1024" | "1792x1024" | "1024x1792")
          : "1024x1024",
        style: currentStylePreset?.dalleStyle || "vivid",
        quality: !isGemini && currentCost >= 3 ? "hd" : "standard",
        aspectRatio: isGemini
          ? (aspectRatio as
              | "1:1"
              | "16:9"
              | "9:16"
              | "4:3"
              | "3:4"
              | "1:4"
              | "4:1")
          : "1:1",
        creditCost: currentCost,
      });

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setGenerationHistory((prev) => [result.imageUrl!, ...prev.slice(0, 7)]);
        if (result.revisedPrompt) {
          setRevisedPrompt(result.revisedPrompt);
        }
        toast.success("Image generated successfully!");
      }

      // Refresh credits
      utils.aiStudio.getCredits.invalidate();
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to generate image";
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-hidden">
      <Navbar />
      <PageMeta
        title="AI Image Generator - Create Stunning Travel Photos"
        description="Generate stunning travel destination photos with AI. Create unique Egypt-inspired artwork and travel visuals instantly."
        keywords="AI image generator, travel AI art, Egypt AI images, AI travel poster"
        canonicalPath="/ai-image-generator"
      />

      {/* Background Effects - Refined Gold Ambiance */}
      <div className="fixed inset-0 pointer-events-none">
        <AmbientGlow position="top-left" size="lg" />
        <AmbientGlow position="bottom-right" size="md" />
        <GoldDustParticles count={18} />
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #D4A853 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] px-5 py-2.5 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
              <span className="text-white/50 text-sm font-medium">
                AI Studio
              </span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[var(--theme-primary)] text-sm font-medium">
                Image Generator
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              <span className="text-white">Create with </span>
              <span className="bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary-light)] to-[var(--theme-primary)] bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
              Transform your imagination into stunning travel visuals with our
              premium AI models.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* ─── LEFT: Generator Panel (3 cols) ─── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3 space-y-5"
            >
              {/* Prompt Area with Elegant Gold Border */}
              <div
                className={`gold-border rounded-2xl ${isGenerating ? "generating-pulse" : ""}`}
              >
                <div className="bg-[#0a0a10] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wand2
                        size={16}
                        className="text-[var(--theme-primary)]"
                      />
                      <span className="text-sm font-medium text-white/70">
                        Prompt
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="flex items-center gap-1 text-xs text-[var(--theme-primary)]/60 hover:text-[var(--theme-primary)] transition-colors"
                    >
                      <Sparkles size={12} />
                      Suggestions
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${showSuggestions ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  <textarea
                    ref={promptRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your dream travel image..."
                    rows={4}
                    className="w-full bg-transparent text-white placeholder:text-white/20 resize-none focus:outline-none text-base leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                        handleGenerateImage();
                    }}
                  />

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 border-t border-white/5 pt-3"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {PROMPT_SUGGESTIONS.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setPrompt(suggestion);
                                setShowSuggestions(false);
                              }}
                              className="text-left text-xs text-white/40 hover:text-[var(--theme-primary)] hover:bg-white/5 rounded-lg px-3 py-2 transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bottom Bar */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/30">
                      <span>{prompt.length}/500</span>
                      <span className="text-white/10">|</span>
                      <span>Ctrl+Enter to generate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {prompt && (
                        <button
                          onClick={() => setPrompt("")}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Selector - 4 Models in 2x2 Grid */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-[var(--theme-primary)]" />
                    <span className="text-sm font-medium text-white/70">
                      AI Model
                    </span>
                  </div>
                  {isAuthenticated && credits && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20">
                      <Coins
                        size={12}
                        className="text-[var(--theme-primary)]"
                      />
                      <span className="text-xs font-semibold text-[var(--theme-primary)]">
                        {parseFloat(credits.balance).toFixed(0)}
                      </span>
                      <span className="text-[10px] text-white/40">credits</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        if (isGeminiModel(model.id)) {
                          setAspectRatio("1:1");
                        } else {
                          setImageSize("1024x1024");
                        }
                      }}
                      className={`relative p-4 rounded-xl text-left transition-all duration-300 ${
                        selectedModel === model.id
                          ? "bg-[var(--theme-primary)]/10 border-2 border-[var(--theme-primary)]/50"
                          : "glass-card glass-card-hover border-2 border-transparent"
                      }`}
                    >
                      {/* Top badges row */}
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: model.badgeColor + "20",
                            color: model.badgeColor,
                          }}
                        >
                          {model.badge}
                        </span>
                      </div>
                      <span className="text-2xl block mb-2">{model.icon}</span>
                      <span className="text-sm font-semibold text-white block">
                        {model.name}
                      </span>
                      <span className="text-[10px] text-white/30 block">
                        {model.provider}
                      </span>
                      <span className="text-[10px] text-white/40 mt-1 block leading-relaxed">
                        {model.description}
                      </span>
                      {/* Credit cost indicator */}
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5">
                        <Coins
                          size={10}
                          className="text-[var(--theme-primary)]/70"
                        />
                        <span className="text-[11px] font-semibold text-[var(--theme-primary)]">
                          {model.creditCost}
                        </span>
                        <span className="text-[10px] text-white/30">
                          {model.costLabel} / image
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Presets (only for DALL-E) */}
              {selectedModel === "dall-e-3" && (
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette
                      size={16}
                      className="text-[var(--theme-primary)]"
                    />
                    <span className="text-sm font-medium text-white/70">
                      Style
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_PRESETS.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                          selectedStyle === style.id
                            ? "text-[#0a0a10]"
                            : "glass-card text-white/50 hover:text-white/80"
                        }`}
                        style={
                          selectedStyle === style.id
                            ? { background: style.color }
                            : {}
                        }
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={16} className="text-[var(--theme-primary)]" />
                  <span className="text-sm font-medium text-white/70">
                    {isGeminiModel(selectedModel)
                      ? "Aspect Ratio"
                      : "Size & Resolution"}
                  </span>
                </div>
                <div
                  className={`grid gap-3 ${currentSizeOptions.length > 5 ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-7" : currentSizeOptions.length > 3 ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-3"}`}
                >
                  {currentSizeOptions.map((size) => {
                    const isSelected = isGeminiModel(selectedModel)
                      ? aspectRatio === size.value
                      : imageSize === size.value;
                    return (
                      <button
                        key={size.value}
                        onClick={() => {
                          if (isGeminiModel(selectedModel)) {
                            setAspectRatio(size.value);
                          } else {
                            setImageSize(size.value);
                          }
                        }}
                        className={`p-4 rounded-xl text-center transition-all duration-300 ${
                          isSelected
                            ? "bg-[var(--theme-primary)]/15 border-2 border-[var(--theme-primary)]/50"
                            : "glass-card glass-card-hover border-2 border-transparent"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{size.icon}</span>
                        <span className="text-sm font-medium text-white block">
                          {size.label}
                        </span>
                        <span className="text-xs text-white/30 block">
                          {size.ratio}
                        </span>
                        <div
                          className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSelected
                              ? "bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          <Coins
                            size={8}
                            className={
                              isSelected
                                ? "text-[var(--theme-primary)]"
                                : "text-white/30"
                            }
                          />
                          {size.credits}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── Cost Summary Bar ─── */}
              <div className="rounded-2xl overflow-hidden border border-[var(--theme-primary)]/20">
                <div className="bg-gradient-to-r from-[var(--theme-primary)]/10 via-[var(--theme-primary)]/5 to-[var(--theme-primary)]/10 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)]/15 flex items-center justify-center">
                        <Coins
                          size={16}
                          className="text-[var(--theme-primary)]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/30 block">
                          Generation Cost
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-medium text-white/60">
                            {getModelLabel(selectedModel)}
                          </span>
                          <span className="text-white/15">•</span>
                          <span className="text-sm text-white/40">
                            {isGeminiModel(selectedModel)
                              ? aspectRatio
                              : currentSizeOptions.find(
                                  (s) => s.value === imageSize,
                                )?.ratio || imageSize}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[var(--theme-primary)]">
                          {currentCost}
                        </span>
                        <span className="text-xs text-white/40">
                          credit{currentCost > 1 ? "s" : ""}
                        </span>
                      </div>
                      {isAuthenticated && credits && (
                        <span
                          className={`text-[10px] ${
                            parseFloat(credits.balance) >= currentCost
                              ? "text-green-400/70"
                              : "text-red-400/70"
                          }`}
                        >
                          {parseFloat(credits.balance) >= currentCost
                            ? `${parseFloat(credits.balance).toFixed(0)} available`
                            : "Insufficient credits"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generate Button - integrated into cost bar */}
                <motion.button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !prompt.trim()}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  className={`w-full py-4 font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-500 ${
                    isGenerating
                      ? "bg-white/5 text-white/40 cursor-wait"
                      : prompt.trim()
                        ? "bg-gradient-to-r from-[var(--theme-primary)] via-[#E5B86B] to-[var(--theme-primary)] text-[#0a0a10] hover:shadow-lg hover:shadow-[var(--theme-primary)]/20"
                        : "bg-white/5 text-white/20 cursor-not-allowed"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="relative w-5 h-5">
                        <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                        <div className="absolute inset-0 border-2 border-t-[var(--theme-primary)] rounded-full animate-spin" />
                      </div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Image
                      <ArrowRight size={16} className="opacity-60" />
                    </>
                  )}
                </motion.button>
              </div>

              {!isAuthenticated && (
                <button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="w-full py-3 rounded-2xl glass-card text-[var(--theme-primary)] font-medium hover:bg-[var(--theme-primary)]/10 transition-all"
                >
                  Sign In to Generate
                </button>
              )}
            </motion.div>

            {/* ─── RIGHT: Sidebar (2 cols) ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2 space-y-5"
            >
              {/* Credits Card */}
              {isAuthenticated && (
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                  <div className="shimmer-overlay" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-[var(--theme-primary)]" />
                      <span className="text-sm font-medium text-white/70">
                        Credits
                      </span>
                    </div>
                    <a
                      href="/ai-pricing"
                      className="text-xs text-[var(--theme-primary)]/60 hover:text-[var(--theme-primary)] transition-colors"
                    >
                      Upgrade
                    </a>
                  </div>

                  <div className="text-4xl font-bold text-white mb-1">
                    {credits?.balance
                      ? Math.floor(parseFloat(credits.balance.toString()))
                      : 0}
                  </div>
                  <p className="text-white/30 text-xs mb-4">
                    credits remaining
                  </p>

                  {/* Progress Ring */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#D4A853"
                          strokeWidth="3"
                          strokeDasharray={`${Math.min(((credits?.balance ? parseFloat(credits.balance.toString()) : 0) / 100) * 94, 94)} 94`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">
                        Plan:{" "}
                        <span className="text-white capitalize">
                          {subscription?.plan || "Free"}
                        </span>
                      </p>
                      <p className="text-xs text-white/30">This month</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Image Preview */}
              <AnimatePresence>
                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setShowLightbox(true)}
                    >
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className={`w-full object-cover ${
                          (selectedModel === "dall-e-3" &&
                            imageSize === "1792x1024") ||
                          (isGeminiModel(selectedModel) &&
                            (aspectRatio === "16:9" || aspectRatio === "4:1"))
                            ? "aspect-video"
                            : (selectedModel === "dall-e-3" &&
                                  imageSize === "1024x1792") ||
                                (isGeminiModel(selectedModel) &&
                                  (aspectRatio === "9:16" ||
                                    aspectRatio === "1:4"))
                              ? "aspect-[9/16] max-h-[500px]"
                              : "aspect-square"
                        }`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <Maximize2
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          size={32}
                        />
                      </div>
                    </div>

                    {/* Revised Prompt from AI */}
                    {revisedPrompt && (
                      <div className="px-4 py-3 border-t border-white/5">
                        <p className="text-[10px] text-[var(--theme-primary)]/60 uppercase tracking-wider mb-1">
                          {getModelLabel(selectedModel)} Revised Prompt
                        </p>
                        <p className="text-xs text-white/40 leading-relaxed line-clamp-3">
                          {revisedPrompt}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="p-3 flex gap-2">
                      {/* Download with format selector */}
                      <div className="relative flex-1 flex">
                        <button
                          onClick={() => handleDownloadImage(generatedImage)}
                          disabled={isDownloading}
                          className="flex-1 py-2 rounded-l-xl glass-card text-xs font-medium text-white/60 hover:text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 border-r border-white/10"
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />{" "}
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={14} />{" "}
                              {downloadFormat.toUpperCase()}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowFormatMenu(!showFormatMenu)}
                          className="py-2 px-2 rounded-r-xl glass-card text-white/40 hover:text-white transition-colors"
                        >
                          <ChevronDown
                            size={12}
                            className={`transition-transform ${showFormatMenu ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {showFormatMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden z-20 border border-white/10 bg-[var(--card)]/95 backdrop-blur-xl shadow-xl"
                            >
                              {FORMAT_OPTIONS.map((fmt) => (
                                <button
                                  key={fmt.value}
                                  onClick={() => {
                                    setDownloadFormat(fmt.value);
                                    setShowFormatMenu(false);
                                    handleDownloadImage(
                                      generatedImage,
                                      fmt.value,
                                    );
                                  }}
                                  className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors hover:bg-white/10 ${
                                    downloadFormat === fmt.value
                                      ? "text-[var(--theme-primary)]"
                                      : "text-white/60"
                                  }`}
                                >
                                  <FileImage size={12} />
                                  <div>
                                    <span className="text-xs font-medium">
                                      {fmt.label}
                                    </span>
                                    <span className="text-[10px] text-white/30 ml-1.5">
                                      {fmt.desc}
                                    </span>
                                  </div>
                                  {downloadFormat === fmt.value && (
                                    <Check
                                      size={12}
                                      className="ml-auto text-[var(--theme-primary)]"
                                    />
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedImage);
                          toast.success("Image URL copied!");
                        }}
                        className="py-2 px-3 rounded-xl glass-card text-white/40 hover:text-white transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedImage(null);
                          setPrompt("");
                          setRevisedPrompt(null);
                        }}
                        className="py-2 px-3 rounded-xl glass-card text-white/40 hover:text-white transition-colors"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generation History */}
              {generationHistory.length > 0 && (
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon
                      size={16}
                      className="text-[var(--theme-primary)]"
                    />
                    <span className="text-sm font-medium text-white/70">
                      Recent
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {generationHistory.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setGeneratedImage(img);
                          setShowLightbox(true);
                        }}
                        className="aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-[var(--theme-primary)]/30 transition-all"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2
                    size={16}
                    className="text-[var(--theme-primary)]"
                  />
                  <span className="text-sm font-medium text-white/70">
                    Pro Tips
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    "Be specific about location, time of day, and mood",
                    "Include lighting details: golden hour, moonlit, neon",
                    "Mention camera style: aerial, close-up, panoramic",
                    "Add atmosphere: misty, dramatic, serene, vibrant",
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className="w-1 h-1 rounded-full bg-[var(--theme-primary)]/50 mt-2 shrink-0" />
                      <p className="text-xs text-white/30 leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && generatedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={generatedImage}
                alt="Generated"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute -top-12 right-0 p-2 rounded-full glass-card text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-3">
                {/* Lightbox Download with format selector */}
                <div className="relative flex">
                  <button
                    onClick={() => handleDownloadImage(generatedImage)}
                    disabled={isDownloading}
                    className="px-4 py-2 rounded-l-xl glass-card text-sm text-white/60 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50 border-r border-white/10"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={16} /> Download{" "}
                        {downloadFormat.toUpperCase()}
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLightboxFormatMenu(!showLightboxFormatMenu);
                    }}
                    className="px-3 py-2 rounded-r-xl glass-card text-white/40 hover:text-white transition-colors"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${showLightboxFormatMenu ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {showLightboxFormatMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 mt-2 w-56 rounded-xl overflow-hidden z-50 border border-white/10 bg-[var(--card)]/95 backdrop-blur-xl shadow-2xl"
                      >
                        {FORMAT_OPTIONS.map((fmt) => (
                          <button
                            key={fmt.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDownloadFormat(fmt.value);
                              setShowLightboxFormatMenu(false);
                              handleDownloadImage(generatedImage, fmt.value);
                            }}
                            className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors hover:bg-white/10 ${
                              downloadFormat === fmt.value
                                ? "text-[var(--theme-primary)]"
                                : "text-white/60"
                            }`}
                          >
                            <FileImage size={14} />
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                {fmt.label}
                              </span>
                              <span className="text-xs text-white/30 ml-2">
                                {fmt.desc}
                              </span>
                            </div>
                            {downloadFormat === fmt.value && (
                              <Check
                                size={14}
                                className="text-[var(--theme-primary)]"
                              />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedImage);
                    toast.success("URL copied!");
                  }}
                  className="px-5 py-2 rounded-xl glass-card text-sm text-white/60 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
