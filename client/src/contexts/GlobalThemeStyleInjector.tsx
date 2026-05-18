import { useEffect } from "react";
import { useThemeMode } from "./ThemeModeProvider";

/**
 * Inject global styles that override hardcoded colors based on theme mode
 * This is a workaround for components that use hardcoded colors
 */
export function GlobalThemeStyleInjector() {
  const { mode } = useThemeMode();

  useEffect(() => {
    // Remove old style if exists
    const oldStyle = document.getElementById("theme-override-styles");
    if (oldStyle) {
      oldStyle.remove();
    }

    // Create new style element
    const style = document.createElement("style");
    style.id = "theme-override-styles";

    if (mode === "light") {
      // Light mode: bright backgrounds, dark text
      style.textContent = `
        :root {
          --background: oklch(0.98 0.001 240) !important;
          --foreground: oklch(0.15 0.01 240) !important;
          --card: oklch(0.95 0.002 240) !important;
          --card-foreground: oklch(0.12 0.01 240) !important;
          --secondary-foreground: oklch(0.35 0.01 240) !important;
          --muted-foreground: oklch(0.45 0.01 240) !important;
        }
        
        body, html {
          background-color: oklch(0.98 0.001 240) !important;
          color: oklch(0.15 0.01 240) !important;
        }
        
        /* Improve secondary text readability */
        .text-muted-foreground {
          color: oklch(0.45 0.01 240) !important;
        }
        
        /* Improve heading readability */
        h1, h2, h3, h4, h5, h6 {
          color: oklch(0.12 0.01 240) !important;
        }
        
        /* Override hardcoded dark colors */
        [class*="bg-\\[#0d1117\\]"],
        [class*="bg-\\[#0A0A0A\\]"],
        [class*="bg-\\[#1a1a2e\\]"],
        [class*="bg-\\[#080c14\\]"],
        [class*="bg-\\[#141414\\]"] {
          background-color: oklch(0.95 0.002 240) !important;
        }
        
        /* Override hardcoded light text colors */
        [class*="text-\\[#f5f5f5\\]"],
        [class*="text-\\[#ffffff\\]"],
        [class*="text-white"] {
          color: oklch(0.20 0.01 240) !important;
        }
        
        /* Navbar */
        nav {
          background-color: oklch(0.98 0.001 240) !important;
          border-bottom: 1px solid oklch(0.90 0.01 240 / 40%) !important;
        }
        
        /* Cards and containers */
        [class*="rounded-lg"],
        [class*="rounded-xl"],
        .card {
          background-color: oklch(0.95 0.002 240) !important;
          color: oklch(0.15 0.01 240) !important;
        }
      `;
    } else {
      // Dark mode: dark backgrounds, light text with improved readability
      style.textContent = `
        :root {
          --background: oklch(0.11 0.015 240) !important;
          --foreground: oklch(0.96 0.003 240) !important;
          --card: oklch(0.14 0.015 240) !important;
          --card-foreground: oklch(0.96 0.003 240) !important;
          --secondary-foreground: oklch(0.92 0.008 240) !important;
          --muted-foreground: oklch(0.72 0.01 240) !important;
        }
        
        body, html {
          background-color: oklch(0.11 0.015 240) !important;
          color: oklch(0.96 0.003 240) !important;
        }
        
        /* Improve secondary text readability */
        .text-muted-foreground {
          color: oklch(0.72 0.01 240) !important;
        }
        
        /* Improve heading readability */
        h1, h2, h3, h4, h5, h6 {
          color: oklch(0.97 0.002 240) !important;
        }
      `;
    }

    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [mode]);

  return null;
}
