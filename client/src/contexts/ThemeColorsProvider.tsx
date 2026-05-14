import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { trpc } from "@/lib/trpc";

/**
 * ThemeColorsProvider
 * Loads theme colors from DB (public endpoint) and applies them as CSS custom properties
 * on document.documentElement so all components using var(--theme-*) pick them up.
 *
 * Color mapping from DB (ThemeAdmin saves these keys):
 *   primary      → --theme-primary       (Gold: #D4A853)
 *   primaryLight → --theme-primary-light  (Light Gold: #F5E6B8)
 *   accent       → --theme-accent         (Accent: #C9A84C)
 *   secondary    → --theme-secondary      (Dark: #1A1A2E)
 *   background   → --theme-background     (BG: #0A0A0A)
 *   surface      → --theme-surface        (Surface: #141414)
 *   text         → --theme-text           (White: #FFFFFF)
 *   textMuted    → --theme-text-muted     (Muted: #9CA3AF)
 *   border       → --theme-border         (Border: #2A2A2A)
 *   success      → --theme-success
 *   warning      → --theme-warning
 *   error        → --theme-error
 */

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

interface ThemeColorsContextType {
  colors: ThemeColors;
  isLoaded: boolean;
}

const ThemeColorsContext = createContext<ThemeColorsContextType>({
  colors: DEFAULT_COLORS,
  isLoaded: false,
});

export function useThemeColors() {
  return useContext(ThemeColorsContext);
}

/**
 * Apply theme colors as CSS custom properties on :root
 */
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

  // Also compute opacity variants for primary
  root.style.setProperty("--theme-primary-10", colors.primary + "1a");
  root.style.setProperty("--theme-primary-20", colors.primary + "33");
  root.style.setProperty("--theme-primary-30", colors.primary + "4d");
  root.style.setProperty("--theme-primary-50", colors.primary + "80");
  root.style.setProperty("--theme-primary-70", colors.primary + "b3");
}

export function ThemeColorsProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [isLoaded, setIsLoaded] = useState(false);

  const themeQuery = trpc.siteSettings.getTheme.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  useEffect(() => {
    // Apply defaults immediately so CSS vars are available
    applyColorsToDOM(DEFAULT_COLORS);
  }, []);

  useEffect(() => {
    if (themeQuery.data) {
      try {
        const dbColors = themeQuery.data.colors
          ? JSON.parse(themeQuery.data.colors)
          : null;
        if (dbColors) {
          const merged = { ...DEFAULT_COLORS, ...dbColors };
          setColors(merged);
          applyColorsToDOM(merged);
        }
      } catch {
        // If parsing fails, keep defaults
      }
      setIsLoaded(true);
    } else if (themeQuery.isError || themeQuery.data === null) {
      // No theme in DB or error - use defaults
      setIsLoaded(true);
    }
  }, [themeQuery.data, themeQuery.isError]);

  return (
    <ThemeColorsContext.Provider value={{ colors, isLoaded }}>
      {children}
    </ThemeColorsContext.Provider>
  );
}
