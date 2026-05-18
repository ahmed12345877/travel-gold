import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";

interface ThemeModeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(
  undefined,
);

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return context;
}

const STORAGE_KEY = "vanir-theme-mode";

/**
 * Get initial theme mode from:
 * 1. localStorage (user preference)
 * 2. System preference (prefers-color-scheme)
 * 3. Default to 'dark'
 */
function getInitialThemeMode(): ThemeMode {
  // Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Check system preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }

  return "dark";
}

/**
 * Apply theme mode to DOM
 */
function applyThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Remove both classes first
  root.classList.remove("light", "dark");

  // Add the appropriate class
  root.classList.add(mode);

  // Also set data attribute for CSS selectors
  root.setAttribute("data-theme-mode", mode);

  // Force a style recalculation
  void root.offsetHeight;
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Initialize immediately from localStorage or system preference
    if (typeof window === "undefined") return "dark";
    return getInitialThemeMode();
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Apply theme immediately on mount and whenever mode changes
  useEffect(() => {
    applyThemeMode(mode);
    setIsHydrated(true);
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}
