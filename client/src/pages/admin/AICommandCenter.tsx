import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Bot,
  Send,
  PenTool,
  Search,
  Gift,
  BarChart3,
  Headphones,
  Languages,
  Share2,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Clock,
  MessageSquare,
  ChevronRight,
  Trash2,
  Plus,
  ArrowRight,
  Brain,
  Cpu,
  Activity,
  Wand2,
  FileText,
  Globe,
  TrendingUp,
  Users,
  Mail,
  Hash,
  Lightbulb,
  Star,
  CheckCircle2,
  RefreshCw,
  Paperclip,
  X,
  Image,
  File,
  MapPin,
  Crown,
  Target,
  DollarSign,
  Upload,
  Link2,
  ExternalLink,
  Plug,
  Settings,
  BarChart2,
  Map,
  AlertCircle,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Banana,
  Palette,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const VANIR_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-correct_2a805e1d.png";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface FileAttachment {
  id: string;
  file?: File;
  url: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  uploading?: boolean;
  progress?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  taskType?: string;
  tokens?: number;
  attachments?: FileAttachment[];
}

interface Conversation {
  id: string;
  title: string;
  taskType: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface QuickAction {
  id: string;
  taskType: string;
  name: string;
  nameAr: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  category: string;
  prompts: string[];
}

interface Connector {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  connected: boolean;
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync?: string;
  metrics?: { label: string; value: string }[];
  configFields?: {
    key: string;
    label: string;
    placeholder: string;
    type?: string;
  }[];
}

interface SitePage {
  path: string;
  title: string;
  priority: string;
  changefreq: string;
  lastmod: string;
  indexed: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   Constants - 14 Quick Actions
   ═══════════════════════════════════════════════════════════════ */

const QUICK_ACTIONS: QuickAction[] = [
  // ── Content ──
  {
    id: "content_writer",
    taskType: "content_writer",
    name: "Content Writer",
    nameAr: "كاتب المحتوى",
    description: "Write blog posts, descriptions, and marketing copy",
    icon: <PenTool className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    category: "content",
    prompts: [
      "Write a blog post about luxury Nile cruises",
      "Create destination description for Luxor",
      "Write an email newsletter about summer offers",
    ],
  },
  {
    id: "translator",
    taskType: "translator",
    name: "Translator",
    nameAr: "المترجم",
    description: "Translate content between Arabic and English",
    icon: <Languages className="w-5 h-5" />,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    category: "content",
    prompts: [
      "Translate this page content to Arabic",
      "Translate our offer description to English",
      "Localize marketing copy for Arabic audience",
    ],
  },
  {
    id: "brand_voice",
    taskType: "brand_voice",
    name: "Brand Voice",
    nameAr: "صوت العلامة",
    description: "Ensure consistent brand tone across all content",
    icon: <Crown className="w-5 h-5" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    category: "content",
    prompts: [
      "Review this text for brand consistency",
      "Rewrite in Vanir luxury tone",
      "Create brand guidelines summary",
    ],
  },
  {
    id: "email_composer",
    taskType: "email_composer",
    name: "Email Composer",
    nameAr: "كاتب البريد",
    description: "Compose professional emails and newsletters",
    icon: <Mail className="w-5 h-5" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    category: "content",
    prompts: [
      "Write a welcome email for new subscribers",
      "Create a booking confirmation template",
      "Draft a partnership proposal email",
    ],
  },
  // ── Marketing ──
  {
    id: "seo_analyst",
    taskType: "seo_analyst",
    name: "SEO Analyst",
    nameAr: "محلل SEO",
    description: "Analyze and optimize content for search engines",
    icon: <Search className="w-5 h-5" />,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    category: "marketing",
    prompts: [
      "Audit SEO for our homepage",
      "Suggest keywords for Egypt luxury travel",
      "Optimize meta description for destinations page",
    ],
  },
  {
    id: "social_media",
    taskType: "social_media",
    name: "Social Media",
    nameAr: "وسائل التواصل",
    description: "Create engaging social media content and campaigns",
    icon: <Share2 className="w-5 h-5" />,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    category: "marketing",
    prompts: [
      "Create Instagram post about pyramids tour",
      "Write Facebook ad copy for summer deals",
      "Plan a social media calendar for Ramadan",
    ],
  },
  {
    id: "offer_generator",
    taskType: "offer_generator",
    name: "Offer Generator",
    nameAr: "مولد العروض",
    description: "Design compelling travel offers and packages",
    icon: <Gift className="w-5 h-5" />,
    color: "text-[var(--theme-primary)]",
    bgColor: "bg-[var(--theme-primary)]/10",
    borderColor: "border-[var(--theme-primary)]/20",
    category: "marketing",
    prompts: [
      "Create a luxury honeymoon package",
      "Design a family-friendly Egypt tour",
      "Generate a VIP Nile cruise offer",
    ],
  },
  // ── Operations ──
  {
    id: "customer_support",
    taskType: "customer_support",
    name: "Customer Support",
    nameAr: "دعم العملاء",
    description: "Draft professional customer responses",
    icon: <Headphones className="w-5 h-5" />,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    category: "operations",
    prompts: [
      "Reply to a complaint about hotel quality",
      "Write a follow-up email after a tour",
      "Handle a cancellation request professionally",
    ],
  },
  {
    id: "itinerary_planner",
    taskType: "itinerary_planner",
    name: "Itinerary Planner",
    nameAr: "مخطط الرحلات",
    description: "Create detailed day-by-day travel itineraries",
    icon: <MapPin className="w-5 h-5" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    category: "operations",
    prompts: [
      "Plan a 7-day luxury Egypt itinerary",
      "Create a 3-day Cairo city tour",
      "Design a Nile cruise + Red Sea combo trip",
    ],
  },
  {
    id: "review_responder",
    taskType: "review_responder",
    name: "Review Responder",
    nameAr: "الرد على التقييمات",
    description: "Craft thoughtful responses to customer reviews",
    icon: <Star className="w-5 h-5" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    category: "operations",
    prompts: [
      "Respond to a 5-star review on TripAdvisor",
      "Handle a negative review professionally",
      "Thank a customer for detailed feedback",
    ],
  },
  // ── Analysis ──
  {
    id: "data_analyst",
    taskType: "data_analyst",
    name: "Data Analyst",
    nameAr: "محلل البيانات",
    description: "Analyze business metrics and trends",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    category: "analysis",
    prompts: [
      "Analyze our booking trends this quarter",
      "Compare revenue across destinations",
      "Identify our top-performing marketing channels",
    ],
  },
  {
    id: "pricing_advisor",
    taskType: "pricing_advisor",
    name: "Pricing Advisor",
    nameAr: "مستشار التسعير",
    description: "Optimize pricing strategy for packages",
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-lime-400",
    bgColor: "bg-lime-500/10",
    borderColor: "border-lime-500/20",
    category: "analysis",
    prompts: [
      "Suggest pricing for a new luxury package",
      "Analyze competitor pricing in Egypt tourism",
      "Create seasonal pricing strategy",
    ],
  },
  {
    id: "competitor_analysis",
    taskType: "competitor_analysis",
    name: "Competitor Analysis",
    nameAr: "تحليل المنافسين",
    description: "Research and analyze competitor strategies",
    icon: <Target className="w-5 h-5" />,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    category: "analysis",
    prompts: [
      "Analyze top 5 Egypt luxury travel competitors",
      "Compare our offerings with competitor X",
      "Identify market gaps we can exploit",
    ],
  },
  {
    id: "report_generator",
    taskType: "report_generator",
    name: "Report Generator",
    nameAr: "مولد التقارير",
    description: "Generate comprehensive business reports",
    icon: <FileText className="w-5 h-5" />,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    category: "analysis",
    prompts: [
      "Generate monthly performance report",
      "Create a destination popularity analysis",
      "Summarize customer satisfaction data",
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: <Sparkles className="w-3.5 h-3.5" /> },
  {
    id: "content",
    label: "Content",
    icon: <PenTool className="w-3.5 h-3.5" />,
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: <Globe className="w-3.5 h-3.5" />,
  },
  {
    id: "operations",
    label: "Operations",
    icon: <Headphones className="w-3.5 h-3.5" />,
  },
  {
    id: "analysis",
    label: "Analysis",
    icon: <BarChart3 className="w-3.5 h-3.5" />,
  },
];

const TASK_TYPE_MAP: Record<
  string,
  { name: string; icon: React.ReactNode; color: string }
> = {
  general: {
    name: "General",
    icon: <Bot className="w-4 h-4" />,
    color: "text-white",
  },
  content_writer: {
    name: "Content Writer",
    icon: <PenTool className="w-4 h-4" />,
    color: "text-blue-400",
  },
  seo_analyst: {
    name: "SEO Analyst",
    icon: <Search className="w-4 h-4" />,
    color: "text-green-400",
  },
  offer_generator: {
    name: "Offer Generator",
    icon: <Gift className="w-4 h-4" />,
    color: "text-[var(--theme-primary)]",
  },
  data_analyst: {
    name: "Data Analyst",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "text-purple-400",
  },
  customer_support: {
    name: "Customer Support",
    icon: <Headphones className="w-4 h-4" />,
    color: "text-teal-400",
  },
  translator: {
    name: "Translator",
    icon: <Languages className="w-4 h-4" />,
    color: "text-orange-400",
  },
  social_media: {
    name: "Social Media",
    icon: <Share2 className="w-4 h-4" />,
    color: "text-pink-400",
  },
  itinerary_planner: {
    name: "Itinerary Planner",
    icon: <MapPin className="w-4 h-4" />,
    color: "text-emerald-400",
  },
  review_responder: {
    name: "Review Responder",
    icon: <Star className="w-4 h-4" />,
    color: "text-amber-400",
  },
  pricing_advisor: {
    name: "Pricing Advisor",
    icon: <DollarSign className="w-4 h-4" />,
    color: "text-lime-400",
  },
  brand_voice: {
    name: "Brand Voice",
    icon: <Crown className="w-4 h-4" />,
    color: "text-yellow-400",
  },
  competitor_analysis: {
    name: "Competitor Analysis",
    icon: <Target className="w-4 h-4" />,
    color: "text-red-400",
  },
  report_generator: {
    name: "Report Generator",
    icon: <FileText className="w-4 h-4" />,
    color: "text-slate-400",
  },
  email_composer: {
    name: "Email Composer",
    icon: <Mail className="w-4 h-4" />,
    color: "text-cyan-400",
  },
};

const ACCEPTED_FILE_TYPES = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.json";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ═══════════════════════════════════════════════════════════════
   Site Pages Data (from sitemap.xml)
   ═══════════════════════════════════════════════════════════════ */

const SITE_PAGES: SitePage[] = [
  {
    path: "/",
    title: "Home",
    priority: "1.0",
    changefreq: "weekly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/about",
    title: "About Us",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/vanir",
    title: "Vanir Story",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/destinations",
    title: "Destinations",
    priority: "0.9",
    changefreq: "weekly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/programs",
    title: "Programs",
    priority: "0.9",
    changefreq: "weekly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/services",
    title: "Services",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/booking",
    title: "Booking",
    priority: "0.9",
    changefreq: "weekly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/offers",
    title: "Exclusive Offers",
    priority: "0.9",
    changefreq: "weekly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/gallery",
    title: "Gallery",
    priority: "0.8",
    changefreq: "weekly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/reviews",
    title: "Reviews",
    priority: "0.8",
    changefreq: "weekly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/case-studies",
    title: "Case Studies",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/contact",
    title: "Contact",
    priority: "0.7",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/ai-studio",
    title: "AI Studio",
    priority: "0.7",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/blog",
    title: "Blog",
    priority: "0.9",
    changefreq: "daily",
    lastmod: "2026-04-14",
    indexed: true,
  },
  {
    path: "/ai-image-generator",
    title: "AI Image Generator",
    priority: "0.6",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: false,
  },
  {
    path: "/ai-dashboard",
    title: "AI Dashboard",
    priority: "0.5",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: false,
  },
  {
    path: "/marketing",
    title: "Marketing Hub",
    priority: "0.6",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: false,
  },
  {
    path: "/profile",
    title: "User Profile",
    priority: "0.3",
    changefreq: "monthly",
    lastmod: "2026-04-14",
    indexed: false,
  },
];

/* ═══════════════════════════════════════════════════════════════
   Connectors Data
   ═══════════════════════════════════════════════════════════════ */

const CONNECTOR_TEMPLATES: Omit<
  Connector,
  "connected" | "status" | "lastSync" | "metrics"
>[] = [
  {
    id: "google_analytics",
    name: "Google Analytics",
    nameAr: "تحليلات جوجل",
    description:
      "Track website traffic, user behavior, and conversion metrics. Requires a GA4 Measurement ID.",
    icon: <BarChart2 className="w-5 h-5" />,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    configFields: [
      {
        key: "ga_measurement_id",
        label: "Measurement ID",
        placeholder: "G-XXXXXXXXX",
      },
      {
        key: "ga_stream_id",
        label: "Data Stream ID (optional)",
        placeholder: "Enter stream ID",
      },
    ],
  },
  {
    id: "search_console",
    name: "Google Search Console",
    nameAr: "أدوات مشرفي المواقع",
    description:
      "Monitor search performance, indexing status, and crawl issues. Requires property verification.",
    icon: <Search className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    configFields: [
      {
        key: "sc_property",
        label: "Property URL",
        placeholder: "https://vanirgroup.com",
      },
      {
        key: "sc_api_key",
        label: "API Key",
        placeholder: "Enter API key",
        type: "password",
      },
    ],
  },
  {
    id: "banana_pro",
    name: "Banana Pro",
    nameAr: "بنانا برو",
    description:
      "AI image generation with Nano Banana Pro models for marketing visuals. Uses built-in API.",
    icon: <Palette className="w-5 h-5" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    configFields: [
      {
        key: "banana_api_key",
        label: "API Key (leave empty for built-in)",
        placeholder: "Optional - uses built-in key",
      },
    ],
  },
  {
    id: "sitemap",
    name: "Sitemap & Pages",
    nameAr: "خريطة الموقع",
    description:
      "Current sitemap configuration and indexed pages overview. Auto-detected from your site.",
    icon: <Map className="w-5 h-5" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
];

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function AICommandCenter() {
  /* ─── State ─── */
  const [activeTab, setActiveTab] = useState("chat");
  const [currentTaskType, setCurrentTaskType] = useState("general");
  const [inputMessage, setInputMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quickTaskDialog, setQuickTaskDialog] = useState<QuickAction | null>(
    null,
  );
  const [quickTaskPrompt, setQuickTaskPrompt] = useState("");
  const [quickTaskContext, setQuickTaskContext] = useState("");
  const [quickTaskResult, setQuickTaskResult] = useState<string | null>(null);
  const [quickTaskAttachments, setQuickTaskAttachments] = useState<
    FileAttachment[]
  >([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [connectorConfigDialog, setConnectorConfigDialog] =
    useState<Connector | null>(null);
  const [connectorConfigValues, setConnectorConfigValues] = useState<
    Record<string, string>
  >({});
  const [expandedConnector, setExpandedConnector] = useState<string | null>(
    null,
  );
  const [showSitePages, setShowSitePages] = useState(false);

  // Load connector state from DB
  const connectorsQuery = trpc.siteSettings.getByCategory.useQuery({
    category: "connectors",
  });
  const connectorSaveMutation = trpc.siteSettings.setMany.useMutation();

  // Hydrate connectors from DB
  useEffect(() => {
    const savedData = connectorsQuery.data || {};
    const hydrated: Connector[] = CONNECTOR_TEMPLATES.map((tpl) => {
      const savedJson = savedData[tpl.id];
      let saved: {
        connected?: boolean;
        config?: Record<string, string>;
        lastSync?: string;
      } = {};
      try {
        if (savedJson) saved = JSON.parse(savedJson);
      } catch {}
      const isConnected = saved.connected === true;
      return {
        ...tpl,
        connected: isConnected,
        status: isConnected
          ? ("connected" as const)
          : ("disconnected" as const),
        lastSync: saved.lastSync,
        metrics:
          isConnected && saved.config
            ? Object.entries(saved.config)
                .filter(([, v]) => v)
                .map(([k, v]) => ({
                  label: k
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                  value: v,
                }))
            : undefined,
      };
    });
    setConnectors(hydrated);
  }, [connectorsQuery.data]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  /* ─── tRPC ─── */
  const chatMutation = trpc.aiCommand.chat.useMutation();
  const taskMutation = trpc.aiCommand.executeTask.useMutation();
  const uploadMutation = trpc.aiCommand.uploadFile.useMutation();

  /* ─── Derived ─── */
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const messages = activeConversation?.messages || [];
  const isLoading = chatMutation.isPending || taskMutation.isPending;
  const filteredActions =
    categoryFilter === "all"
      ? QUICK_ACTIONS
      : QUICK_ACTIONS.filter((a) => a.category === categoryFilter);

  /* ─── Auto-scroll ─── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  /* ─── File Upload Handler ─── */
  const uploadFile = useCallback(
    async (file: File): Promise<FileAttachment | null> => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds 10MB limit`);
        return null;
      }

      const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const attachment: FileAttachment = {
        id,
        file,
        url: "",
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        uploading: true,
        progress: 0,
      };

      try {
        const buffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );
        const result = await uploadMutation.mutateAsync({
          fileData: base64,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
        });
        return {
          ...attachment,
          url: result.url,
          uploading: false,
          progress: 100,
        };
      } catch {
        toast.error(`Failed to upload "${file.name}"`);
        return null;
      }
    },
    [uploadMutation],
  );

  const handleFileSelect = useCallback(
    async (files: FileList | File[], target: "chat" | "quick") => {
      const fileArray = Array.from(files).slice(0, 5);
      const setter =
        target === "chat" ? setPendingFiles : setQuickTaskAttachments;
      for (const file of fileArray) {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const tempAttachment: FileAttachment = {
          id: tempId,
          file,
          url: "",
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          uploading: true,
        };
        setter((prev) => [...prev, tempAttachment]);
        const uploaded = await uploadFile(file);
        if (uploaded) {
          setter((prev) =>
            prev.map((f) =>
              f.id === tempId ? { ...uploaded, id: tempId } : f,
            ),
          );
        } else {
          setter((prev) => prev.filter((f) => f.id !== tempId));
        }
      }
    },
    [uploadFile],
  );

  const removeFile = useCallback((id: string, target: "chat" | "quick") => {
    const setter =
      target === "chat" ? setPendingFiles : setQuickTaskAttachments;
    setter((prev) => prev.filter((f) => f.id !== id));
  }, []);

  /* ─── Drag & Drop ─── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0)
        handleFileSelect(e.dataTransfer.files, "chat");
    },
    [handleFileSelect],
  );

  /* ─── Conversation Handlers ─── */
  const createNewConversation = useCallback((taskType: string = "general") => {
    const taskInfo = TASK_TYPE_MAP[taskType];
    const conv: Conversation = {
      id: `conv-${Date.now()}`,
      title: taskInfo ? `${taskInfo.name} Chat` : "New Chat",
      taskType,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(conv.id);
    setCurrentTaskType(taskType);
    return conv.id;
  }, []);

  const sendMessage = useCallback(async () => {
    if ((!inputMessage.trim() && pendingFiles.length === 0) || isLoading)
      return;
    let convId = activeConversationId;
    if (!convId) convId = createNewConversation(currentTaskType);
    const uploadedFiles = pendingFiles.filter((f) => !f.uploading && f.url);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
      taskType: currentTaskType,
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              updatedAt: new Date(),
              title:
                c.messages.length === 0
                  ? inputMessage.trim().slice(0, 50) ||
                    uploadedFiles[0]?.filename ||
                    "File Chat"
                  : c.title,
            }
          : c,
      ),
    );
    const currentInput = inputMessage.trim();
    setInputMessage("");
    setPendingFiles([]);
    try {
      const currentConv = conversations.find((c) => c.id === convId);
      const historyMessages = (currentConv?.messages || []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        attachments: m.attachments?.map((a) => ({
          url: a.url,
          mimeType: a.mimeType,
          filename: a.filename,
        })),
      }));
      const result = await chatMutation.mutateAsync({
        messages: [
          ...historyMessages,
          {
            role: "user" as const,
            content:
              currentInput ||
              (uploadedFiles.length > 0
                ? `Analyze the attached file(s): ${uploadedFiles.map((f) => f.filename).join(", ")}`
                : ""),
            attachments: uploadedFiles.map((f) => ({
              url: f.url,
              mimeType: f.mimeType,
              filename: f.filename,
            })),
          },
        ],
        taskType: currentTaskType as any,
      });
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
        taskType: currentTaskType,
        tokens: result.usage?.total_tokens,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, assistantMsg],
                updatedAt: new Date(),
              }
            : c,
        ),
      );
      if (result.usage?.total_tokens)
        setTotalTokens((prev) => prev + result.usage!.total_tokens);
      setTotalTasks((prev) => prev + 1);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "Sorry, an error occurred. Please try again.",
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, errorMsg],
                updatedAt: new Date(),
              }
            : c,
        ),
      );
    }
  }, [
    inputMessage,
    pendingFiles,
    isLoading,
    activeConversationId,
    currentTaskType,
    conversations,
    chatMutation,
    createNewConversation,
  ]);

  const executeQuickTask = useCallback(async () => {
    if (!quickTaskDialog || !quickTaskPrompt.trim()) return;
    setQuickTaskResult(null);
    const uploadedFiles = quickTaskAttachments.filter(
      (f) => !f.uploading && f.url,
    );
    try {
      const result = await taskMutation.mutateAsync({
        taskType: quickTaskDialog.taskType as any,
        prompt: quickTaskPrompt.trim(),
        context: quickTaskContext.trim() || undefined,
        language: "auto",
        attachments:
          uploadedFiles.length > 0
            ? uploadedFiles.map((f) => ({
                url: f.url,
                mimeType: f.mimeType,
                filename: f.filename,
              }))
            : undefined,
      });
      setQuickTaskResult(result.result);
      if (result.usage?.total_tokens)
        setTotalTokens((prev) => prev + result.usage!.total_tokens);
      setTotalTasks((prev) => prev + 1);
    } catch {
      setQuickTaskResult("Error: Failed to execute task. Please try again.");
    }
  }, [
    quickTaskDialog,
    quickTaskPrompt,
    quickTaskContext,
    quickTaskAttachments,
    taskMutation,
  ]);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const deleteConversation = useCallback(
    (convId: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) setActiveConversationId(null);
    },
    [activeConversationId],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectSuggestedPrompt = (prompt: string) => setInputMessage(prompt);

  /* ─── Connector Handlers ─── */
  const toggleConnector = useCallback(
    async (id: string) => {
      const connector = connectors.find((c) => c.id === id);
      if (!connector) return;
      const newConnected = !connector.connected;
      // For connectors that need config, open config dialog if connecting without config
      if (
        newConnected &&
        connector.configFields &&
        connector.configFields.length > 0 &&
        !connector.metrics?.length
      ) {
        const tpl = CONNECTOR_TEMPLATES.find((t) => t.id === id);
        if (tpl) {
          setConnectorConfigDialog({
            ...tpl,
            connected: false,
            status: "disconnected",
          });
          setConnectorConfigValues({});
        }
        return;
      }
      try {
        const savedData = connectorsQuery.data || {};
        let existing: Record<string, unknown> = {};
        try {
          if (savedData[id]) existing = JSON.parse(savedData[id]);
        } catch {}
        const updated = {
          ...existing,
          connected: newConnected,
          lastSync: newConnected ? new Date().toISOString() : undefined,
        };
        await connectorSaveMutation.mutateAsync({
          category: "connectors",
          settings: { [id]: JSON.stringify(updated) },
        });
        connectorsQuery.refetch();
        toast.success(
          `${connector.name} ${newConnected ? "connected" : "disconnected"} successfully`,
        );
      } catch (err) {
        toast.error("Failed to save connector state");
      }
    },
    [connectors, connectorsQuery.data],
  );

  const saveConnectorConfig = useCallback(async () => {
    if (!connectorConfigDialog) return;
    const id = connectorConfigDialog.id;
    const hasValues = Object.values(connectorConfigValues).some((v) =>
      v.trim(),
    );
    try {
      const savedData = connectorsQuery.data || {};
      let existing: Record<string, unknown> = {};
      try {
        if (savedData[id]) existing = JSON.parse(savedData[id]);
      } catch {}
      const updated = {
        ...existing,
        connected: true,
        config: connectorConfigValues,
        lastSync: new Date().toISOString(),
      };
      await connectorSaveMutation.mutateAsync({
        category: "connectors",
        settings: { [id]: JSON.stringify(updated) },
      });
      connectorsQuery.refetch();
      toast.success(
        `${connectorConfigDialog.name} configuration saved to database`,
      );
      setConnectorConfigDialog(null);
      setConnectorConfigValues({});
    } catch (err) {
      toast.error("Failed to save configuration");
    }
  }, [connectorConfigDialog, connectorConfigValues, connectorsQuery.data]);

  /* ─── File Preview Component ─── */
  const FilePreview = ({
    att,
    target,
    compact = false,
  }: {
    att: FileAttachment;
    target: "chat" | "quick";
    compact?: boolean;
  }) => {
    const isImage = att.mimeType.startsWith("image/");
    const sizeStr =
      att.fileSize < 1024
        ? `${att.fileSize} B`
        : att.fileSize < 1024 * 1024
          ? `${(att.fileSize / 1024).toFixed(1)} KB`
          : `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`;
    return (
      <div
        className={`relative group flex items-center gap-2 rounded-lg border ${att.uploading ? "border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/5" : "border-white/10 bg-black/30"} ${compact ? "p-1.5" : "p-2"}`}
      >
        {isImage && att.url ? (
          <img
            src={att.url}
            alt={att.filename}
            className={`${compact ? "w-8 h-8" : "w-10 h-10"} rounded object-cover`}
          />
        ) : (
          <div
            className={`${compact ? "w-8 h-8" : "w-10 h-10"} rounded bg-white/5 flex items-center justify-center`}
          >
            <File
              className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"} text-white/40`}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-white ${compact ? "text-[10px]" : "text-xs"} truncate`}
          >
            {att.filename}
          </p>
          {!compact && <p className="text-white/30 text-[10px]">{sizeStr}</p>}
        </div>
        {att.uploading && (
          <RefreshCw className="w-3 h-3 text-[var(--theme-primary)] animate-spin shrink-0" />
        )}
        <button
          onClick={() => removeFile(att.id, target)}
          className="shrink-0 text-white/20 hover:text-red-400 transition-colors"
        >
          <X className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
        </button>
      </div>
    );
  };

  /* ─── Message Attachment Display ─── */
  const MessageAttachments = ({
    attachments,
  }: {
    attachments: FileAttachment[];
  }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((att) => {
        const isImage = att.mimeType.startsWith("image/");
        return isImage ? (
          <a
            key={att.id}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={att.url}
              alt={att.filename}
              className="w-32 h-24 rounded-lg object-cover border border-white/10 hover:border-[var(--theme-primary)]/30 transition-colors"
            />
          </a>
        ) : (
          <a
            key={att.id}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/10 hover:border-[var(--theme-primary)]/20 transition-colors"
          >
            <File className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-xs">{att.filename}</span>
          </a>
        );
      })}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* ─── Header with Logo ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <img
            src={VANIR_LOGO_URL}
            alt="Vanir"
            className="w-11 h-11 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--theme-primary)] to-[#B8922E] flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              Vanir AI Assistant
            </h1>
            <p className="text-white/50 mt-1">
              Your intelligent assistant for managing Vanir Travel Group
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-400/10 text-green-400 border-0 gap-1">
            <Activity className="w-3 h-3" /> Online
          </Badge>
          <Badge className="bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-0 gap-1">
            <Cpu className="w-3 h-3" /> Gemini 2.5 Flash
          </Badge>
          <Badge className="bg-blue-400/10 text-blue-400 border-0 gap-1">
            <Paperclip className="w-3 h-3" /> Multimodal
          </Badge>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: <Zap className="w-5 h-5 text-[var(--theme-primary)]" />,
            bg: "bg-[var(--theme-primary)]/10",
            label: "Tasks Completed",
            value: totalTasks,
          },
          {
            icon: <Hash className="w-5 h-5 text-purple-400" />,
            bg: "bg-purple-500/10",
            label: "Tokens Used",
            value: totalTokens.toLocaleString(),
          },
          {
            icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
            bg: "bg-blue-500/10",
            label: "Conversations",
            value: conversations.length,
          },
          {
            icon: <Clock className="w-5 h-5 text-green-400" />,
            bg: "bg-green-500/10",
            label: "Time Saved",
            value: `${Math.round(totalTasks * 12)}m`,
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-black/40 border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-white/50 text-xs">{stat.label}</p>
                <p className="text-white font-bold text-lg">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Main Tabs ─── */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" /> AI Chat
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Zap className="w-4 h-4 mr-1.5" /> Quick Actions
            <Badge className="ml-1.5 bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-0 text-[10px] px-1.5">
              {QUICK_ACTIONS.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="connectors"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Plug className="w-4 h-4 mr-1.5" /> Connectors
            <Badge className="ml-1.5 bg-green-400/20 text-green-400 border-0 text-[10px] px-1.5">
              {connectors.filter((c) => c.connected).length}/{connectors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Clock className="w-4 h-4 mr-1.5" /> History
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════
           TAB 1: AI Chat
           ════════════════════════════════════════════════════════ */}
        <TabsContent value="chat" className="space-y-0">
          <div
            className="grid grid-cols-1 lg:grid-cols-4 gap-4"
            style={{ minHeight: "600px" }}
          >
            {/* Sidebar - Conversations */}
            <div className="lg:col-span-1 space-y-3">
              <Button
                onClick={() => createNewConversation(currentTaskType)}
                className="w-full bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]"
              >
                <Plus className="w-4 h-4 mr-1" /> New Chat
              </Button>
              <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-sm">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const taskInfo = TASK_TYPE_MAP[conv.taskType];
                    return (
                      <div
                        key={conv.id}
                        className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${activeConversationId === conv.id ? "bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20" : "bg-black/20 border border-transparent hover:bg-white/5 hover:border-white/5"}`}
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          setCurrentTaskType(conv.taskType);
                        }}
                      >
                        <div
                          className={`shrink-0 ${taskInfo?.color || "text-white/50"}`}
                        >
                          {taskInfo?.icon || <Bot className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">
                            {conv.title}
                          </p>
                          <p className="text-white/30 text-[10px]">
                            {conv.messages.length} msgs &middot;{" "}
                            {conv.updatedAt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div
              ref={chatAreaRef}
              className={`lg:col-span-3 flex flex-col bg-black/20 rounded-xl border overflow-hidden transition-colors ${isDragging ? "border-[var(--theme-primary)]/50 bg-[var(--theme-primary)]/5" : "border-white/5"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/30">
                <div className="flex items-center gap-3">
                  <img
                    src={VANIR_LOGO_URL}
                    alt="Vanir"
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">
                      Vanir AI Assistant
                    </p>
                    <p className="text-white/30 text-xs">
                      Supports text, images & documents
                    </p>
                  </div>
                </div>
                <Select
                  value={currentTaskType}
                  onValueChange={(v) => setCurrentTaskType(v)}
                >
                  <SelectTrigger className="w-[180px] bg-black/40 border-white/10 text-white text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_TYPE_MAP).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span className={info.color}>{info.icon}</span>{" "}
                          {info.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Drag Overlay */}
              {isDragging && (
                <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-[var(--theme-primary)] mx-auto mb-2" />
                    <p className="text-[var(--theme-primary)] font-medium">
                      Drop files here
                    </p>
                    <p className="text-white/40 text-sm">
                      Images, PDFs, documents up to 10MB
                    </p>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ minHeight: "380px", maxHeight: "420px" }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <img
                      src={VANIR_LOGO_URL}
                      alt="Vanir"
                      className="w-16 h-16 rounded-2xl object-contain mb-4 opacity-60"
                    />
                    <h3 className="text-white text-lg font-semibold mb-1">
                      Welcome to Vanir AI Assistant
                    </h3>
                    <p className="text-white/40 text-sm max-w-md mb-2">
                      Your intelligent assistant for managing Vanir Travel
                      Group. Ask me anything or attach files for analysis.
                    </p>
                    <div className="flex items-center gap-2 mb-6">
                      <Badge className="bg-white/5 text-white/40 border-0 text-[10px]">
                        <Image className="w-3 h-3 mr-1" /> Images
                      </Badge>
                      <Badge className="bg-white/5 text-white/40 border-0 text-[10px]">
                        <FileText className="w-3 h-3 mr-1" /> PDFs
                      </Badge>
                      <Badge className="bg-white/5 text-white/40 border-0 text-[10px]">
                        <File className="w-3 h-3 mr-1" /> Documents
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg">
                      {[
                        {
                          icon: (
                            <PenTool className="w-3.5 h-3.5 text-blue-400" />
                          ),
                          text: "Write a blog post about Luxor temples",
                        },
                        {
                          icon: (
                            <Gift className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                          ),
                          text: "Create a luxury Egypt tour package",
                        },
                        {
                          icon: (
                            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                          ),
                          text: "Analyze our booking trends",
                        },
                        {
                          icon: (
                            <Search className="w-3.5 h-3.5 text-green-400" />
                          ),
                          text: "Audit SEO for our homepage",
                        },
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => selectSuggestedPrompt(suggestion.text)}
                          className="flex items-center gap-2 p-3 rounded-lg bg-black/30 border border-white/5 hover:border-[var(--theme-primary)]/20 hover:bg-[var(--theme-primary)]/5 transition-all text-left group"
                        >
                          {suggestion.icon}
                          <span className="text-white/50 text-xs group-hover:text-white/70 transition-colors">
                            {suggestion.text}
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/20 ml-auto group-hover:text-[var(--theme-primary)] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <img
                            src={VANIR_LOGO_URL}
                            alt="Vanir AI"
                            className="shrink-0 w-8 h-8 rounded-lg object-contain mt-1"
                          />
                        )}
                        <div
                          className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}
                        >
                          <div
                            className={`rounded-2xl p-4 ${msg.role === "user" ? "bg-[var(--theme-primary)] text-black rounded-br-md" : "bg-black/40 border border-white/5 text-white rounded-bl-md"}`}
                          >
                            {msg.role === "assistant" ? (
                              <div className="prose prose-invert prose-sm max-w-none [&_p]:text-white/80 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_li]:text-white/70 [&_strong]:text-[var(--theme-primary)] [&_code]:text-[var(--theme-primary)] [&_a]:text-[var(--theme-primary)]">
                                <Streamdown>{msg.content}</Streamdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            )}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <MessageAttachments
                                attachments={msg.attachments}
                              />
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <span className="text-white/20 text-[10px]">
                              {msg.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {msg.role === "assistant" && (
                              <>
                                {msg.tokens && (
                                  <span className="text-white/15 text-[10px]">
                                    {msg.tokens} tokens
                                  </span>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(msg.content, msg.id)
                                      }
                                      className="text-white/20 hover:text-white/50 transition-colors"
                                    >
                                      {copiedId === msg.id ? (
                                        <Check className="w-3 h-3 text-green-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy</TooltipContent>
                                </Tooltip>
                              </>
                            )}
                          </div>
                        </div>
                        {msg.role === "user" && (
                          <div className="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mt-1">
                            <Users className="w-4 h-4 text-white/50" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <img
                          src={VANIR_LOGO_URL}
                          alt="Vanir AI"
                          className="shrink-0 w-8 h-8 rounded-lg object-contain"
                        />
                        <div className="bg-black/40 border border-white/5 rounded-2xl rounded-bl-md p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div
                                className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <div
                                className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <div
                                className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                            <span className="text-white/30 text-xs">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Pending Files Preview */}
              {pendingFiles.length > 0 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {pendingFiles.map((f) => (
                      <FilePreview key={f.id} att={f} target="chat" compact />
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-white/5 bg-black/30">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_FILE_TYPES}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileSelect(e.target.files, "chat");
                        e.target.value = "";
                      }
                    }}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 border-white/10 text-white/50 hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]/30 bg-transparent"
                        disabled={isLoading}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Attach files (images, PDFs, docs)
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      pendingFiles.length > 0
                        ? "Add a message about the files..."
                        : `Ask ${TASK_TYPE_MAP[currentTaskType]?.name || "AI"} anything...`
                    }
                    className="flex-1 bg-black/40 border-white/10 text-white placeholder:text-white/30"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={
                      (!inputMessage.trim() &&
                        pendingFiles.filter((f) => !f.uploading).length ===
                          0) ||
                      isLoading
                    }
                    className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-white/20 text-[10px] mt-2 text-center">
                  Supports images, PDFs, and documents up to 10MB. Drag & drop
                  or click the clip icon.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
           TAB 2: Quick Actions
           ════════════════════════════════════════════════════════ */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={categoryFilter === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat.id)}
                className={
                  categoryFilter === cat.id
                    ? "bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]"
                    : "border-white/10 text-white/50 hover:text-white hover:border-white/20 bg-transparent"
                }
              >
                {cat.icon}
                <span className="ml-1.5">{cat.label}</span>
                {cat.id !== "all" && (
                  <Badge className="ml-1.5 bg-white/10 text-white/50 border-0 text-[10px] px-1">
                    {QUICK_ACTIONS.filter((a) => a.category === cat.id).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredActions.map((action) => (
              <Card
                key={action.id}
                className={`bg-black/40 border-white/10 hover:${action.borderColor} transition-all cursor-pointer group`}
                onClick={() => {
                  setQuickTaskDialog(action);
                  setQuickTaskPrompt("");
                  setQuickTaskContext("");
                  setQuickTaskResult(null);
                  setQuickTaskAttachments([]);
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}
                    >
                      {action.icon}
                    </div>
                    <Badge className="bg-white/5 text-white/30 border-0 text-[10px] capitalize">
                      {action.category}
                    </Badge>
                  </div>
                  <h3 className="text-white font-semibold mb-0.5">
                    {action.name}
                  </h3>
                  <p className="text-white/30 text-xs mb-1">{action.nameAr}</p>
                  <p className="text-white/50 text-sm mb-4">
                    {action.description}
                  </p>
                  <div className="space-y-1.5">
                    {action.prompts.slice(0, 2).map((prompt, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-white/30 text-xs"
                      >
                        <Lightbulb className="w-3 h-3 shrink-0 text-[var(--theme-primary)]/50" />
                        <span className="truncate">{prompt}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-4 text-[var(--theme-primary)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
                  >
                    Launch <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Capabilities Overview */}
          <Card className="bg-gradient-to-r from-[var(--theme-primary)]/5 to-purple-500/5 border-[var(--theme-primary)]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-[var(--theme-primary)]" />
                <h3 className="text-white text-lg font-semibold">
                  AI Capabilities
                </h3>
                <Badge className="bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-0">
                  {QUICK_ACTIONS.length} Actions
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: <PenTool className="w-4 h-4" />,
                    label: "Content & Copy",
                    desc: "Blog posts, emails, brand voice",
                  },
                  {
                    icon: <Globe className="w-4 h-4" />,
                    label: "SEO & Marketing",
                    desc: "Keywords, social media, ads",
                  },
                  {
                    icon: <TrendingUp className="w-4 h-4" />,
                    label: "Business Analysis",
                    desc: "Data, pricing, competitors",
                  },
                  {
                    icon: <Paperclip className="w-4 h-4" />,
                    label: "File Analysis",
                    desc: "Images, PDFs, documents",
                  },
                ].map((cap, i) => (
                  <div
                    key={i}
                    className="bg-black/30 rounded-lg p-3 border border-white/5"
                  >
                    <div className="text-[var(--theme-primary)] mb-2">
                      {cap.icon}
                    </div>
                    <p className="text-white text-sm font-medium">
                      {cap.label}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
           TAB 3: Connectors
           ════════════════════════════════════════════════════════ */}
        <TabsContent value="connectors" className="space-y-6">
          {/* Connectors Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-4 text-center">
                <Plug className="w-6 h-6 text-[var(--theme-primary)] mx-auto mb-2" />
                <p className="text-white font-bold text-xl">
                  {connectors.length}
                </p>
                <p className="text-white/50 text-xs">Total Connectors</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-4 text-center">
                <Wifi className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold text-xl">
                  {connectors.filter((c) => c.connected).length}
                </p>
                <p className="text-white/50 text-xs">Connected</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-4 text-center">
                <WifiOff className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-white font-bold text-xl">
                  {connectors.filter((c) => !c.connected).length}
                </p>
                <p className="text-white/50 text-xs">Disconnected</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-4 text-center">
                <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-bold text-xl">
                  {SITE_PAGES.filter((p) => p.indexed).length}
                </p>
                <p className="text-white/50 text-xs">Indexed Pages</p>
              </CardContent>
            </Card>
          </div>

          {/* Connector Cards */}
          <div className="space-y-4">
            {connectors.map((connector) => (
              <Card
                key={connector.id}
                className={`bg-black/40 border transition-all ${connector.connected ? "border-green-500/20" : "border-white/10"}`}
              >
                <CardContent className="p-0">
                  {/* Connector Header */}
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${connector.bgColor} flex items-center justify-center ${connector.color}`}
                      >
                        {connector.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">
                            {connector.name}
                          </h3>
                          <Badge
                            className={`border-0 text-[10px] ${connector.connected ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}
                          >
                            {connector.connected ? (
                              <>
                                <Wifi className="w-2.5 h-2.5 mr-0.5" />{" "}
                                Connected
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-2.5 h-2.5 mr-0.5" />{" "}
                                Disconnected
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">
                          {connector.nameAr}
                        </p>
                        <p className="text-white/50 text-sm mt-1">
                          {connector.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {connector.lastSync && (
                        <span className="text-white/30 text-xs hidden md:inline">
                          Last sync: {connector.lastSync}
                        </span>
                      )}
                      {connector.configFields && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setConnectorConfigDialog(connector);
                                setConnectorConfigValues({});
                              }}
                              className="border-white/10 text-white/50 hover:text-white hover:border-white/20 bg-transparent h-8 w-8"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Configure</TooltipContent>
                        </Tooltip>
                      )}
                      <Switch
                        checked={connector.connected}
                        onCheckedChange={() => toggleConnector(connector.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setExpandedConnector(
                            expandedConnector === connector.id
                              ? null
                              : connector.id,
                          )
                        }
                        className="text-white/30 hover:text-white h-8 w-8"
                      >
                        {expandedConnector === connector.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Metrics */}
                  {expandedConnector === connector.id && connector.metrics && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="border-t border-white/5 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {connector.metrics.map((metric, i) => (
                            <div
                              key={i}
                              className="bg-black/30 rounded-lg p-3 border border-white/5"
                            >
                              <p className="text-white/40 text-[10px] uppercase tracking-wider">
                                {metric.label}
                              </p>
                              <p className="text-white font-semibold text-sm mt-1 truncate">
                                {metric.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sitemap Pages Table - only for sitemap connector */}
                  {expandedConnector === "sitemap" &&
                    connector.id === "sitemap" && (
                      <div className="px-5 pb-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white/70 text-sm font-medium flex items-center gap-2">
                            <Map className="w-4 h-4 text-emerald-400" /> Site
                            Pages
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-400/10 text-emerald-400 border-0 text-[10px]">
                              {SITE_PAGES.filter((p) => p.indexed).length}{" "}
                              indexed
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSitePages(!showSitePages)}
                              className="text-white/40 hover:text-white text-xs h-7"
                            >
                              {showSitePages ? "Hide" : "Show"} All Pages
                            </Button>
                          </div>
                        </div>
                        {showSitePages && (
                          <div className="rounded-lg border border-white/5 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-black/40 text-white/40 text-xs">
                                  <th className="text-left p-3 font-medium">
                                    Page
                                  </th>
                                  <th className="text-left p-3 font-medium">
                                    Path
                                  </th>
                                  <th className="text-center p-3 font-medium">
                                    Priority
                                  </th>
                                  <th className="text-center p-3 font-medium">
                                    Frequency
                                  </th>
                                  <th className="text-center p-3 font-medium">
                                    Indexed
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {SITE_PAGES.map((page, i) => (
                                  <tr
                                    key={i}
                                    className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                                  >
                                    <td className="p-3 text-white text-xs font-medium">
                                      {page.title}
                                    </td>
                                    <td className="p-3">
                                      <a
                                        href={`https://vanirgroup.com${page.path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--theme-primary)] hover:underline text-xs flex items-center gap-1"
                                      >
                                        {page.path}{" "}
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </td>
                                    <td className="p-3 text-center">
                                      <Badge
                                        className={`border-0 text-[10px] ${parseFloat(page.priority) >= 0.9 ? "bg-green-400/10 text-green-400" : parseFloat(page.priority) >= 0.7 ? "bg-yellow-400/10 text-yellow-400" : "bg-white/5 text-white/40"}`}
                                      >
                                        {page.priority}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-center text-white/40 text-xs">
                                      {page.changefreq}
                                    </td>
                                    <td className="p-3 text-center">
                                      {page.indexed ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                                      ) : (
                                        <AlertCircle className="w-4 h-4 text-white/20 mx-auto" />
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-3">
                          <a
                            href="https://vanirgroup.com/sitemap.xml"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--theme-primary)] text-xs hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                            sitemap.xml
                          </a>
                          <a
                            href="https://vanirgroup.com/robots.txt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 text-xs hover:text-white/60 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> robots.txt
                          </a>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Context Info */}
          <Card className="bg-gradient-to-r from-[var(--theme-primary)]/5 to-blue-500/5 border-[var(--theme-primary)]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-[var(--theme-primary)]" />
                <div>
                  <h3 className="text-white text-lg font-semibold">
                    AI Context Awareness
                  </h3>
                  <p className="text-white/50 text-sm">
                    Connected services feed data into AI responses for better
                    insights
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: <BarChart2 className="w-5 h-5" />,
                    title: "Analytics Data",
                    desc: "Traffic, user behavior, and conversion metrics from Google Analytics",
                    active: connectors.find((c) => c.id === "google_analytics")
                      ?.connected,
                  },
                  {
                    icon: <Search className="w-5 h-5" />,
                    title: "Search Performance",
                    desc: "Keywords, impressions, and indexing from Search Console",
                    active: connectors.find((c) => c.id === "search_console")
                      ?.connected,
                  },
                  {
                    icon: <Map className="w-5 h-5" />,
                    title: "Site Structure",
                    desc: `${SITE_PAGES.length} pages, sitemap, and navigation data`,
                    active: true,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-4 border ${item.active ? "bg-green-500/5 border-green-500/20" : "bg-black/30 border-white/5"}`}
                  >
                    <div
                      className={`mb-2 ${item.active ? "text-green-400" : "text-white/30"}`}
                    >
                      {item.icon}
                    </div>
                    <p
                      className={`text-sm font-medium ${item.active ? "text-white" : "text-white/40"}`}
                    >
                      {item.title}
                    </p>
                    <p className="text-white/30 text-xs mt-1">{item.desc}</p>
                    <Badge
                      className={`mt-2 border-0 text-[10px] ${item.active ? "bg-green-400/10 text-green-400" : "bg-white/5 text-white/30"}`}
                    >
                      {item.active ? "Active" : "Not connected"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
           TAB 4: History
           ════════════════════════════════════════════════════════ */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--theme-primary)]" />{" "}
                Conversation History
              </CardTitle>
              <CardDescription className="text-white/50">
                All your AI conversations and task results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30">No conversations yet</p>
                  <p className="text-white/20 text-sm mt-1">
                    Start a chat or run a quick action to see history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => {
                    const taskInfo = TASK_TYPE_MAP[conv.taskType];
                    const hasFiles = conv.messages.some(
                      (m) => m.attachments && m.attachments.length > 0,
                    );
                    return (
                      <div
                        key={conv.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/5 hover:border-[var(--theme-primary)]/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`shrink-0 w-10 h-10 rounded-lg ${QUICK_ACTIONS.find((a) => a.taskType === conv.taskType)?.bgColor || "bg-white/5"} flex items-center justify-center ${taskInfo?.color || "text-white/50"}`}
                          >
                            {taskInfo?.icon || <Bot className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {conv.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge className="bg-white/5 text-white/40 border-0 text-[10px]">
                                {taskInfo?.name}
                              </Badge>
                              <span className="text-white/20 text-[10px]">
                                {conv.messages.length} messages
                              </span>
                              {hasFiles && (
                                <Badge className="bg-blue-400/10 text-blue-400 border-0 text-[10px]">
                                  <Paperclip className="w-2.5 h-2.5 mr-0.5" />{" "}
                                  Files
                                </Badge>
                              )}
                              <span className="text-white/20 text-[10px]">
                                {conv.updatedAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveConversationId(conv.id);
                              setCurrentTaskType(conv.taskType);
                              setActiveTab("chat");
                            }}
                            className="text-[var(--theme-primary)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteConversation(conv.id)}
                            className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════
         Quick Task Dialog
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!quickTaskDialog}
        onOpenChange={() => {
          setQuickTaskDialog(null);
          setQuickTaskResult(null);
          setQuickTaskAttachments([]);
        }}
      >
        <DialogContent className="bg-[var(--theme-surface)] border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              {quickTaskDialog && (
                <div
                  className={`w-10 h-10 rounded-xl ${quickTaskDialog.bgColor} flex items-center justify-center ${quickTaskDialog.color}`}
                >
                  {quickTaskDialog.icon}
                </div>
              )}
              <div>
                <span>{quickTaskDialog?.name}</span>
                <p className="text-white/40 text-xs font-normal mt-0.5">
                  {quickTaskDialog?.nameAr}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {quickTaskDialog?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!quickTaskResult && quickTaskDialog && (
              <div className="space-y-1.5">
                <p className="text-white/50 text-xs font-medium flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-[var(--theme-primary)]" />{" "}
                  Suggested prompts:
                </p>
                {quickTaskDialog.prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setQuickTaskPrompt(prompt)}
                    className="w-full text-left p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-[var(--theme-primary)]/20 hover:bg-[var(--theme-primary)]/5 transition-all text-white/50 text-sm flex items-center gap-2"
                  >
                    <Star className="w-3 h-3 text-[var(--theme-primary)]/50 shrink-0" />
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            {!quickTaskResult && (
              <>
                <div>
                  <label className="text-white/70 text-sm font-medium mb-1.5 block">
                    Your Request
                  </label>
                  <Textarea
                    value={quickTaskPrompt}
                    onChange={(e) => setQuickTaskPrompt(e.target.value)}
                    placeholder="Describe what you need..."
                    className="bg-black/40 border-white/10 text-white min-h-[100px] placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium mb-1.5 block">
                    Additional Context{" "}
                    <span className="text-white/30">(optional)</span>
                  </label>
                  <Textarea
                    value={quickTaskContext}
                    onChange={(e) => setQuickTaskContext(e.target.value)}
                    placeholder="Paste existing content, data, or context here..."
                    className="bg-black/40 border-white/10 text-white min-h-[60px] placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium mb-1.5 block flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" /> Attach Files{" "}
                    <span className="text-white/30">(optional)</span>
                  </label>
                  <input
                    ref={quickFileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_FILE_TYPES}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileSelect(e.target.files, "quick");
                        e.target.value = "";
                      }
                    }}
                  />
                  {quickTaskAttachments.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {quickTaskAttachments.map((f) => (
                        <FilePreview key={f.id} att={f} target="quick" />
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickFileInputRef.current?.click()}
                    className="border-white/10 text-white/50 hover:text-white hover:border-white/20 bg-transparent"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload File
                  </Button>
                </div>
              </>
            )}
            {quickTaskResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-400/10 text-green-400 border-0 gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Task Completed
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(quickTaskResult, "quick-result")
                          }
                          className="text-white/50 hover:text-white"
                        >
                          {copiedId === "quick-result" ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Result</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setQuickTaskResult(null);
                            setQuickTaskPrompt("");
                            setQuickTaskAttachments([]);
                          }}
                          className="text-white/50 hover:text-white"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>New Task</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl border border-white/5 p-5 max-h-[400px] overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none [&_p]:text-white/80 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_li]:text-white/70 [&_strong]:text-[var(--theme-primary)] [&_code]:text-[var(--theme-primary)] [&_a]:text-[var(--theme-primary)] [&_table]:text-white/70 [&_th]:text-[var(--theme-primary)] [&_th]:border-[var(--theme-primary)]/20 [&_td]:border-white/10">
                    <Streamdown>{quickTaskResult}</Streamdown>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setQuickTaskDialog(null);
                setQuickTaskResult(null);
                setQuickTaskAttachments([]);
              }}
              className="border-white/10 text-white/70"
            >
              Close
            </Button>
            {!quickTaskResult && (
              <Button
                onClick={executeQuickTask}
                disabled={!quickTaskPrompt.trim() || taskMutation.isPending}
                className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)] disabled:opacity-50"
              >
                {taskMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-1" /> Execute Task
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
         Connector Config Dialog
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!connectorConfigDialog}
        onOpenChange={() => {
          setConnectorConfigDialog(null);
          setConnectorConfigValues({});
        }}
      >
        <DialogContent className="bg-[var(--theme-surface)] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              {connectorConfigDialog && (
                <div
                  className={`w-10 h-10 rounded-xl ${connectorConfigDialog.bgColor} flex items-center justify-center ${connectorConfigDialog.color}`}
                >
                  {connectorConfigDialog.icon}
                </div>
              )}
              <div>
                <span>{connectorConfigDialog?.name} Configuration</span>
                <p className="text-white/40 text-xs font-normal mt-0.5">
                  {connectorConfigDialog?.nameAr}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Configure connection settings for {connectorConfigDialog?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {connectorConfigDialog?.configFields?.map((field) => (
              <div key={field.key}>
                <label className="text-white/70 text-sm font-medium mb-1.5 block">
                  {field.label}
                </label>
                <Input
                  type={field.type || "text"}
                  value={connectorConfigValues[field.key] || ""}
                  onChange={(e) =>
                    setConnectorConfigValues((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConnectorConfigDialog(null);
                setConnectorConfigValues({});
              }}
              className="border-white/10 text-white/70"
            >
              Cancel
            </Button>
            <Button
              onClick={saveConnectorConfig}
              className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]"
            >
              <Check className="w-4 h-4 mr-1" /> Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
