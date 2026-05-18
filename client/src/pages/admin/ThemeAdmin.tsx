import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Palette,
  Type,
  Eye,
  RotateCcw,
  Save,
  Download,
  Upload,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";

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
}

/* ─── Defaults ─── */
const DEFAULT_COLORS: ThemeColors = {
  primary: "#D4A853",
  primaryLight: "#F5E6B8",
  secondary: "#1A1A2E",
  accent: "#C9A84C",
  background: "#0A0A0A",
  surface: "#141414",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  border: "#2A2A2A",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
};

const DEFAULT_FONTS: ThemeFonts = {
  heading: "Playfair Display",
  body: "Inter",
  headingSize: 36,
  bodySize: 16,
  headingWeight: "700",
  bodyWeight: "400",
  lineHeight: 1.6,
  letterSpacing: 0,
};

const FONT_OPTIONS = [
  "Playfair Display",
  "Inter",
  "Poppins",
  "Montserrat",
  "Raleway",
  "Lora",
  "Merriweather",
  "Open Sans",
  "Roboto",
  "Cinzel",
  "Cormorant Garamond",
  "DM Sans",
  "Nunito",
  "Source Sans Pro",
  "Work Sans",
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

const PRESETS: ThemePreset[] = [
  {
    name: "Vanir Gold (Default)",
    description: "Black & Gold luxury theme",
    colors: { ...DEFAULT_COLORS },
  },
  {
    name: "Royal Blue",
    description: "Deep blue with silver accents",
    colors: {
      ...DEFAULT_COLORS,
      primary: "#4169E1",
      primaryLight: "#B8C9F5",
      accent: "#6B8DD6",
      secondary: "#0F1B3D",
      background: "#0A0F1E",
      surface: "#111827",
    },
  },
  {
    name: "Emerald Luxury",
    description: "Rich emerald with gold touches",
    colors: {
      ...DEFAULT_COLORS,
      primary: "#50C878",
      primaryLight: "#A8E6C3",
      accent: "#2E8B57",
      secondary: "#0D2818",
      background: "#0A1510",
      surface: "#0F1F15",
    },
  },
  {
    name: "Rose Elegance",
    description: "Soft rose with warm tones",
    colors: {
      ...DEFAULT_COLORS,
      primary: "#E8A0BF",
      primaryLight: "#F5D5E0",
      accent: "#D4789C",
      secondary: "#2E1A24",
      background: "#150D12",
      surface: "#1F1318",
    },
  },
  {
    name: "Midnight Purple",
    description: "Deep purple with violet accents",
    colors: {
      ...DEFAULT_COLORS,
      primary: "#9B59B6",
      primaryLight: "#D2B4DE",
      accent: "#8E44AD",
      secondary: "#1A0F2E",
      background: "#0D0A15",
      surface: "#15101F",
    },
  },
];

/* ─── Color Swatch ─── */
function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/5">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/10 bg-transparent"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90">{label}</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 mt-1 text-xs font-mono bg-black/40 border-white/10 text-white/70 uppercase"
          maxLength={7}
        />
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

  // Load theme from DB
  const themeQuery = trpc.siteSettings.getByCategory.useQuery({
    category: "theme",
  });
  const saveMutation = trpc.siteSettings.setMany.useMutation();

  useEffect(() => {
    if (themeQuery.data) {
      try {
        if (themeQuery.data.colors)
          setColors(JSON.parse(themeQuery.data.colors));
        if (themeQuery.data.fonts) setFonts(JSON.parse(themeQuery.data.fonts));
        if (themeQuery.data.preset) setActivePreset(themeQuery.data.preset);
      } catch {
        /* ignore */
      }
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
    setColors({ ...preset.colors });
    setActivePreset(preset.name);
    setHasChanges(true);
    setSaved(false);
  };

  const resetToDefault = () => {
    setColors({ ...DEFAULT_COLORS });
    setFonts({ ...DEFAULT_FONTS });
    setActivePreset("Vanir Gold (Default)");
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
        },
      });

      // Apply CSS variables to document root (matching ThemeColorsProvider)
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

      setSaved(true);
      setHasChanges(false);
      toast.success("Theme saved to database successfully");
    } catch (err: any) {
      toast.error(`Failed to save theme: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const exportTheme = () => {
    const themeData = {
      colors,
      fonts,
      preset: activePreset,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: "application/json",
    });
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
          setHasChanges(true);
          setSaved(false);
        } catch {
          alert("Invalid theme file");
        }
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
          <p className="text-white/50 mt-1">
            Customize your website's visual identity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={importTheme}
            className="border-white/10 text-white/70 hover:text-white"
          >
            <Upload className="w-4 h-4 mr-1" /> Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportTheme}
            className="border-white/10 text-white/70 hover:text-white"
          >
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="border-white/10 text-white/70 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)] disabled:opacity-50"
          >
            {saving ? (
              <span className="animate-spin mr-1">⏳</span>
            ) : saved ? (
              <Check className="w-4 h-4 mr-1" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger
            value="colors"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Palette className="w-4 h-4 mr-1" /> Colors
          </TabsTrigger>
          <TabsTrigger
            value="fonts"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Type className="w-4 h-4 mr-1" /> Typography
          </TabsTrigger>
          <TabsTrigger
            value="presets"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Sparkles className="w-4 h-4 mr-1" /> Presets
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Eye className="w-4 h-4 mr-1" /> Preview
          </TabsTrigger>
        </TabsList>

        {/* ─── Colors Tab ─── */}
        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Brand Colors
                </CardTitle>
                <CardDescription className="text-white/50">
                  Primary colors that define your brand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorSwatch
                  label="Primary (Gold)"
                  value={colors.primary}
                  onChange={(v) => updateColor("primary", v)}
                />
                <ColorSwatch
                  label="Primary Light"
                  value={colors.primaryLight}
                  onChange={(v) => updateColor("primaryLight", v)}
                />
                <ColorSwatch
                  label="Accent"
                  value={colors.accent}
                  onChange={(v) => updateColor("accent", v)}
                />
                <ColorSwatch
                  label="Secondary"
                  value={colors.secondary}
                  onChange={(v) => updateColor("secondary", v)}
                />
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Background & Surface
                </CardTitle>
                <CardDescription className="text-white/50">
                  Page backgrounds and card surfaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorSwatch
                  label="Background"
                  value={colors.background}
                  onChange={(v) => updateColor("background", v)}
                />
                <ColorSwatch
                  label="Surface (Cards)"
                  value={colors.surface}
                  onChange={(v) => updateColor("surface", v)}
                />
                <ColorSwatch
                  label="Border"
                  value={colors.border}
                  onChange={(v) => updateColor("border", v)}
                />
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Text Colors
                </CardTitle>
                <CardDescription className="text-white/50">
                  Typography and content colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorSwatch
                  label="Text Primary"
                  value={colors.text}
                  onChange={(v) => updateColor("text", v)}
                />
                <ColorSwatch
                  label="Text Muted"
                  value={colors.textMuted}
                  onChange={(v) => updateColor("textMuted", v)}
                />
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Status Colors
                </CardTitle>
                <CardDescription className="text-white/50">
                  Feedback and notification colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ColorSwatch
                  label="Success"
                  value={colors.success}
                  onChange={(v) => updateColor("success", v)}
                />
                <ColorSwatch
                  label="Warning"
                  value={colors.warning}
                  onChange={(v) => updateColor("warning", v)}
                />
                <ColorSwatch
                  label="Error"
                  value={colors.error}
                  onChange={(v) => updateColor("error", v)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Typography Tab ─── */}
        <TabsContent value="fonts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Heading Font
                </CardTitle>
                <CardDescription className="text-white/50">
                  Font used for titles and headings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm">Font Family</Label>
                  <Select
                    value={fonts.heading}
                    onValueChange={(v) => updateFont("heading", v)}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">
                    Size: {fonts.headingSize}px
                  </Label>
                  <Slider
                    value={[fonts.headingSize]}
                    onValueChange={([v]) => updateFont("headingSize", v)}
                    min={20}
                    max={72}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Weight</Label>
                  <Select
                    value={fonts.headingWeight}
                    onValueChange={(v) => updateFont("headingWeight", v)}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>
                          {w.label} ({w.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-white/50 text-xs mb-2">Preview:</p>
                  <p
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: `${fonts.headingSize}px`,
                      fontWeight: fonts.headingWeight,
                      color: colors.primary,
                    }}
                  >
                    Vanir Group
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Body Font</CardTitle>
                <CardDescription className="text-white/50">
                  Font used for paragraphs and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm">Font Family</Label>
                  <Select
                    value={fonts.body}
                    onValueChange={(v) => updateFont("body", v)}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">
                    Size: {fonts.bodySize}px
                  </Label>
                  <Slider
                    value={[fonts.bodySize]}
                    onValueChange={([v]) => updateFont("bodySize", v)}
                    min={12}
                    max={24}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Weight</Label>
                  <Select
                    value={fonts.bodyWeight}
                    onValueChange={(v) => updateFont("bodyWeight", v)}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>
                          {w.label} ({w.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">
                    Line Height: {fonts.lineHeight}
                  </Label>
                  <Slider
                    value={[fonts.lineHeight * 10]}
                    onValueChange={([v]) => updateFont("lineHeight", v / 10)}
                    min={10}
                    max={25}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">
                    Letter Spacing: {fonts.letterSpacing}px
                  </Label>
                  <Slider
                    value={[fonts.letterSpacing + 5]}
                    onValueChange={([v]) => updateFont("letterSpacing", v - 5)}
                    min={0}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-white/50 text-xs mb-2">Preview:</p>
                  <p
                    style={{
                      fontFamily: fonts.body,
                      fontSize: `${fonts.bodySize}px`,
                      fontWeight: fonts.bodyWeight,
                      lineHeight: fonts.lineHeight,
                      letterSpacing: `${fonts.letterSpacing}px`,
                      color: colors.text,
                    }}
                  >
                    Discover Egypt's timeless wonders with Vanir Group. From the
                    majestic pyramids to the serene Nile cruises.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Dark / Light Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Label className="text-white/70">Dark Mode</Label>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <span className="text-white/50 text-sm">
                  {darkMode ? "Enabled" : "Disabled"}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Presets Tab ─── */}
        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESETS.map((preset) => (
              <Card
                key={preset.name}
                className={`bg-black/40 border cursor-pointer transition-all hover:scale-[1.02] ${
                  activePreset === preset.name
                    ? "border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)]/30"
                    : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => applyPreset(preset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {activePreset === preset.name && (
                      <Check className="w-4 h-4 text-[var(--theme-primary)]" />
                    )}
                    <h3 className="text-white font-medium">{preset.name}</h3>
                  </div>
                  <p className="text-white/50 text-sm mb-3">
                    {preset.description}
                  </p>
                  <div className="flex gap-1.5">
                    {[
                      preset.colors.primary,
                      preset.colors.primaryLight,
                      preset.colors.accent,
                      preset.colors.background,
                      preset.colors.surface,
                    ].map((c, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border border-white/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Preview Tab ─── */}
        <TabsContent value="preview" className="space-y-4">
          <Card
            className="border-white/10 overflow-hidden"
            style={{ backgroundColor: colors.background }}
          >
            <CardContent className="p-0">
              {/* Navbar Preview */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{
                  backgroundColor: colors.surface,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.heading,
                    fontWeight: fonts.headingWeight,
                    color: colors.primary,
                    fontSize: "18px",
                  }}
                >
                  VANIR GROUP
                </span>
                <div className="flex gap-4">
                  {["Home", "Destinations", "Offers", "Blog"].map((item) => (
                    <span
                      key={item}
                      style={{
                        color: colors.textMuted,
                        fontFamily: fonts.body,
                        fontSize: "14px",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hero Preview */}
              <div className="px-6 py-12 text-center">
                <p
                  style={{
                    color: colors.primary,
                    fontFamily: fonts.body,
                    fontSize: "12px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                  }}
                >
                  Luxury Travel
                </p>
                <h1
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: `${Math.min(fonts.headingSize, 42)}px`,
                    fontWeight: fonts.headingWeight,
                    color: colors.text,
                    margin: "12px 0",
                  }}
                >
                  Discover Egypt's Wonders
                </h1>
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: `${fonts.bodySize}px`,
                    fontWeight: fonts.bodyWeight,
                    color: colors.textMuted,
                    lineHeight: fonts.lineHeight,
                    maxWidth: "500px",
                    margin: "0 auto",
                  }}
                >
                  Experience the magic of ancient civilizations with our premium
                  travel packages.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  <button
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.background,
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontFamily: fonts.body,
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Begin Your Journey
                  </button>
                  <button
                    style={{
                      border: `1px solid ${colors.primary}`,
                      color: colors.primary,
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontFamily: fonts.body,
                      fontWeight: "600",
                      fontSize: "14px",
                      background: "transparent",
                    }}
                  >
                    Explore Gallery
                  </button>
                </div>
              </div>

              {/* Cards Preview */}
              <div className="px-6 pb-8 grid grid-cols-3 gap-4">
                {["Cairo", "Luxor", "Aswan"].map((city) => (
                  <div
                    key={city}
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div
                      className="w-full h-20 rounded-md mb-3"
                      style={{ backgroundColor: colors.primary + "20" }}
                    />
                    <h3
                      style={{
                        fontFamily: fonts.heading,
                        color: colors.text,
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      {city}
                    </h3>
                    <p
                      style={{
                        fontFamily: fonts.body,
                        color: colors.textMuted,
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      Explore the wonders
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        style={{
                          color: colors.primary,
                          fontWeight: "700",
                          fontSize: "14px",
                        }}
                      >
                        $1,299
                      </span>
                      <span style={{ color: colors.success, fontSize: "12px" }}>
                        Available
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
