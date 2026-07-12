import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";

/**
 * ThemeColorsProvider
 * Loads theme colors, fonts, dark mode, and navbar styles from DB (public endpoint)
 * and applies them as CSS custom properties on document.documentElement.
 */

/* ─── Types ─── */
export interface ThemeColors {
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

export interface ThemeFonts {
  heading: string;
  body: string;
  headingSize: number;
  bodySize: number;
  headingWeight: string;
  bodyWeight: string;
  lineHeight: number;
  letterSpacing: number;
}

export interface NavbarStyle {
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  hoverAnimation: "fade" | "slide" | "glow" | "none";
  fontWeight: string;
  bgOpacity: number;
  blurEnabled: boolean;
  blurAmount: number;
  bgColorOverride: string;
  linkColorOverride: string;
  activeLinkColorOverride: string;
}

export interface DesignTokens {
  palettePreset: "light" | "dark" | "luxury-gold" | "minimalist-tailwind";
  radiusPreset: "sharp" | "soft" | "glass";
  shadowPreset: "none" | "soft" | "glass";
}

export interface HeroSettings {
  title: string;
  rotatingWords: string[];
  subtitle: string;
  buttonText1: string;
  buttonText2: string;
  buttonLink1: string;
  buttonLink2: string;
  mediaType: "image" | "video" | "gradient";
  mediaUrl: string;
  overlayOpacity: number;
  overlayColor: "dark" | "light";
}

export interface SubPageHero {
  page: string;
  layout: "centered" | "split" | "fullbleed";
  title: string;
  subtitle: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "gradient";
  gradientFrom: string;
  gradientTo: string;
  overlayOpacity: number;
}

/* ─── Defaults ─── */
export const DEFAULT_COLORS: ThemeColors = {
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

export const DEFAULT_FONTS: ThemeFonts = {
  heading: "Playfair Display",
  body: "Inter",
  headingSize: 36,
  bodySize: 16,
  headingWeight: "700",
  bodyWeight: "400",
  lineHeight: 1.6,
  letterSpacing: 0,
};

export const DEFAULT_NAVBAR_STYLE: NavbarStyle = {
  borderRadius: 8,
  paddingX: 16,
  paddingY: 8,
  hoverAnimation: "fade",
  fontWeight: "500",
  bgOpacity: 80,
  blurEnabled: true,
  blurAmount: 12,
  bgColorOverride: "",
  linkColorOverride: "",
  activeLinkColorOverride: "",
};

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  palettePreset: "luxury-gold",
  radiusPreset: "soft",
  shadowPreset: "soft",
};

export const FONT_PAIRINGS = [
  { id: "modern", label: "Modern Sans", heading: "Inter", body: "DM Sans", description: "Clean tech aesthetic" },
  { id: "luxury", label: "Luxury Serif", heading: "Playfair Display", body: "Lora", description: "Classic elegance" },
  { id: "bold", label: "Bold Display", heading: "Montserrat", body: "Open Sans", description: "Modern & striking" },
] as const;

/* ─── Context ─── */
interface ThemeContextType {
  colors: ThemeColors;
  fonts: ThemeFonts;
  navbarStyle: NavbarStyle;
  darkMode: boolean;
  fontPairing: string;
  designTokens: DesignTokens;
  isLoaded: boolean;
  refetch: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: DEFAULT_COLORS,
  fonts: DEFAULT_FONTS,
  navbarStyle: DEFAULT_NAVBAR_STYLE,
  darkMode: true,
  fontPairing: "luxury",
  designTokens: DEFAULT_DESIGN_TOKENS,
  isLoaded: false,
  refetch: () => {},
});

export function useThemeColors() {
  return useContext(ThemeContext);
}

/* ─── Apply to DOM ─── */
function applyColorsToDOM(colors: ThemeColors) {
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
}

function applyFontsToDOM(fonts: ThemeFonts) {
  const root = document.documentElement;
  root.style.setProperty("--theme-font-heading", fonts.heading);
  root.style.setProperty("--theme-font-body", fonts.body);
  root.style.setProperty("--theme-font-heading-size", `${fonts.headingSize}px`);
  root.style.setProperty("--theme-font-body-size", `${fonts.bodySize}px`);
  root.style.setProperty("--theme-font-heading-weight", fonts.headingWeight);
  root.style.setProperty("--theme-font-body-weight", fonts.bodyWeight);
  root.style.setProperty("--theme-line-height", String(fonts.lineHeight));
  root.style.setProperty("--theme-letter-spacing", `${fonts.letterSpacing}px`);
}

function applyNavbarToDOM(style: NavbarStyle) {
  const root = document.documentElement;
  root.style.setProperty("--navbar-border-radius", `${style.borderRadius}px`);
  root.style.setProperty("--navbar-px", `${style.paddingX}px`);
  root.style.setProperty("--navbar-py", `${style.paddingY}px`);
  root.style.setProperty("--navbar-font-weight", style.fontWeight);
  root.style.setProperty("--navbar-bg-opacity", String(style.bgOpacity / 100));
  root.style.setProperty("--navbar-blur", style.blurEnabled ? `blur(${style.blurAmount}px)` : "none");
  if (style.bgColorOverride) root.style.setProperty("--navbar-bg-override", style.bgColorOverride);
  else root.style.removeProperty("--navbar-bg-override");
  if (style.linkColorOverride) root.style.setProperty("--navbar-link-override", style.linkColorOverride);
  else root.style.removeProperty("--navbar-link-override");
  if (style.activeLinkColorOverride) root.style.setProperty("--navbar-active-override", style.activeLinkColorOverride);
  else root.style.removeProperty("--navbar-active-override");
}

function applyDesignTokensToDOM(tokens: DesignTokens) {
  const root = document.documentElement;
  const radius = tokens.radiusPreset === "sharp" ? "0px" : tokens.radiusPreset === "glass" ? "16px" : "10px";
  const shadow = tokens.shadowPreset === "none"
    ? "none"
    : tokens.shadowPreset === "glass"
      ? "0 8px 24px rgba(0, 0, 0, 0.28)"
      : "0 6px 18px rgba(0, 0, 0, 0.2)";
  root.style.setProperty("--theme-radius", radius);
  root.style.setProperty("--theme-shadow", shadow);
}

/* ─── Provider ─── */
export function ThemeColorsProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [fonts, setFonts] = useState<ThemeFonts>(DEFAULT_FONTS);
  const [navbarStyle, setNavbarStyle] = useState<NavbarStyle>(DEFAULT_NAVBAR_STYLE);
  const [darkMode, setDarkMode] = useState(true);
  const [fontPairing, setFontPairing] = useState("luxury");
  const [designTokens, setDesignTokens] = useState<DesignTokens>(DEFAULT_DESIGN_TOKENS);
  const [isLoaded, setIsLoaded] = useState(false);

  const themeQuery = trpc.siteSettings.getTheme.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const refetch = useCallback(() => {
    themeQuery.refetch();
  }, [themeQuery]);

  useEffect(() => {
    applyColorsToDOM(DEFAULT_COLORS);
    applyFontsToDOM(DEFAULT_FONTS);
    applyNavbarToDOM(DEFAULT_NAVBAR_STYLE);
    applyDesignTokensToDOM(DEFAULT_DESIGN_TOKENS);
  }, []);

  useEffect(() => {
    if (themeQuery.data) {
      try {
        const d = themeQuery.data;
        if (d.colors) {
          const c = JSON.parse(d.colors);
          const merged = { ...DEFAULT_COLORS, ...c };
          setColors(merged);
          applyColorsToDOM(merged);
        }
        if (d.fonts) {
          const f = JSON.parse(d.fonts);
          const merged = { ...DEFAULT_FONTS, ...f };
          setFonts(merged);
          applyFontsToDOM(merged);
        }
        if (d.navbarStyle) {
          const n = JSON.parse(d.navbarStyle);
          const merged = { ...DEFAULT_NAVBAR_STYLE, ...n };
          setNavbarStyle(merged);
          applyNavbarToDOM(merged);
        }
        if (d.darkMode !== undefined) {
          const dm = d.darkMode === "true";
          setDarkMode(dm);
          if (dm) document.documentElement.classList.add("dark");
          else document.documentElement.classList.remove("dark");
        }
        if (d.fontPairing) {
          setFontPairing(d.fontPairing);
          const pairing = FONT_PAIRINGS.find(p => p.id === d.fontPairing);
          if (pairing) {
            const merged = { ...fonts, heading: pairing.heading, body: pairing.body };
            setFonts(merged);
            applyFontsToDOM(merged);
          }
        }
        if (d.design_tokens) {
          const tokens = JSON.parse(d.design_tokens);
          const merged = { ...DEFAULT_DESIGN_TOKENS, ...tokens };
          setDesignTokens(merged);
          applyDesignTokensToDOM(merged);
        }
      } catch {
        // keep defaults
      }
      setIsLoaded(true);
    } else if (themeQuery.isError || themeQuery.data === null) {
      setIsLoaded(true);
    }
  }, [themeQuery.data, themeQuery.isError]);

  return (
    <ThemeContext.Provider value={{ colors, fonts, navbarStyle, darkMode, fontPairing, designTokens, isLoaded, refetch }}>
      {children}
    </ThemeContext.Provider>
  );
}
