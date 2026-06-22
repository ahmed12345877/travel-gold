import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Palette, Type, Eye, RotateCcw, Save, Download, Upload, Check, Sparkles, Loader2, Moon, Sun, Monitor, History, Undo2 } from "lucide-react";
import { useThemeColors, FONT_PAIRINGS, DEFAULT_COLORS as PROVIDER_DEFAULTS, DEFAULT_FONTS as PROVIDER_FONT_DEFAULTS, DEFAULT_DESIGN_TOKENS } from "@/contexts/ThemeColorsProvider";

/* ─── Types ─── */
interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeFonts {
  heading: string;
  body: string;
  headingSize: number;
  bodySize: number;
  headingWeight: string;
  bodyWeight: string;
  lineHeight: number;
  letterSpacing: number;
}

interface ThemePreset {
  name: string;
  description: string;
  colors: ThemeColors;
  lightColors?: ThemeColors;
}

interface DesignTokens {
  palettePreset: "light" | "dark" | "luxury-gold" | "minimalist-tailwind";
  radiusPreset: "sharp" | "soft" | "glass";
  shadowPreset: "none" | "soft" | "glass";
}

/* ─── Defaults ─── */
const DEFAULT_COLORS: ThemeColors = { ...PROVIDER_DEFAULTS };

const DEFAULT_FONTS: ThemeFonts = { ...PROVIDER_FONT_DEFAULTS };

const FONT_OPTIONS = [
  "Playfair Display", "Inter", "Poppins", "Montserrat", "Raleway",
  "Lora", "Merriweather", "Open Sans", "Roboto", "Cinzel",
  "Cormorant Garamond", "DM Sans", "Nunito", "Source Sans Pro", "Work Sans",
];

const WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
];

function generateLightVariant(dark: ThemeColors): ThemeColors {
  return {
    ...dark,
    background: "#FAFAFA",
    surface: "#FFFFFF",
    text: "#1A1A1A",
    textMuted: "#6B7280",
    border: "#E5E7EB",
    secondary: "#F3F4F6",
  };
}

const PRESETS: ThemePreset[] = [
  {
    name: "Vanir Gold (Default)",
    description: "Ultra-premium black and deep gold",
    colors: { ...DEFAULT_COLORS, primary: "#B8860B", primaryLight: "#F5E6B8", accent: "#C9A84C", secondary: "#1A1A1A", background: "#0D0D0D", surface: "#141414", text: "#FFFFFF", textMuted: "#9CA3AF", border: "#2A2A2A" },
  },
  {
    name: "Royal Sapphire",
    description: "Deep majestic blue with crisp silver",
    colors: { ...DEFAULT_COLORS, primary: "#1E40AF", primaryLight: "#93C5FD", accent: "#3B82F6", secondary: "#0F172A", background: "#0A0F1E", surface: "#111827", text: "#F8FAFC", textMuted: "#94A3B8", border: "#1E293B" },
  },
  {
    name: "Imperial Emerald",
    description: "Rich emerald with vibrant green tones",
    colors: { ...DEFAULT_COLORS, primary: "#065F46", primaryLight: "#86EFAC", accent: "#10B981", secondary: "#042F2E", background: "#0B1F1A", surface: "#0F2F2A", text: "#F0FDF4", textMuted: "#A7E8A7", border: "#1B4332" },
  },
  {
    name: "Obsidian Platinum",
    description: "Sleek dark charcoal with polished platinum",
    colors: { ...DEFAULT_COLORS, primary: "#475569", primaryLight: "#CBD5E1", accent: "#94A3B8", secondary: "#020617", background: "#0F172A", surface: "#1E293B", text: "#F8FAFC", textMuted: "#64748B", border: "#334155" },
  },
  {
    name: "Vintage Walnut",
    description: "Sophisticated dark chocolate and bronze",
    colors: { ...DEFAULT_COLORS, primary: "#8B4513", primaryLight: "#D2B48C", accent: "#CD7F32", secondary: "#1C110A", background: "#2A1810", surface: "#3D2817", text: "#FFFDF5", textMuted: "#D3C0AA", border: "#5C3D1A" },
  },
  {
    name: "Nordic Sage",
    description: "Calming muted sage with forest tones",
    colors: { ...DEFAULT_COLORS, primary: "#2F4F4F", primaryLight: "#CAD2C5", accent: "#52796F", secondary: "#111D1A", background: "#0D1612", surface: "#152620", text: "#F5F6F1", textMuted: "#7A8A7F", border: "#25453D" },
  },
  {
    name: "Midnight Ocean",
    description: "Deep navy with luminous icy cyan tones",
    colors: { ...DEFAULT_COLORS, primary: "#0A192F", primaryLight: "#64FFDA", accent: "#172A45", secondary: "#020C1B", background: "#001428", surface: "#081D36", text: "#FFFFFF", textMuted: "#8BA2B8", border: "#0F2F3D" },
  },
  {
    name: "Desert Terracotta",
    description: "Earthy warm clay with sun-bleached sand",
    colors: { ...DEFAULT_COLORS, primary: "#C2410C", primaryLight: "#FED7AA", accent: "#EA580C", secondary: "#2A1008", background: "#1F0F05", surface: "#2D1609", text: "#FFF7ED", textMuted: "#FDBA74", border: "#7C2D12" },
  },
  {
    name: "Cyber Velvet",
    description: "High-tech neon cyan in premium violet",
    colors: { ...DEFAULT_COLORS, primary: "#0891B2", primaryLight: "#A5F3FC", accent: "#4F46E5", secondary: "#0B0726", background: "#050810", surface: "#0F0A18", text: "#FFFFFF", textMuted: "#A8B5FB", border: "#1F0F3D" },
  },
  {
    name: "Amethyst Night",
    description: "Majestic deep purple with lavender",
    colors: { ...DEFAULT_COLORS, primary: "#6D28D9", primaryLight: "#E9D5FF", accent: "#A78BFA", secondary: "#120626", background: "#0A0514", surface: "#150829", text: "#FAF5FF", textMuted: "#C4B5FD", border: "#2E1065" },
  },
  {
    name: "Corporate Teal",
    description: "Professional dark teal with slate grays",
    colors: { ...DEFAULT_COLORS, primary: "#0F766E", primaryLight: "#99F6E4", accent: "#14B8A6", secondary: "#0F172A", background: "#051E1C", surface: "#0D2620", text: "#F0FDFA", textMuted: "#7DCDCC", border: "#134E4A" },
  },
  {
    name: "Dusty Cashmere",
    description: "Elegant muted rose-gold with warm taupe",
    colors: { ...DEFAULT_COLORS, primary: "#8B4513", primaryLight: "#F5E6D3", accent: "#BC8F8F", secondary: "#2B1B1B", background: "#1A0F0F", surface: "#2A1818", text: "#FFFFFF", textMuted: "#D4A5A5", border: "#5C3D38" },
  },
  {
    name: "Mystic Lavender",
    description: "Soothing dark lavender with matte black",
    colors: { ...DEFAULT_COLORS, primary: "#7851A9", primaryLight: "#E9D5FF", accent: "#9B72AA", secondary: "#140A1D", background: "#0B0415", surface: "#14091F", text: "#F7F4F9", textMuted: "#C7B3D9", border: "#302460" },
  },
  {
    name: "Espresso Cream",
    description: "Deep coffee tones with vanilla cream",
    colors: { ...DEFAULT_COLORS, primary: "#4A3728", primaryLight: "#D2B48C", accent: "#8B6939", secondary: "#1A120B", background: "#0F0A07", surface: "#1C1410", text: "#FDFBF7", textMuted: "#B89B7F", border: "#3D2F24" },
  },
  {
    name: "Stealth Charcoal",
    description: "Monochromatic minimalist with clean white",
    colors: { ...DEFAULT_COLORS, primary: "#374151", primaryLight: "#F3F4F6", accent: "#4B5563", secondary: "#111827", background: "#030712", surface: "#1F2937", text: "#F9FAFB", textMuted: "#9CA3AF", border: "#2D3748" },
  },
];

const PALETTE_PRESET_COLORS: Record<DesignTokens["palettePreset"], ThemeColors> = {
  light: { ...DEFAULT_COLORS, background: "#FAFAFA", surface: "#FFFFFF", text: "#171717", textMuted: "#6B7280", border: "#E5E7EB", secondary: "#F3F4F6", primary: "#B8860B", primaryLight: "#F5E6B8", accent: "#D4A853" },
  dark: { ...DEFAULT_COLORS, background: "#050505", surface: "#121212", text: "#FFFFFF", textMuted: "#9CA3AF", border: "#2A2A2A", secondary: "#1A1A1A", primary: "#8B7355", primaryLight: "#D6C6A6", accent: "#A68A64" },
  "luxury-gold": { ...DEFAULT_COLORS, primary: "#B8860B", primaryLight: "#F5E6B8", accent: "#C9A84C", secondary: "#1A1A1A", background: "#0D0D0D", surface: "#141414", text: "#FFFFFF", textMuted: "#9CA3AF", border: "#2A2A2A" },
  "minimalist-tailwind": { ...DEFAULT_COLORS, primary: "#111827", primaryLight: "#374151", accent: "#6B7280", secondary: "#F9FAFB", background: "#F3F4F6", surface: "#FFFFFF", text: "#111827", textMuted: "#6B7280", border: "#D1D5DB" },
};

/* ─── Color Swatch ─── */
function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/5">
      <div className="relative">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/10 bg-transparent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90">{label}</p>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 mt-1 text-xs font-mono bg-black/40 border-white/10 text-white/70 uppercase" maxLength={7} />
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ThemeAdmin() {
  const [colors, setColors] = useState<ThemeColors>({ ...DEFAULT_COLORS });
  const [fonts, setFonts] = useState<ThemeFonts>({ ...DEFAULT_FONTS });
  const [activePreset, setActivePreset] = useState("Vanir Gold (Default)");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [fontPairing, setFontPairing] = useState("luxury");
  const [designTokens, setDesignTokens] = useState<DesignTokens>(DEFAULT_DESIGN_TOKENS);

  const { refetch: refetchTheme } = useThemeColors();
  const previewRef = useRef<HTMLDivElement>(null);

  const themeQuery = trpc.siteSettings.getByCategory.useQuery({ category: "theme" });
  const saveMutation = trpc.siteSettings.setMany.useMutation();
  const versionsQuery = trpc.siteSettings.listDesignVersions.useQuery({ limit: 12 });
  const rollbackMut = trpc.siteSettings.rollbackDesignVersion.useMutation();

  useEffect(() => {
    if (themeQuery.data) {
      try {
        if (themeQuery.data.colors) setColors(JSON.parse(themeQuery.data.colors));
        if (themeQuery.data.fonts) setFonts(JSON.parse(themeQuery.data.fonts));
        if (themeQuery.data.preset) setActivePreset(themeQuery.data.preset);
        if (themeQuery.data.darkMode) setDarkMode(themeQuery.data.darkMode === "true");
        if (themeQuery.data.fontPairing) setFontPairing(themeQuery.data.fontPairing);
        if (themeQuery.data.design_tokens) setDesignTokens(JSON.parse(themeQuery.data.design_tokens));
      } catch { /* ignore */ }
    }
  }, [themeQuery.data]);

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const updateFont = (key: keyof ThemeFonts, value: string | number) => {
    setFonts((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const applyPreset = (preset: ThemePreset) => {
    const baseColors = preset.colors;
    const effectiveColors = darkMode ? baseColors : generateLightVariant(baseColors);
    setColors(effectiveColors);
    setActivePreset(preset.name);
    setHasChanges(true);
    setSaved(false);
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    const preset = PRESETS.find(p => p.name === activePreset);
    if (preset) {
      const newColors = enabled ? preset.colors : generateLightVariant(preset.colors);
      setColors(newColors);
    } else {
      if (!enabled) setColors(prev => generateLightVariant(prev));
    }
    setHasChanges(true);
    setSaved(false);
  };

  const handleFontPairingChange = (pairingId: string) => {
    setFontPairing(pairingId);
    const pairing = FONT_PAIRINGS.find(p => p.id === pairingId);
    if (pairing) {
      setFonts(prev => ({ ...prev, heading: pairing.heading, body: pairing.body }));
    }
    setHasChanges(true);
    setSaved(false);
  };

  const resetToDefault = () => {
    setColors({ ...DEFAULT_COLORS });
    setFonts({ ...DEFAULT_FONTS });
    setActivePreset("Vanir Gold (Default)");
    setDarkMode(true);
    setFontPairing("luxury");
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveMutation.mutateAsync({
        category: "theme",
        settings: {
          colors: JSON.stringify(colors),
          fonts: JSON.stringify(fonts),
          preset: activePreset,
          darkMode: String(darkMode),
          fontPairing: fontPairing,
          design_tokens: JSON.stringify(designTokens),
        },
      });

      // Apply CSS variables immediately
      const root = document.documentElement;
      root.style.setProperty("--theme-primary", colors.primary);
      root.style.setProperty("--theme-primary-light", colors.primaryLight);
      root.style.setProperty("--theme-accent", colors.accent);
      root.style.setProperty("--theme-secondary", colors.secondary);
      root.style.setProperty("--theme-background", colors.background);
      root.style.setProperty("--theme-surface", colors.surface);
      root.style.setProperty("--theme-text", colors.text);
      root.style.setProperty("--theme-text-muted", colors.textMuted);
      root.style.setProperty("--theme-border", colors.border);
      root.style.setProperty("--theme-success", colors.success);
      root.style.setProperty("--theme-warning", colors.warning);
      root.style.setProperty("--theme-error", colors.error);
      root.style.setProperty("--theme-primary-10", colors.primary + "1a");
      root.style.setProperty("--theme-primary-20", colors.primary + "33");
      root.style.setProperty("--theme-primary-30", colors.primary + "4d");
      root.style.setProperty("--theme-primary-50", colors.primary + "80");
      root.style.setProperty("--theme-primary-70", colors.primary + "b3");
      root.style.setProperty("--theme-font-heading", fonts.heading);
      root.style.setProperty("--theme-font-body", fonts.body);
      root.style.setProperty("--theme-font-heading-size", `${fonts.headingSize}px`);
      root.style.setProperty("--theme-font-body-size", `${fonts.bodySize}px`);
      root.style.setProperty("--theme-font-heading-weight", fonts.headingWeight);
      root.style.setProperty("--theme-font-body-weight", fonts.bodyWeight);
      root.style.setProperty("--theme-line-height", String(fonts.lineHeight));
      root.style.setProperty("--theme-letter-spacing", `${fonts.letterSpacing}px`);
      root.style.setProperty("--theme-radius", designTokens.radiusPreset === "sharp" ? "0px" : designTokens.radiusPreset === "glass" ? "16px" : "10px");
      root.style.setProperty("--theme-shadow", designTokens.shadowPreset === "none" ? "none" : designTokens.shadowPreset === "glass" ? "0 8px 24px rgba(0, 0, 0, 0.28)" : "0 6px 18px rgba(0, 0, 0, 0.2)");

      if (darkMode) root.classList.add("dark");
      else root.classList.remove("dark");

      refetchTheme();
      setSaved(true);
      setHasChanges(false);
      toast.success("Theme saved to Firebase Firestore");
    } catch (err: unknown) {
      toast.error(`Failed to save theme: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const exportTheme = () => {
    const themeData = { colors, fonts, preset: activePreset, darkMode, fontPairing, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vanir-theme-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed.colors) setColors(parsed.colors);
          if (parsed.fonts) setFonts(parsed.fonts);
          if (parsed.preset) setActivePreset(parsed.preset);
          if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode);
          if (parsed.fontPairing) setFontPairing(parsed.fontPairing);
          setHasChanges(true);
          setSaved(false);
        } catch { alert("Invalid theme file"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-[var(--theme-primary)]" />
            Theme & Colors
          </h1>
          <p className="text-white/50 mt-1">Customize your website's visual identity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={importTheme} className="border-white/10 text-white/70 hover:text-white">
            <Upload className="w-4 h-4 mr-1" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={exportTheme} className="border-white/10 text-white/70 hover:text-white">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={resetToDefault} className="border-white/10 text-white/70 hover:text-white">
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="colors" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Palette className="w-4 h-4 mr-1" /> Colors
          </TabsTrigger>
          <TabsTrigger value="fonts" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Type className="w-4 h-4 mr-1" /> Typography
          </TabsTrigger>
          <TabsTrigger value="presets" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Sparkles className="w-4 h-4 mr-1" /> Presets
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Eye className="w-4 h-4 mr-1" /> Preview
          </TabsTrigger>
          <TabsTrigger value="mode" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Moon className="w-4 h-4 mr-1" /> Mode & Fonts
          </TabsTrigger>
          <TabsTrigger value="versions" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <History className="w-4 h-4 mr-1" /> Versions
          </TabsTrigger>
        </TabsList>

        {/* ─── Colors Tab ─── */}
        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Brand Colors</CardTitle>
                <CardDescription className="text-white/50">Primary colors that define your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorSwatch label="Primary (Gold)" value={colors.primary} onChange={(v) => updateColor("primary", v)} />
                <ColorSwatch label="Primary Light" value={colors.primaryLight} onChange={(v) => updateColor("primaryLight", v)} />
                <ColorSwatch label="Accent" value={colors.accent} onChange={(v) => updateColor("accent", v)} />
                <ColorSwatch label="Secondary" value={colors.secondary} onChange={(v) => updateColor("secondary", v)} />
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Background & Surface</CardTitle>
                <CardDescription className="text-white/50">Page backgrounds and card surfaces</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorSwatch label="Background" value={colors.background} onChange={(v) => updateColor("background", v)} />
                <ColorSwatch label="Surface (Cards)" value={colors.surface} onChange={(v) => updateColor("surface", v)} />
                <ColorSwatch label="Border" value={colors.border} onChange={(v) => updateColor("border", v)} />
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Text Colors</CardTitle>
                <CardDescription className="text-white/50">Typography and content colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorSwatch label="Text Primary" value={colors.text} onChange={(v) => updateColor("text", v)} />
                <ColorSwatch label="Text Muted" value={colors.textMuted} onChange={(v) => updateColor("textMuted", v)} />
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Status Colors</CardTitle>
                <CardDescription className="text-white/50">Feedback and notification colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorSwatch label="Success" value={colors.success} onChange={(v) => updateColor("success", v)} />
                <ColorSwatch label="Warning" value={colors.warning} onChange={(v) => updateColor("warning", v)} />
                <ColorSwatch label="Error" value={colors.error} onChange={(v) => updateColor("error", v)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Typography Tab ─── */}
        <TabsContent value="fonts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Heading Font</CardTitle>
                <CardDescription className="text-white/50">Font used for titles and headings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm">Font Family</Label>
                  <Select value={fonts.heading} onValueChange={(v) => updateFont("heading", v)}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Size: {fonts.headingSize}px</Label>
                  <Slider value={[fonts.headingSize]} onValueChange={([v]) => updateFont("headingSize", v)} min={20} max={72} step={1} className="mt-2" />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Weight</Label>
                  <Select value={fonts.headingWeight} onValueChange={(v) => updateFont("headingWeight", v)}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((w) => <SelectItem key={w.value} value={w.value}>{w.label} ({w.value})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-white/50 text-xs mb-2">Preview:</p>
                  <p style={{ fontFamily: fonts.heading, fontSize: `${fonts.headingSize}px`, fontWeight: fonts.headingWeight, color: colors.primary }}>Vanir Group</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Body Font</CardTitle>
                <CardDescription className="text-white/50">Font used for paragraphs and content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm">Font Family</Label>
                  <Select value={fonts.body} onValueChange={(v) => updateFont("body", v)}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Size: {fonts.bodySize}px</Label>
                  <Slider value={[fonts.bodySize]} onValueChange={([v]) => updateFont("bodySize", v)} min={12} max={24} step={1} className="mt-2" />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Weight</Label>
                  <Select value={fonts.bodyWeight} onValueChange={(v) => updateFont("bodyWeight", v)}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((w) => <SelectItem key={w.value} value={w.value}>{w.label} ({w.value})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Line Height: {fonts.lineHeight}</Label>
                  <Slider value={[fonts.lineHeight * 10]} onValueChange={([v]) => updateFont("lineHeight", v / 10)} min={10} max={25} step={1} className="mt-2" />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Letter Spacing: {fonts.letterSpacing}px</Label>
                  <Slider value={[fonts.letterSpacing + 5]} onValueChange={([v]) => updateFont("letterSpacing", v - 5)} min={0} max={10} step={1} className="mt-2" />
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-white/50 text-xs mb-2">Preview:</p>
                  <p style={{ fontFamily: fonts.body, fontSize: `${fonts.bodySize}px`, fontWeight: fonts.bodyWeight, lineHeight: fonts.lineHeight, letterSpacing: `${fonts.letterSpacing}px`, color: colors.text }}>
                    Discover Egypt's timeless wonders with Vanir Group. From the majestic pyramids to the serene Nile cruises.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Presets Tab ─── */}
        <TabsContent value="presets" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-4 py-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
              <Moon className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/60 ml-2">{darkMode ? "Dark Mode" : "Light Mode"}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESETS.map((preset) => (
              <Card
                key={preset.name}
                className={`bg-black/40 border cursor-pointer transition-all hover:scale-[1.02] ${
                  activePreset === preset.name ? "border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)]/30" : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => applyPreset(preset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {activePreset === preset.name && <Check className="w-4 h-4 text-[var(--theme-primary)]" />}
                    <h3 className="text-white font-medium">{preset.name}</h3>
                  </div>
                  <p className="text-white/50 text-sm mb-3">{preset.description}</p>
                  <div className="flex gap-1.5">
                    {[preset.colors.primary, preset.colors.primaryLight, preset.colors.accent, preset.colors.background, preset.colors.surface].map((c, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Mode & Fonts Tab ─── */}
        <TabsContent value="mode" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dark/Light Toggle */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  Dark / Light Mode
                </CardTitle>
                <CardDescription className="text-white/50">Toggle between dark and light mode for all 15 presets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-black/30 rounded-lg border border-white/5">
                  <Sun className="w-5 h-5 text-yellow-400" />
                  <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
                  <Moon className="w-5 h-5 text-blue-400" />
                  <span className="text-white/70 text-sm">{darkMode ? "Dark Mode Active" : "Light Mode Active"}</span>
                </div>
                <p className="text-xs text-white/40">
                  Switching mode applies to the currently active preset. Light mode generates light backgrounds and dark text automatically while preserving the preset&apos;s brand colors.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-4 border border-white/10" style={{ backgroundColor: colors.background }}>
                    <p style={{ color: colors.text, fontWeight: "bold", fontSize: "14px" }}>Background</p>
                    <p style={{ color: colors.textMuted, fontSize: "12px" }}>{colors.background}</p>
                  </div>
                  <div className="rounded-lg p-4 border border-white/10" style={{ backgroundColor: colors.surface }}>
                    <p style={{ color: colors.text, fontWeight: "bold", fontSize: "14px" }}>Surface</p>
                    <p style={{ color: colors.textMuted, fontSize: "12px" }}>{colors.surface}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Pairing Selector */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Font Pairing
                </CardTitle>
                <CardDescription className="text-white/50">Choose curated Google Font pairings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {FONT_PAIRINGS.map(pairing => (
                  <button
                    key={pairing.id}
                    onClick={() => handleFontPairingChange(pairing.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      fontPairing === pairing.id
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{pairing.label}</span>
                      {fontPairing === pairing.id && <Check className="w-4 h-4 text-[var(--theme-primary)]" />}
                    </div>
                    <p className="text-xs text-white/40 mb-2">{pairing.description}</p>
                    <div className="space-y-1">
                      <p style={{ fontFamily: pairing.heading, fontSize: "18px", fontWeight: "700", color: colors.primary }}>
                        Heading: {pairing.heading}
                      </p>
                      <p style={{ fontFamily: pairing.body, fontSize: "14px", color: colors.textMuted }}>
                        Body: {pairing.body} — The quick brown fox jumps over the lazy dog.
                      </p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Global Radius & Shadows
                </CardTitle>
                <CardDescription className="text-white/50">Sharp corners, soft rounded, or glassmorphism presentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm">Palette Preset</Label>
                  <Select
                    value={designTokens.palettePreset}
                    onValueChange={(v) => {
                      const nextPreset = v as DesignTokens["palettePreset"];
                      setDesignTokens((prev) => ({ ...prev, palettePreset: nextPreset }));
                      setColors(PALETTE_PRESET_COLORS[nextPreset]);
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="luxury-gold">Luxury / Gold</SelectItem>
                      <SelectItem value="minimalist-tailwind">Minimalist Tailwind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Border Radius Style</Label>
                  <Select value={designTokens.radiusPreset} onValueChange={(v) => { setDesignTokens((prev) => ({ ...prev, radiusPreset: v as DesignTokens["radiusPreset"] })); setHasChanges(true); }}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sharp">Sharp Corners</SelectItem>
                      <SelectItem value="soft">Soft Rounded</SelectItem>
                      <SelectItem value="glass">Glassmorphism Rounded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Shadow Style</Label>
                  <Select value={designTokens.shadowPreset} onValueChange={(v) => { setDesignTokens((prev) => ({ ...prev, shadowPreset: v as DesignTokens["shadowPreset"] })); setHasChanges(true); }}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Shadow</SelectItem>
                      <SelectItem value="soft">Soft Shadow</SelectItem>
                      <SelectItem value="glass">Glass Shadow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Design Version History</CardTitle>
              <CardDescription className="text-white/50">Rollback any saved visual snapshot instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {versionsQuery.data?.length ? versionsQuery.data.map((version: any) => (
                <div key={version.id} className="border border-white/10 rounded-lg p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">{version.reason || "Design change"}</p>
                    <p className="text-xs text-white/50">{version.createdAt ? new Date(version.createdAt).toLocaleString() : "Unknown date"}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={rollbackMut.isPending}
                    onClick={async () => {
                      await rollbackMut.mutateAsync({ versionId: version.id });
                      await Promise.all([themeQuery.refetch(), versionsQuery.refetch()]);
                      refetchTheme();
                      toast.success("Design rollback applied");
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Undo2 className="w-4 h-4 mr-1" /> Rollback
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-white/60">No versions found yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Live Preview Tab ─── */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="border-white/10 overflow-hidden" ref={previewRef} style={{ backgroundColor: colors.background }}>
            <CardContent className="p-0">
              {/* Navbar Preview */}
              <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ fontFamily: fonts.heading, fontWeight: fonts.headingWeight, color: colors.primary, fontSize: "18px" }}>
                  VANIR GROUP
                </span>
                <div className="flex gap-4">
                  {["Home", "Destinations", "Offers", "Blog"].map((item) => (
                    <span key={item} style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: "14px" }}>{item}</span>
                  ))}
                </div>
              </div>

              {/* Hero Preview */}
              <div className="px-6 py-12 text-center">
                <p style={{ color: colors.primary, fontFamily: fonts.body, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}>
                  Luxury Travel
                </p>
                <h1 style={{ fontFamily: fonts.heading, fontSize: `${Math.min(fonts.headingSize, 42)}px`, fontWeight: fonts.headingWeight, color: colors.text, margin: "12px 0" }}>
                  Discover Egypt's Wonders
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: `${fonts.bodySize}px`, fontWeight: fonts.bodyWeight, color: colors.textMuted, lineHeight: fonts.lineHeight, maxWidth: "500px", margin: "0 auto" }}>
                  Experience the magic of ancient civilizations with our premium travel packages.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  <button style={{ backgroundColor: colors.primary, color: colors.background, padding: "10px 24px", borderRadius: "8px", fontFamily: fonts.body, fontWeight: "600", fontSize: "14px" }}>
                    Begin Your Journey
                  </button>
                  <button style={{ border: `1px solid ${colors.primary}`, color: colors.primary, padding: "10px 24px", borderRadius: "8px", fontFamily: fonts.body, fontWeight: "600", fontSize: "14px", background: "transparent" }}>
                    Explore Gallery
                  </button>
                </div>
              </div>

              {/* Cards Preview */}
              <div className="px-6 pb-8 grid grid-cols-3 gap-4">
                {["Cairo", "Luxor", "Aswan"].map((city) => (
                  <div key={city} className="rounded-lg p-4" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                    <div className="w-full h-20 rounded-md mb-3" style={{ backgroundColor: colors.primary + "20" }} />
                    <h3 style={{ fontFamily: fonts.heading, color: colors.text, fontSize: "16px", fontWeight: "600" }}>{city}</h3>
                    <p style={{ fontFamily: fonts.body, color: colors.textMuted, fontSize: "13px", marginTop: "4px" }}>Explore the wonders</p>
                    <div className="flex items-center justify-between mt-3">
                      <span style={{ color: colors.primary, fontWeight: "700", fontSize: "14px" }}>$1,299</span>
                      <span style={{ color: colors.success, fontSize: "12px" }}>Available</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Preview */}
              <div className="px-6 py-6" style={{ backgroundColor: colors.surface, borderTop: `1px solid ${colors.border}` }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: fonts.heading, color: colors.primary, fontSize: "14px", fontWeight: "600" }}>VANIR GROUP</span>
                  <div className="flex gap-4">
                    {["About", "Contact", "Privacy"].map(item => (
                      <span key={item} style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: "12px" }}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-white/30 text-center">
            Live preview updates as you change colors, fonts, and mode. Click &quot;Save Changes&quot; to publish.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
